pragma solidity >=0.4.0 <0.7.0;

contract Main {
    event eventLogEmpty();
    event eventLogSingle(string payload);
    event eventLogAll(bytes data, uint gas, address sender, bytes4 sig, uint value);
    event eventLogAllIndexed(bytes indexed data, uint indexed gas, address indexed sender);
    event eventLogMixedIndexed(bytes indexed data, uint indexed gas, address indexed sender, bytes4 sig, uint value);

    function logEmpty() public {
        emit eventLogEmpty();
    }

    function logSingle() public {
        emit eventLogSingle("payload as string");
    }

    function logAll() public payable {
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
    }

    function logAllIndexed() public payable {
        emit eventLogAllIndexed(msg.data, gasleft(), msg.sender);
    }

    function logAllMixed() public payable {
        emit eventLogMixedIndexed(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
    }

    function logMulti() public payable {
        emit eventLogEmpty();
        emit eventLogSingle("payload as string");
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
        emit eventLogAllIndexed(msg.data, gasleft(), msg.sender);
        emit eventLogMixedIndexed(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
    }
}