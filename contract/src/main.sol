pragma solidity >=0.4.0 <0.7.0;

contract Main {
    string shortString;
    string flushLongString;
    string longString;
    uint[] uintList;
    point myPoint;

    mapping(string => point) stringToPointMap;
    mapping(string => string) stringMap;
    mapping(string => mapping(string => string)) nestedStringMap;
    mapping(uint => string) intToStringMap;
    mapping(string => uint[]) stringToIntListMap;

    struct point {
        uint x;
        uint y;
    }

    event eventLogEmpty();
    event eventLogSingle(string payload, string secondPayload);
    event eventLogAll(bytes data, uint gas, address sender, bytes4 sig, uint value);
    event eventLogAllIndexed(bytes indexed data, uint indexed gas, address indexed sender);
    event eventLogMixedIndexed(bytes indexed data, uint indexed gas, address indexed sender, bytes4 sig, uint value);

    function setLongString() public returns (uint) {
        stringToPointMap["a"].x = 10;
        stringToPointMap["a"].y = 20;

        myPoint.x = 30;
        myPoint.y = 40;

        uintList.push(55);
        uintList[0] = 75;

        stringToIntListMap["short string"].push(3);
        stringToIntListMap["short string"][0] = 256;

        intToStringMap[3] = "b";
        stringMap["realy long string larger than 32 bytes to test out solidity splitting stuff"] = "a";
        nestedStringMap["REALY LONG STRING LARGER THAN 32 BYTES TO TEST OUT SOLIDITY SPLITTING STUFF"]["realy long string larger than 32 bytes to test out solidity splitting stuff"] = "a";

        shortString = "1234567890123456789012345678901";
        flushLongString = "12345678901234567890123456789012";
        longString = "realy long string larger than 32 bytes to test out solidity splitting stuff";
        uintList.push(55);
        uintList.push(75);

        uintList.length--;

        return 120;
    }

    function setAfter() public {
        uintList[0] = 95;
        longString = "really long string larger than 32 bytes to test out solidity splitting stuff";
    }

    function logEmpty() public {
        emit eventLogEmpty();
    }

    function logSingle() public {
        emit eventLogSingle("payload as string", "really long string larger than 32 bytes to test out solidity splitting stuff");
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
        emit eventLogSingle("payload as string", "really long string larger than 32 bytes to test out solidity splitting stuff");
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
        emit eventLogAllIndexed(msg.data, gasleft(), msg.sender);
        emit eventLogMixedIndexed(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
    }
}