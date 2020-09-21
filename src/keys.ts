import keythereum from "keythereum-node"

async function main() {
  const keystore = "./boot"

  const promises = [
    "ea143138dab9a14e11d1ae91e669851e6cc72131",
    "d549d2fd4b177767b84ab2fd17423cee1cf1d7bd",
    "545594058eb1dcb59add9ca2a0b13657122147ea",
  ].map(async (address) => {
    const keyObject = await keythereum.importFromFile(address, keystore)
    const recoveredKey = await keythereum.recover("", keyObject)

    return { address, privateKey: recoveredKey.toString("hex") }
  })

  const results = await Promise.all(promises)
  results.forEach((result) => {
    console.log(`Address ${result.address}: ${result.privateKey}`)
  })
}

main().catch((error) => {
  console.error(error)
})
