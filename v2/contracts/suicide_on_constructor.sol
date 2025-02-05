// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract SuicideOnConstructor {
    address owner;

    constructor() public {
        owner = msg.sender;
        selfdestruct(msg.sender);
    }
}
