// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract PolygonFeeCallReverted {
    function run() public payable {
        address self = address(this);

        (bool success, ) = self.call{value: msg.value}(abi.encodeWithSignature("any()"));
    }

    function any() public payable {
        address payable empty = address(0);

        empty.transfer(msg.value);

        // This function is intentionally left empty to simulate a call that reverts.
        revert("This call should revert");
    }
}
