pragma solidity >=0.4.0 <0.7.0;

contract GrandChild {
    uint callerGas;
    uint callerGasLeft;
    uint gasLeft;

    constructor(address payable to, bool fail) public payable {
        to.transfer(msg.value);
        if (fail) {
            to.transfer(msg.value + 9000000000000000);
        }
    }

    function recordGasLeft(uint _callerGas, uint _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();

        emit eventGasLeft(gasleft(), msg.sender);
    }

    function emptyCallForLowestGas() public pure {}

    event eventGasLeft(uint gas, address sender);
}