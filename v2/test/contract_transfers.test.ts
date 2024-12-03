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
import { owner, ownerAddress } from "./global"

use(firehoseEthereumMatchers)

describe("Contract transfers", function () {
  let Main: Main
  let Child: Child

  before(async () => {
    const MainContract = await hre.ethers.getContractFactory("Main")

    const deployContract = async function (
      factory: ContractFactory,
      contractSetter: (result: any) => void
    ) {
      const trx = await factory.getDeployTransaction({ from: ownerAddress })
      const response = await owner.sendTransaction(trx)
      const out = await response.wait(1, 2500)

      contractSetter(factory.attach(out!.contractAddress!))
    }

    await deployContract(MainContract, (result: any) => (Main = result))
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
