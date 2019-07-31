import { join as pathJoin } from "path"
import Web3 from 'web3';
import { HttpProvider } from 'web3-providers'
import { addressOrDefault, readContract, promisifyOnFirstConfirmation } from "./common";
import { deployContract } from "./deploy";

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

    console.log("Peforming 'log' transactions")
    await okSend(mainContract.methods.logEmpty())
    await okSend(mainContract.methods.logSingle())
    await okSend(mainContract.methods.logAll())
    await okSend(mainContract.methods.logAllIndexed())
    await okSend(mainContract.methods.logAllMixed())
    await okSend(mainContract.methods.logMulti())
    console.log()

    // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
    console.log("Completed battlefield tests")
    process.exit(0)
}

async function getMainContract() {
    return readContract(web3.eth, pathJoin(__dirname, "./contract/build/Main.abi"))
}

async function okSend(trx: any, data?: any) {
    const result = send(trx, data)
    data = result.data

    const receipt = await promisifyOnFirstConfirmation(result.promiEvent)

    // See https://ethereum.stackexchange.com/a/6003
    if (receipt.gasUsed == data.gas) {
        console.log("Set value failed")
        console.log(`Transaction Hash: ${receipt.transactionHash}`)
        throw new Error(`Unexpected transaction ${receipt.transactionHash} failure`)
    }

    return
}

function send(trx: any, data?: any) {
    if (data === undefined) {
        data = {}
    }

    if (data.gas == undefined) {
        data.gas = 200000
    }

    if (data.gasPrice == undefined) {
        data.gasPrice = 1
    }

    if (data.from == undefined) {
        data.from = defaultAddress
    }

    return {
        data,
        promiEvent: trx.send(data),
    }
}

main().then(() => { console.log("Finished!") }).catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
})

