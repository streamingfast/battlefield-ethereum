import { join as pathJoin } from "path"
import Web3 from 'web3';
import { HttpProvider } from 'web3-providers'
import { addressOrDefault, readContract, promisifyOnFirstConfirmation, fullyExecuteAndLog, unlockAccount } from "./common";
import { deployContract } from "./deploy";
import { TransactionConfig } from "web3-core";

let web3 = new Web3(new HttpProvider('http://localhost:8545'));
let defaultAddress = ""

async function main() {
    defaultAddress = await addressOrDefault(web3.eth, process.env["FROM_ADDRESS"])
    console.log("Configuration")
    console.log(` Default address: ${defaultAddress}`)
    console.log()

    console.log("Deploying contracts...")
    const mainDeployment = await deployContract(web3, defaultAddress, "Main")

    const mainContract = await getMainContract()
    mainContract.address = mainDeployment.contractAddress

    console.log("Contracts")
    console.log(` Main: ${mainDeployment.contractAddress}`)
    console.log()

    console.log("Performing 'non-contract' transactions")
    await promisifyOnFirstConfirmation(web3.eth.sendTransaction({
        from: defaultAddress,
        to: "0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd",
        value: 1e18,
    }))

    await promisifyOnFirstConfirmation(web3.eth.sendTransaction({
        from: defaultAddress,
        to: "0x0000000000000000000000000000000000000001",
        value: 1e18,
    }))

    console.log("Performing 'misc' transactions")
    await okSend(mainContract.methods.setLongString())
    await okSend(mainContract.methods.setAfter())

    console.log("Performing 'log' transactions")
    await okSend(mainContract.methods.logEmpty())
    await okSend(mainContract.methods.logSingle())
    await okSend(mainContract.methods.logAll())
    await okSend(mainContract.methods.logAllIndexed())
    await okSend(mainContract.methods.logAllMixed())
    await okSend(mainContract.methods.logMulti())

    // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
    console.log("Completed battlefield tests")
    process.exit(0)
}

async function waitFor(timeInMs: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeInMs)
    })
}

async function getMainContract() {
    return readContract(web3.eth, pathJoin(__dirname, "./contract/build/Main.abi"))
}

async function okSend(trx: any, transactionConfig?: TransactionConfig) {
    const result = send(trx, transactionConfig)
    transactionConfig = result.transactionConfig

    const receipt = await promisifyOnFirstConfirmation(result.promiEvent)

    // See https://ethereum.stackexchange.com/a/6003
    if (receipt.gasUsed == transactionConfig!.gas) {
        console.log(`Transaction '${receipt.transactionHash}' failed`)
        throw new Error(`Unexpected transaction ${receipt.transactionHash} failure`)
    }

    return
}

function send(trx: any, transactionConfig?: TransactionConfig) {
    if (transactionConfig === undefined) {
        transactionConfig = {}
    }

    if (transactionConfig.gas == undefined) {
        transactionConfig.gas = 93999999
    }

    if (transactionConfig.gasPrice == undefined) {
        transactionConfig.gasPrice = 1
    }

    if (transactionConfig.from == undefined) {
        transactionConfig.from = defaultAddress
    }

    return {
        transactionConfig,
        promiEvent: trx.send(transactionConfig),
    }
}

main().then(() => { console.log("Finished!") }).catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
})

