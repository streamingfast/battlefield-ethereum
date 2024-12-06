// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract Transfers {
    function nativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
    }

    function nestedNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call{value: msg.value}(abi.encodeWithSignature("nativeTransfer(address)", to));
        require(success, "should have succeed");
    }

    function nestedFailedNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call{value: msg.value - 1}(abi.encodeWithSignature("failNativeTransfer(address)", to));
        require(!success, "should have failed");
        (bool success2, ) = child.call{value: msg.value - 2}(abi.encodeWithSignature("nativeTransfer(address)", to));
        require(success2, "should have succeed");
    }
}
