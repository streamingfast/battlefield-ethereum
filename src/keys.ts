import keythereum from "keythereum-node"

async function main() {
  const keystore = "./boot"
  if (process.argv.length > 2) {
    const address = process.argv.slice(-1)[0]
    const result = await recoverPrivateKey(keystore, address)

    console.log(result.privateKey)
    return
  }

  // FIXME: Extract this automatically, for now it's a manual process with:
  //  - `ls boot/keystore/ | grep -v passphrase | cut -d - -f9`
  const promises = [
    "62d9ad344366c268c3062764bbf67d318ec2c8fd",
    "510416bbc94efd6df59bdecc3fa7db3b4c9fb188",
    "aadf939f53a1b9a3df7082bdc47d01083e8ebfad",
    "6b37cd0e93c15a00ab4dba8ef400b86ba41ecf26",
    "a9f5305752680406b1556235aa333abc34125414",
    "2ab0416d94cf6eb7ef617466bd027fe6cdda0079",
    "b7f2dcf6d9205fc15bb31dc09a7ce9d0279650d3",
    "8d8aff0301c00d4501e3e5d1affac10cc9bc5da5",
    "3f19e98ae43c673112445c9e4a0038ee8fa4c721",
    "a8016f1af8268eb39e414015dfd87b2a5a92aded",
  ].map(async (address) => recoverPrivateKey(keystore, address))

  const results = await Promise.all(promises)
  results.forEach((result) => {
    console.log(`Address ${result.address}: ${result.privateKey}`)
  })
}

async function recoverPrivateKey(keystore: string, address: string) {
  const keyObject = await keythereum.importFromFile(address, keystore)
  const recoveredKey = await keythereum.recover("", keyObject)

  return { address, privateKey: recoveredKey.toString("hex") }
}

main().catch((error) => {
  console.error(error)
})
