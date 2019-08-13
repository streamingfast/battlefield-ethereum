pragma solidity >=0.4.0 <0.7.0;

contract GrandChild {
    uint callerGas;
    uint callerGasLeft;
    uint gasLeft;

    constructor(address payable to) public payable {
        to.transfer(msg.value);
    }

    function recordGasLeft(uint _callerGas, uint _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();
    }

    function emptyCallForLowestGas() public pure {}
}