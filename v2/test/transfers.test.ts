// import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect, use } from "chai"
import hre from "hardhat"
import { knownExistingAddress } from "./addresses"
import { NonceManager, getBytes } from "ethers"
import { executeTransactions, sendEth, sendImmediateEth } from "./trxs"
import { oneWeiF, wei } from "./money"
import {
  balanceChangeDelta,
  fetchFirehoseTransaction,
  gasChange,
  nonceChangeDelta,
  rootCallFromReceipt,
  trxTraceFromReceipt,
} from "./firehose"
import { BalanceChange_Reason, GasChange_Reason } from "../pb/sf/ethereum/type/v2/type_pb"
import { addFirehoseEthereumMatchers as firehoseEthereumMatchers } from "./fireeth_assertions"
import { chainStaticInfo, initChainStaticInfo } from "./chain"

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

    executeTransactions(sendImmediateEth(owner, knownExistingAddress, wei(1)))
  })

  it("Transfer to existing address", async function () {
    const receipt = await sendEth(owner, knownExistingAddress, wei(1))
    const trace = await fetchFirehoseTransaction(receipt)

    expect(trace).to.trxTraceEqualSnapshot("./snapshots/transfer-existing-address.json", receipt)

    // expect(trace).to.trxTraceEqual(
    //   trxTraceFromReceipt(receipt, {
    //     beginOrdinal: 13n,
    //     endOrdinal: 22n,
    //     calls: [
    //       rootCallFromReceipt(receipt, {
    //         beginOrdinal: 0n,
    //         endOrdinal: 20n,
    //         value: oneWeiF,
    //         nonceChanges: [nonceChangeDelta(receipt.from, 1, 16)],
    //         balanceChanges: [
    //           balanceChangeDelta(receipt.from, -168000, 14, BalanceChange_Reason.GAS_BUY),
    //           balanceChangeDelta(receipt.from, -1, 18, BalanceChange_Reason.TRANSFER),
    //           balanceChangeDelta(receipt.to!, 1, 19, BalanceChange_Reason.TRANSFER),
    //           balanceChangeDelta(
    //             chainStaticInfo.coinbase,
    //             21000,
    //             21,
    //             BalanceChange_Reason.REWARD_TRANSACTION_FEE
    //           ),
    //         ],
    //         gasChanges: [gasChange(21000, 0, 15, GasChange_Reason.INTRINSIC_GAS)],
    //       }),
    //     ],
    //   })
    // )
  })

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
