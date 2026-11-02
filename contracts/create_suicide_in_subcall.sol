// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

// Reproduces the "create + suicide-in-constructor in a subcall" pattern observed
// on Optimism (e.g. trx 0x1be5b6c3521d98512c7bd4f28090aabf8a39e392cc846c13ed8325a27cdbbece):
// a wrapper contract performs `new Child()` from a subcall, and the child's
// constructor immediately self-destructs. Because the create and destroy happen
// inside the same transaction, EIP-6780 still removes the child fully, so
// finalization writes a nonce 1->0 reset for the child to the root call.

contract CreateSuicideInSubcallChild {
    constructor() public {
        selfdestruct(msg.sender);
    }
}

contract CreateSuicideInSubcall {
    function execute() public {
        new CreateSuicideInSubcallChild();
    }
}
