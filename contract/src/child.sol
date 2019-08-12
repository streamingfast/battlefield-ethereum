pragma solidity >=0.4.0 <0.7.0;

contract Child {
    uint callerGas;
    uint callerGasLeft;
    uint gasLeft;

    function recordGasLeft(uint _callerGas, uint _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();
    }

    function emptyCallForLowestGas() public pure {}

    function nestedRecordGasLeft(address grandchild, uint _callerGas, uint _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();

        uint callGasLimit = 1500000;

        (bool success, ) = grandchild.call.gas(callGasLimit)(abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft()));
        require(success, "should have succeed");
    }

    function nestedEmptyCallForLowestGas(address grandchild) public view {
        (bool success, ) = grandchild.staticcall(abi.encodeWithSignature("emptyCallForLowestGas()"));
        require(success, "should have succeed");
    }

    function nativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
    }

    uint asserValue;
    uint revertValue;

    function assertFailure() public {
        asserValue += asserValue + 1;
        assert(false);
    }

    function revertFailure() public {
        revertValue += revertValue + 1;
        assert(false);
    }
}