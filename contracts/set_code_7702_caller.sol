// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @dev EIP-7702 test contract. When an EOA delegates to this contract via a SetCode
/// transaction, calling that EOA with callTarget(target) will forward 1 wei to target.
/// Mirrors the 0xAAAA contract in firehose_test.go TestFirehose_EIP7702.
contract SetCode7702Caller {
    function callTarget(address target) external payable {
        // Forward 1 wei to target (like the Go test's CALL opcode with value=1)
        (bool success, ) = target.call{ value: 1 }("");
        success; // ignore return value
    }
}
