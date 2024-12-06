pragma solidity >=0.6.6 <0.7.0;

contract GrandChild {
    uint256 callerGas;
    uint256 callerGasLeft;
    uint256 gasLeft;

    constructor(address payable to, bool fail) public payable {
        // to.transfer(msg.value);
        // if (fail) {
        //     to.transfer(msg.value + 9000000000000000);
        // }
    }

    function recordGasLeft(uint256 _callerGas, uint256 _callerGasLeft) public {
        callerGas = _callerGas;
        callerGasLeft = _callerGasLeft;
        gasLeft = gasleft();

        emit eventGasLeft(gasleft(), msg.sender);
    }

    function emptyCallForLowestGas() public pure {}

    event eventGasLeft(uint256 gas, address sender);
}
