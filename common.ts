import { readFile } from "fs";
import { promisify } from "util";
import { PromiEvent, TransactionReceipt, AbstractWeb3Module } from "web3-core";
import { Contract } from "web3-eth-contract";
import { Eth } from "web3-eth";

const asyncReadFile = promisify(readFile)

export function requireProcessEnv(name: string): string {
    const value = process.env[name]
    if (value == null) {
        console.error(`environment variable ${name} required`)
        process.exit(1)
    }

    return value!
}

export async function addressOrDefault(eth: Eth, input: string | null | undefined): Promise<string> {
    if (input != null) return input
    if (eth.defaultAccount != null) return eth.defaultAccount

    return await eth.getCoinbase()
}

export async function unlockAccount(eth: Eth, address: string) {
    // FIXME: All account must be created with an empty key
    //        Implement a read from env fallback to CLI if tty mechanism
    const succeed = await eth.personal.unlockAccount(address, "", 5000);
    if (!succeed) {
        throw new Error(`Unable to unlock account`)
    }
}

export async function readContract(eth: Eth, abiFilename: string): Promise<Contract> {
    const buffer = await asyncReadFile(abiFilename)

    return new eth.Contract(JSON.parse(buffer.toString()))
}

export async function readContractBin(filename: string): Promise<string> {
    const buffer = await asyncReadFile(filename)

    return "0x" + buffer.toString()
}

export function fullyExecuteAndLog<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
        event.once("transactionHash", (transactionHash) => { console.log(`Receivied transaction hash event: ${transactionHash}`)})
        event.on("confirmation", (confirmationNumber) => { console.log(`Received confirmation #${confirmationNumber}`)})
        event.once("receipt", (receipt) => {
            console.log(`Receivied receipt`, JSON.stringify(receipt, null, "  "))
            resolve(receipt)
        })
        event.once('error', (error) => {
            console.log("Received error", error)
            reject(error)
        })
    })
}

export function promisifyOnReceipt<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
        event.once('receipt', resolve).once('error', reject)
    })
}

export function promisifyOnFirstConfirmation<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
        event.once('confirmation', (_, receipt) => {
            // @ts-ignore
            event.removeAllListeners()
            resolve(receipt)
        }).once('error', reject)
    })
}
