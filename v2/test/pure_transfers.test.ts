// import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect, use } from "chai"
import hre from "hardhat"
import {
  knownExistingAddress,
  randomAddress1,
  randomAddress1Hex,
  randomAddress2,
  randomAddress2Hex,
} from "./lib/addresses"
import { ContractFactory, NonceManager, getBytes } from "ethers"
import { executeTransactions, sendEth, sendImmediateEth } from "./lib/trxs"
import { oneWei, wei } from "./lib/money"
import { addFirehoseEthereumMatchers as firehoseEthereumMatchers } from "./lib/fireeth_assertions"
import { initChainStaticInfo } from "./lib/chain"
import { Child, Main } from "../typechain-types"

use(firehoseEthereumMatchers)

describe("Pure transfers", function () {
  var owner: NonceManager
  var ownerAddress: string
  var ownerAddressBytes: Uint8Array

  before(async () => {
    const [first] = await hre.ethers.getSigners()

    // first and owner are the same here, but first is of type HardhatSigner and have .address already resolved
    owner = new hre.ethers.NonceManager(first)
    ownerAddress = first.address
    ownerAddressBytes = getBytes(ownerAddress)

    // Do not wait for this to finish, other stuff will fail if it's not fast enough of if provider is broken
    initChainStaticInfo(hre.ethers.provider).then(() => {})

    const MainContract = await hre.ethers.getContractFactory("Main")
    const ChildContract = await hre.ethers.getContractFactory("Child")

    let Main: Main | null = null
    let Child: Child | null = null

    const deployContract = async function (
      factory: ContractFactory,
      contractSetter: (result: any) => void
    ) {
      const trx = await factory.getDeployTransaction({ from: ownerAddress })
      const response = await owner.sendTransaction(trx)
      const out = await response.wait(1, 2500)

      contractSetter(factory.attach(out!.contractAddress!))
    }

    executeTransactions(sendImmediateEth(owner, knownExistingAddress, wei(1)))

    await deployContract(MainContract, (result: any) => (Main = result as Main))
    await deployContract(ChildContract, (result: any) => (Child = result as Child))

    // await contractCall(owner, Main!.longStringInput, "Hello, World!")
  })

  it("Transfer to existing address", async function () {
    await expect(sendEth(owner, knownExistingAddress, oneWei)).to.trxTraceEqualSnapshot(
      "transfer/existing_address.expected.json"
    )
  })

  it("Transfer existing address with custom gas limit", async function () {
    await expect(
      sendEth(owner, knownExistingAddress, oneWei, {
        gasLimit: 75000,
      })
    ).to.trxTraceEqualSnapshot("transfer/existing_address_custom_gas_limit.expected.json")
  })

  it("Transfer inexistent address creates account and has an EVM call", async function () {
    await expect(sendEth(owner, randomAddress1, oneWei)).to.trxTraceEqualSnapshot(
      "transfer/inexistent_address.expected.json",
      {
        $randomAddress1: randomAddress1Hex,
      }
    )
  })

  it("Transfer of 0 ETH to inexistent address generates a transaction with no EVM call", async function () {
    await expect(sendEth(owner, randomAddress2, 0)).to.trxTraceEqualSnapshot(
      "transfer/zero_eth_inexistent_address.expected.json",
      {
        $randomAddress2: randomAddress2Hex,
      }
    )
  })

  // it("pure transfer: to precompile address", async function () {
  //   await expect(
  //     sendEth(owner, precompileWithBalance, oneWei, { gasLimit: 75000 })
  //   ).to.trxTraceEqualSnapshot("./snapshots/pure_transfer_precompile_address.json")
  // })

  // describe("Pure transfers", function () {
  //   //   it("Should set the right owner", async function () {
  //   //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);
  //   //     expect(await lock.owner()).to.equal(owner.address);
  //   //   });
  //   //   it("Should receive and store the funds to lock", async function () {
  //   //     const { lock, lockedAmount } = await loadFixture(
  //   //       deployOneYearLockFixture
  //   //     );
  //   //     expect(await hre.ethers.provider.getBalance(lock.target)).to.equal(
  //   //       lockedAmount
  //   //     );
  //   //   });
  //   //   it("Should fail if the unlockTime is not in the future", async function () {
  //   //     // We don't use the fixture here because we want a different deployment
  //   //     const latestTime = await time.latest();
  //   //     const Lock = await hre.ethers.getContractFactory("Lock");
  //   //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //   //       "Unlock time should be in the future"
  //   //     );
  //   //   });
  //   // });
  //   // describe("Withdrawals", function () {
  //   //   describe("Validations", function () {
  //   //     it("Should revert with the right error if called too soon", async function () {
  //   //       const { lock } = await loadFixture(deployOneYearLockFixture);
  //   //       await expect(lock.withdraw()).to.be.revertedWith(
  //   //         "You can't withdraw yet"
  //   //       );
  //   //     });
  //   //     it("Should revert with the right error if called from another account", async function () {
  //   //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //   //         deployOneYearLockFixture
  //   //       );
  //   //       // We can increase the time in Hardhat Network
  //   //       await time.increaseTo(unlockTime);
  //   //       // We use lock.connect() to send a transaction from another account
  //   //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //   //         "You aren't the owner"
  //   //       );
  //   //     });
  //   //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //   //       const { lock, unlockTime } = await loadFixture(
  //   //         deployOneYearLockFixture
  //   //       );
  //   //       // Transactions are sent using the first signer by default
  //   //       await time.increaseTo(unlockTime);
  //   //       await expect(lock.withdraw()).not.to.be.reverted;
  //   //     });
  //   //   });
  //   //   describe("Events", function () {
  //   //     it("Should emit an event on withdrawals", async function () {
  //   //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //   //         deployOneYearLockFixture
  //   //       );
  //   //       await time.increaseTo(unlockTime);
  //   //       await expect(lock.withdraw())
  //   //         .to.emit(lock, "Withdrawal")
  //   //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //   //     });
  //   //   });
  //   //   describe("Transfers", function () {
  //   //     it("Should transfer the funds to the owner", async function () {
  //   //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //   //         deployOneYearLockFixture
  //   //       );
  //   //       await time.increaseTo(unlockTime);
  //   //       await expect(lock.withdraw()).to.changeEtherBalances(
  //   //         [owner, lock],
  //   //         [lockedAmount, -lockedAmount]
  //   //       );
  //   //     });
  //   //   });
  // })
})
