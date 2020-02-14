import { join as pathJoin } from "path"
import Web3 from "web3"
import { PromiEvent, TransactionReceipt, TransactionConfig } from "web3-core"
import BN from "bn.js"
import { HttpProvider } from "web3-providers"
import {
  readContract,
  promisifyOnFirstConfirmation,
  requireProcessEnv,
  initialDefaultAddress,
  sendRawTx,
  createRawTx,
  setDefaultTxOptions,
  getDefaultGasConfig,
  isUnsetDefaultGasConfig
} from "./common"
import { ContractSendMethod, Contract } from "web3-eth-contract"
import { deployContract, deployContractRaw, DeploymentResult, DeployerOptions } from "./deploy"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { throws } from "assert"

export type Network = "local" | "ropsten"

type Doer<T> = (() => T) | (() => Promise<T>)

const emptyDeploymentState = () => ({
  main: { contractAddress: "", transactionHash: "" },
  child: { contractAddress: "", transactionHash: "" },
  grandChild: { contractAddress: "", transactionHash: "" },
  suicidal1: { contractAddress: "", transactionHash: "" },
  suicidal2: { contractAddress: "", transactionHash: "" }
})

type DeploymentState = {
  main: DeploymentResult
  child: DeploymentResult
  grandChild: DeploymentResult
  suicidal1: DeploymentResult
  suicidal2: DeploymentResult
}

type DeploymentContracts = Record<keyof DeploymentState, Contract>

interface ResolvedSendOptions {
  from: string
  to: string
  gasPrice: string
  gas: number
  value: number | string | BN
  data?: string
}

export class BattlefieldRunner {
  // Going to be fully initialize in the `initialize` call
  defaultAddress: string = ""
  deploymentState: DeploymentState = emptyDeploymentState()
  contracts: DeploymentContracts = {
    main: null as any,
    child: null as any,
    grandChild: null as any,
    suicidal1: null as any,
    suicidal2: null as any
  }

  deployer: (name: string, options?: DeployerOptions) => Promise<DeploymentResult>

  deploymentStateFile: string
  network: Network
  privateKey?: Buffer
  rpcEndpoint: string
  web3: Web3

  only?: RegExp

  constructor(network: Network) {
    this.network = network
    this.deploymentStateFile = ""
    this.deployer = this.deployRpcContract

    this.rpcEndpoint = process.env["RPC_ENDPOINT"] || ""
    if (this.network == "local") {
      this.rpcEndpoint = "http://localhost:8545"
    }

    if (!this.rpcEndpoint) {
      this.rpcEndpoint = this.forNetwork({
        local: "http://localhost:8545",
        ropsten: "https://ropsten.infura.io/json-rpc/"
      })
    }

    this.doForNetwork({
      local: () => {
        this.deployer = this.deployRpcContract
      },
      ropsten: () => {
        this.deployer = this.deployRawContract

        this.deploymentStateFile = pathJoin(__dirname, `./${this.network}-deployment-state.json`)
        this.defaultAddress = requireProcessEnv("FROM_ADDRESS")
        this.privateKey = Buffer.from(requireProcessEnv("PRIVATE_KEY"), "hex")
      }
    })

    this.web3 = new Web3(new HttpProvider(this.rpcEndpoint))
  }

  async initialize() {
    await this.doForNetwork({
      local: async () => {
        this.defaultAddress = await initialDefaultAddress(
          this.web3.eth,
          process.env["FROM_ADDRESS"]
        )
      },
      ropsten: async () => {
        setDefaultTxOptions({ chain: "ropsten", hardfork: "istanbul" })
      }
    })

    this.deploymentState = await this.loadDeploymentState()
  }

  async loadDeploymentState(): Promise<DeploymentState> {
    return await this.doForNetwork({
      local: async () => this.deploymentState,
      ropsten: this.loadDeploymentStateFromFile
    })
  }

  loadDeploymentStateFromFile = async (): Promise<DeploymentState> => {
    if (existsSync(this.deploymentStateFile)) {
      const content = readFileSync(this.deploymentStateFile)

      return JSON.parse(content.toString())
    }

    return this.deploymentState
  }

  async deployContract(
    contract: keyof DeploymentState,
    source: string,
    options?: DeployerOptions
  ): Promise<DeploymentResult> {
    if (isDeployed(contract, this.deploymentState)) {
      console.log(`Contract ${contract} already deployed for network ${this.network}`)
      return this.deploymentState[contract]
    }

    return await this.deployer(source, options)
  }

  async deployContracts(): Promise<DeploymentState> {
    this.deploymentState = {
      main: await this.deployContract("main", "Main"),
      child: await this.deployContract("child", "Child"),
      grandChild: await this.deployContract("grandChild", "Grandchild", {
        contractArguments: ["0x0000000000000000000000000000000000000330", false],
        value: "25000"
      }),
      suicidal1: await this.deployContract("suicidal1", "Suicidal"),
      suicidal2: await this.deployContract("suicidal2", "Suicidal")
    }

    if (isAnyDeployed(this.deploymentState)) {
      console.log(
        `(Delete or edit file '${this.deploymentStateFile}' to force a re-deploy to new addresses)`
      )
    }

    if (this.network != "local") {
      writeFileSync(this.deploymentStateFile, JSON.stringify(this.deploymentState, null, "  "))
    }

    await this.initializeContracts()

    return this.deploymentState
  }

  async initializeContracts() {
    this.contracts = {
      main: await this.getContract("Main", this.deploymentState["main"].contractAddress),
      child: await this.getContract("Child", this.deploymentState["child"].contractAddress),
      grandChild: await this.getContract(
        "Grandchild",
        this.deploymentState["grandChild"].contractAddress
      ),
      suicidal1: await this.getContract(
        "Suicidal",
        this.deploymentState["suicidal1"].contractAddress
      ),
      suicidal2: await this.getContract(
        "Suicidal",
        this.deploymentState["suicidal2"].contractAddress
      )
    }
  }

  async okTransfer(
    tag: string,
    from: string | "default",
    to: string,
    value: string | number | BN,
    options?: TransactionConfig
  ) {
    options = { ...options, from, value, to }

    return this.okSend(tag, options, async (resolvedOptions) => {
      if (this.network == "local") {
        return { promiEvent: this.web3.eth.sendTransaction(resolvedOptions) }
      }

      const tx = await createRawTx(
        this.web3,
        resolvedOptions.from,
        this.privateKey!,
        resolvedOptions
      )

      return { txHash: tx.hash(), promiEvent: sendRawTx(this.web3, tx) }
    })
  }

  async okContractSend(
    tag: string,
    contract: keyof DeploymentState,
    trx: ContractSendMethod,
    options?: TransactionConfig
  ) {
    return this.okSend(tag, options, async (resolvedOptions) => {
      if (this.network == "local") {
        return { promiEvent: (trx.send(resolvedOptions) as any) as PromiEvent<TransactionReceipt> }
      }

      const tx = await createRawTx(this.web3, resolvedOptions.from, this.privateKey!, {
        ...resolvedOptions,
        to: this.contracts[contract].address,
        data: trx.encodeABI()
      })

      return { txHash: tx.hash(), promiEvent: sendRawTx(this.web3, tx) }
    })
  }

  async okSend(
    tag: string,
    options: TransactionConfig | undefined,
    eventFactory: (
      options: ResolvedSendOptions
    ) => Promise<{
      txHash?: Buffer
      promiEvent: PromiEvent<TransactionReceipt>
    }>
  ) {
    if (this.only && !tag.match(this.only)) {
      return ""
    }

    const resolvedOptions = this.mergeSendOptionsWithDefaults(options)

    let trxHashString: string = ""
    try {
      const { txHash, promiEvent } = await eventFactory(resolvedOptions)
      if (txHash && (process.env["DEBUG"] === "true" || process.env["DEBUG"] === "*")) {
        trxHashString = this.trxHashAsString(txHash.toString("hex"))
        console.log(`Pending transaction hash '${trxHashString}' (${tag})`)
      }

      const receipt = await promisifyOnFirstConfirmation(promiEvent)
      trxHashString = this.trxHashAsString(receipt.transactionHash)

      // See https://ethereum.stackexchange.com/a/6003
      //
      // The lowest value of gas for a pure transfer is 21000. Since we do some of them,
      // let's not count equal gas for this value as an error, while it could still be
      // an error, Gosh!
      if (receipt.gasUsed == resolvedOptions.gas && resolvedOptions.gas != 21000) {
        console.log(`Transaction '${trxHashString}' failed (${tag})`)
        throw new Error(`Unexpected transaction ${trxHashString} failure (${tag})`)
      }

      console.log(`Pushed transaction '${trxHashString}' (${tag})`)
      return receipt.transactionHash
    } catch (error) {
      console.log(`Transaction '${trxHashString}' (${tag}) failed`, error)
      throw new Error(`Unexpected transaction failure`)
    }
  }

  trxHashAsString(hash: string) {
    if (this.network == "local") {
      return hash
    }

    return this.ethqTxLink(hash)
  }

  mergeSendOptionsWithDefaults(options?: TransactionConfig): ResolvedSendOptions {
    const defaults: TransactionConfig = {
      from: this.defaultAddress
    }

    if (!isUnsetDefaultGasConfig()) {
      defaults.gas = getDefaultGasConfig().gasLimit
      defaults.gasPrice = getDefaultGasConfig().gasPrice
    }

    const resolved = { ...defaults, ...(options || {}) }
    if (resolved.from === "default") {
      resolved.from = this.defaultAddress
    }

    return resolved as ResolvedSendOptions
  }

  printConfiguration() {
    console.log("Configuration")
    console.log(` Network: ${this.network}`)
    console.log(
      ` Default address: ${
        this.network === "local"
          ? this.defaultAddress
          : this.etherscanLink("/address/" + this.defaultAddress)
      }`
    )
    console.log(` RPC Endpoint: ${this.rpcEndpoint}`)

    if (this.privateKey) {
      console.log(` Private key: ${this.privateKey.toString("hex").slice(0, 32) + "..."}`)
    }

    console.log()
  }

  printContracts() {
    console.log()
    console.log("Contracts")
    console.log(`- main       | ${this.contracts["main"].address}`)
    console.log(`- child      | ${this.contracts["child"].address}`)
    console.log(`- grandChild | ${this.contracts["grandChild"].address}`)
    console.log(`- suicidal1  | ${this.contracts["suicidal1"].address}`)
    console.log(`- suicidal2  | ${this.contracts["suicidal2"].address}`)

    if (this.network != "local") {
      console.log("")
      console.log("Transaction Links")
      console.log(`- main       | ${this.ethqTxLink(this.deploymentState.main.transactionHash)}`)
      console.log(`- child      | ${this.ethqTxLink(this.deploymentState.child.transactionHash)}`)
      console.log(
        `- grandChild | ${this.ethqTxLink(this.deploymentState.grandChild.transactionHash)}`
      )
      console.log(
        `- suicidal1  | ${this.ethqTxLink(this.deploymentState.suicidal1.transactionHash)}`
      )
      console.log(
        `- suicidal2  | ${this.ethqTxLink(this.deploymentState.suicidal2.transactionHash)}`
      )
    }
  }

  ethqLink(path: string): string {
    let baseUrl = ""
    if (this.network === "ropsten") {
      baseUrl = "https://ropsten.ethq.app"
    }

    return `${baseUrl}${path}`
  }

  ethqTxLink(hash: string): string {
    return this.ethqLink(`/tx/${hash}`)
  }

  etherscanLink(path: string): string {
    let baseUrl = ""
    if (this.network === "ropsten") {
      baseUrl = "https://ropsten.etherscan.io"
    }

    return `${baseUrl}${path}`
  }

  async getContract(contractName: string, address: string) {
    const abiPath = pathJoin(__dirname, `./contract/build/${contractName}.abi`)

    const contract = await readContract(this.web3.eth, abiPath)
    contract.address = address

    return contract
  }

  forNetwork<T>(mappings: Record<Network, T>): T {
    const result = mappings[this.network]
    if (result == null) {
      console.error(
        `invalid network configuration ${this.network} using ${JSON.stringify(mappings)}`
      )
      process.exit(1)
    }

    return result
  }

  async doForNetwork<T>(mappings: Record<Network, Doer<T> | undefined>): Promise<T> {
    const result = mappings[this.network]
    if (result == null) {
      console.error(
        `invalid network configuration ${this.network} using ${JSON.stringify(mappings)}`
      )
      process.exit(1)
    }

    return result!()
  }

  deployRpcContract = async (
    name: string,
    options?: DeployerOptions
  ): Promise<DeploymentResult> => {
    return await deployContract(this.web3, this.defaultAddress, name, options)
  }

  deployRawContract = async (
    name: string,
    options?: DeployerOptions
  ): Promise<DeploymentResult> => {
    return await deployContractRaw(this.web3, this.defaultAddress, this.privateKey!, name, options)
  }

  doNothing: any = () => {}
}

function isDeployed(contract: keyof DeploymentState, deploymentState: DeploymentState): boolean {
  return deploymentState[contract].contractAddress != ""
}

function isAnyDeployed(deploymentState: DeploymentState): boolean {
  return (
    deploymentState.main.contractAddress !== "" ||
    deploymentState.child.contractAddress !== "" ||
    deploymentState.grandChild.contractAddress !== "" ||
    deploymentState.suicidal1.contractAddress !== "" ||
    deploymentState.suicidal2.contractAddress !== ""
  )
}
