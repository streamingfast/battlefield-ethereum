// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract Child {
    event eventGasLeft(uint256 gas, address sender);

    uint256 callerGas;
    uint256 callerGasLeft;
    uint256 gasLeft;

    function recordGasLeft(uint256 _callerGas, uint256 _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();
    }

    function emptyCallForLowestGas() public pure {}

    function nestedRecordGasLeft(
        address grandchild,
        uint256 _callerGas,
        uint256 _callerGasLeft
    ) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();

        uint256 callGasLimit = 1500000;

        (bool success, ) = grandchild.call{gas: callGasLimit}(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        emit eventGasLeft(gasleft(), msg.sender);
    }

    function nestedEmptyCallForLowestGas(address grandchild) public view {
        (bool success, ) = grandchild.staticcall(
            abi.encodeWithSignature("emptyCallForLowestGas()")
        );
        require(success, "should have succeed");
    }

    function nativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
    }

    function failNativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
        to.transfer(msg.value + 900000000000000);
    }

    uint256 asserValue;
    uint256 revertValue;

    function assertFailure() public {
        asserValue += asserValue + 1;
        assert(false);
    }

    function revertFailure() public {
        revertValue += revertValue + 1;
        revert("reverting");
    }

    function logAndSucceed() public {
        emit eventChildLog(msg.data, gasleft(), msg.sender, msg.sig);
    }

    function logAndRevert() public {
        emit eventChildLog(msg.data, gasleft(), msg.sender, msg.sig);
        revert("reverting");
    }
    event eventChildLog(bytes data, uint256 gas, address sender, bytes4 sig);

    function logValue() public payable {
        emit eventValue(msg.value, tx.origin, msg.sender, gasLeft, msg.data);
    }
    event eventValue(
        uint256 indexed value,
        address indexed txOrigin,
        address indexed sender,
        uint256 gasLeft,
        bytes data
    );
}
