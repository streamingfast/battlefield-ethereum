// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

contract CompleteCallTree {
    /**
     * Creates:
     *
     * Trx
     *  Call 1        (root, success)
     *    Call 2      (call, success)
     *    Call 3      (call, success)
     *      Call 4    (static call, success)
     *    Call 5      (call, success)
     *    Call 6      (call code, success)
     *    Call 7      (call code, failure)
     *    Call 8      (delegate call, success)
     *    Call 9      (static call, success)
     *    Call 10     (delegate call, failure)
     *    Call 11     (static call, failure)
     *    Call 12     (static call (precompiled), success)
     *    Call 13     (static call (precompiled), failure)
     *    Call 14     (create call, success)
     *
     * Depends on deployment child.sol and grandchild.sol contracts respectively.
     */
    function execute(address child, address grandChild) public payable {
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);

        uint256 callGasLimit = gasleft();
        (bool success, ) = child.call{gas: callGasLimit}(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callGasLimit = gasleft();

        (success, ) = child.call{gas: callGasLimit}(
            abi.encodeWithSignature("nestedRecordGasLeft(address,uint256,uint256)", grandChild, callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callGasLimit = gasleft();
        (success, ) = child.call{gas: callGasLimit}(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        // Create remaining call types
        uint256 value = msg.value;
        uint256 gasRemaining = gasleft();
        bytes4 signature = bytes4(keccak256("emptyCallForLowestGas()"));
        bytes memory output;
        assembly {
            let x := mload(0x40)
            mstore(x, signature)

            // Succeed
            let ignored := callcode(gasRemaining, child, value, x, 0x4, output, 0)

            // Failed (input is 0 length so call cannot be routed to method)
            ignored := callcode(gasRemaining, child, value, x, 0, output, 0)
        }

        (success, ) = child.delegatecall(abi.encodeWithSignature("emptyCallForLowestGas()"));
        (success, ) = child.staticcall(abi.encodeWithSignature("emptyCallForLowestGas()"));

        bytes memory empty;
        (success, ) = child.delegatecall(empty);
        (success, ) = child.staticcall(empty);

        // Succeed
        precompile0x07(0x0, 0x0);

        // Fails
        precompile0x07(0x123, 0x456);

        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);
    }

    function precompile0x07(uint256 ax, uint256 ay) private view {
        // Call a precompiled contract!
        uint256[2] memory result;
        uint256[3] memory input;
        input[0] = ax;
        input[1] = ay;
        input[2] = 3;

        assembly {
            let ignored := staticcall(10000, 0x07, input, 0x60, result, 0x40)
        }
    }

    event eventLogAll(bytes data, uint256 gas, address sender, bytes4 sig, uint256 value);
}
