import keythereum from "keythereum-pure-js"
import fs from "fs"
import path from "path"

const directory = path.join(__dirname, "..", "boot")

async function main() {
  if (process.argv.length > 2) {
    const address = process.argv.slice(-1)[0]
    const result = await recoverPrivateKey(directory, address)

    console.log(result.privateKey)
    return
  }

  const addresses = await getAddresses()

  console.log(`About to recover ${addresses.length} private keys (this takes 30s to 1m)`)
  const promises = addresses.map(async (address) => recoverPrivateKey(directory, address))

  const results = await Promise.all(promises)
  results.forEach((result) => {
    console.log(`- Address \`${result.address}\` => Private key \`${result.privateKey}\``)
  })
}

async function recoverPrivateKey(keystore: string, address: string) {
  const keyObject = await keythereum.importFromFile(address, keystore)
  const recoveredKey = await keythereum.recover("", keyObject)

  return { address, privateKey: recoveredKey.toString("hex") }
}

async function getAddresses(): Promise<string[]> {
  return fs
    .readdirSync(path.join(directory, "keystore"))
    .filter((x) => x != undefined && x.match(/^[0-9a-fA-F]{40}$/)) as string[]
}

main().catch((error) => {
  console.error(error)
})
