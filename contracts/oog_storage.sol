// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

// Replicates the storage-write pattern from the Ethereum deposit contract (EIP-2020) that exposed
// a Geth/Reth Firehose tracer discrepancy on Hoodi testnet (tx 0x835d...59d6):
//
//   SSTORE firstWrite
//   → SHA256 precompile call  (mirrors deposit contract Merkle tree step)
//   → SSTORE secondWrite
//   → OOG
//
// Both storage writes happen before the OOG.  A correct tracer must record both in
// the trace even though the call is state_reverted.
contract OOGStorage {
    bytes32 public firstWrite;
    bytes32 public secondWrite;

    // Same pattern as writeIntermediateCallWriteThenOOG but returns normally.
    // Used to estimate gas so the test can subtract COLD_SSTORE_SET_GAS (22 100)
    // and re-run with a gas limit that triggers OOG exactly on the second SSTORE.
    function writeIntermediateCallWrite(bytes32 a, bytes32 b) external {
        firstWrite = a;

        bytes32 h;
        assembly {
            mstore(0, a)
            if iszero(staticcall(gas(), 2, 0, 32, 32, 32)) { revert(0, 0) }
            h := mload(32)
        }

        secondWrite = bytes32(uint256(b) ^ uint256(h));
    }

    function writeIntermediateCallWriteThenOOG(bytes32 a, bytes32 b) external {
        firstWrite = a;

        // SHA256 precompile call — same pattern as the deposit contract's Merkle step.
        bytes32 h;
        assembly {
            mstore(0, a)
            if iszero(staticcall(gas(), 2, 0, 32, 32, 32)) { revert(0, 0) }
            h := mload(32)
        }

        secondWrite = bytes32(uint256(b) ^ uint256(h));

        // Exhaust any remaining gas so the call always ends with OOG (never returns cleanly).
        // Both SSTOREs above must have completed before reaching this point.
        assembly {
            for {} 1 {} {}
        }
    }
}
