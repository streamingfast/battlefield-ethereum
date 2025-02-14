// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract DelegateToEmptyContract {
    function run() public {
        address empty;

        (bool success, ) = empty.delegatecall(abi.encodeWithSignature("any()"));
    }
}
