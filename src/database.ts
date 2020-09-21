import Web3 from "web3"
import { HttpProvider } from "web3-providers"
import level from "level-ts"

const database = new level("./database")

// import { path } from "path"
// import { levelup } from "levelup"
// import { leveldown } from "leveldown"

// db = level('./testdb'),

const web3 = new Web3(new HttpProvider("http://localhost:8545"))

async function main() {
  const block = await web3.eth.getBlock("4")

  console.log(
    `Block #${block.number} - State Root ${block.stateRoot}, Transaction Root ${block.transactionRoot}, Receipt Root ${block.receiptRoot}`
  )
}

function datbaseConnect() {
  /**
   * Level DB
   */
  var levelDBPath = path.relative("./", "/Users/User/Library/Ethereum/ropsten/geth/chaindata")
  var db = levelup(leveldown(levelDBPath))
}

main()
  .then(() => {
    console.log("Finished!")
  })
  .catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
  })
