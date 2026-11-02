// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AmsterdamHelper {
    // Fresh contracts start with every slot at zero, so a single call against a
    // freshly deployed instance is always a genuine 0 -> non-zero SSTORE
    // (EIP-8037 state gas).
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue;
    }

    // Forwards the transaction's value into a CREATE2 deployment (EIP-7708
    // value-transferring CREATE2 case). Payable so the caller can fund the
    // deployment directly without needing to pre-fund this contract's balance.
    function create2WithValue(bytes memory code, uint256 salt) public payable returns (address addr) {
        assembly {
            addr := create2(callvalue(), add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
    }
}

// Deployable via CREATE/CREATE2 while carrying value: a non-payable constructor rejects any
// msg.value, so a genuine value-transferring deployment needs this instead of e.g. ContractEmpty.
contract PayableEmpty {
    constructor() payable {}
}
