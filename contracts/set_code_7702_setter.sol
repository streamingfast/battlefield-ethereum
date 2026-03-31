// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @dev EIP-7702 test contract. When an EOA delegates to this contract via a SetCode
/// transaction, any call to that EOA will store 0x42 in storage slot 0x42.
/// Mirrors the 0xBBBB / 0xCCCC contracts in firehose_test.go TestFirehose_EIP7702.
contract SetCode7702Setter {
    receive() external payable {
        assembly {
            sstore(0x42, 0x42)
        }
    }

    fallback() external payable {
        assembly {
            sstore(0x42, 0x42)
        }
    }
}
