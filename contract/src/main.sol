pragma solidity >=0.4.0 <0.7.0;

contract Main {
    string shortString;
    string flushLongString;
    string longString;
    uint256[] uintList;
    point myPoint;

    mapping(string => point) stringToPointMap;
    mapping(string => string) stringMap;
    mapping(string => mapping(string => string)) nestedStringMap;
    mapping(uint256 => string) intToStringMap;
    mapping(string => uint256[]) stringToIntListMap;

    struct point {
        uint256 x;
        uint256 y;
    }

    //
    /// Transfers
    //

    function nativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
    }

    function nestedNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call.value(msg.value)(
            abi.encodeWithSignature("nativeTransfer(address)", to)
        );
        require(success, "should have succeed");
    }

    function nestedFailtNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call.value(msg.value - 1)(
            abi.encodeWithSignature("failNativeTransfer(address)", to)
        );
        require(!success, "should have failed");
        (bool success2, ) = child.call.value(msg.value - 2)(
            abi.encodeWithSignature("nativeTransfer(address)", to)
        );
        require(success2, "should have succeed");
    }

    //
    /// Calls & Constructors
    //

    uint256 callTreeIndex;

    function contractWithConstructor() public {
        new ContractConstructor(bytes32("testing"));
    }

    function contractWithEmptyConstructor() public {
        new ContractEmpty();
    }

    /**
     * Creates:
     *
     * Trx
     *  Call 1
     *    Call2
     *    Call 3
     *      Call 4
     *    Call 5
     *    Call 6
     *    Call 7
     *    Call 8
     */
    function completeCallTree(address child, address grandChild) public {
        callTreeIndex = 0xca110001;

        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);

        uint256 callGasLimit = 0x30000;
        (bool success, ) = child.call.gas(callGasLimit)(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callTreeIndex = 0xca110002;

        callGasLimit = 0x40000;

        (success, ) = child.call.gas(callGasLimit)(
            abi.encodeWithSignature(
                "nestedRecordGasLeft(address,uint256,uint256)",
                grandChild,
                callGasLimit,
                gasleft()
            )
        );
        require(success, "should have succeed");

        callTreeIndex = 0xca110003;

        callGasLimit = 0x50000;
        (success, ) = child.call.gas(callGasLimit)(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callTreeIndex = 0xca110004;

        // Create remaing call types
        // FIXME: Add callcode call, either need to compile with solc < 5.0 or understand how to do it in opcode "assembly"
        child.delegatecall(abi.encodeWithSignature("emptyCallForLowestGas()"));
        child.staticcall(abi.encodeWithSignature("emptyCallForLowestGas()"));
        new ContractEmpty();

        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);
    }

    uint256 asserValue;
    uint256 revertValue;

    function assertFailure() public {
        asserValue += asserValue + 1;
        assert(false);
        asserValue += asserValue - 1;
    }

    function revertFailure() public {
        revertValue += revertValue + 1;
        revert("forced revert");
        revertValue += revertValue - 1;
    }

    function nestedAssertFailure(address child) public payable {
        asserValue += asserValue + 1;

        (bool success, ) = child.call(abi.encodeWithSignature("assertFailure()"));
        require(!success, "should have failed");

        asserValue += asserValue - 1;
    }

    function nestedRevertFailure(address child) public payable {
        revertValue += revertValue + 1;

        (bool success, ) = child.call(abi.encodeWithSignature("revertFailure()"));
        require(!success, "should have failed");

        revertValue += revertValue - 1;
    }

    //
    /// Gas
    //

    string gasConsumedStorage;

    function emptyCallForLowestGas() public pure {}

    function nestedCallForLowestGas(address child) public view {
        child.staticcall(abi.encodeWithSignature("emptyCallForLowestGas()"));
    }

    function nestedLowGas(address child) public {
        uint256 callGasLimit = 2500000;

        (bool success, ) = child.call.gas(callGasLimit)(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");
    }

    function deepNestedCallForLowestGas(address child, address grandChild) public view {
        (bool success, ) = child.staticcall(
            abi.encodeWithSignature("nestedEmptyCallForLowestGas(address)", grandChild)
        );
        require(success, "should have succeed");
    }

    function deepNestedLowGas(address child, address grandChild) public {
        uint256 callGasLimit = 2500000;

        (bool success, ) = child.call.gas(callGasLimit)(
            abi.encodeWithSignature(
                "nestedRecordGasLeft(address,uint256,uint256)",
                grandChild,
                callGasLimit,
                gasleft()
            )
        );
        require(success, "should have succeed");
    }

    function consumeAllGas() public {
        uint256 counter = 0;
        while (true) {
            if (counter % 2 == 0) {
                gasConsumedStorage = "realy long string larger than 32 bytes to test out solidity splitting stuff";
            } else {
                gasConsumedStorage = "REALY LONG STRING LARGER THAN 32 BYTES TO TEST OUT SOLIDITY SPLITTING STUFF";
            }
        }
    }

    //
    /// Storages & Inputs
    //

    function setLongString() public returns (uint256) {
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

    function longStringInput(
        string memory /* input */
    ) public pure returns (uint256) {
        return 0;
    }

    //
    /// Logs
    //

    function logEmpty() public {
        emit eventLogEmpty();
    }

    function logSingle() public {
        emit eventLogSingle(
            "payload as string",
            "really long string larger than 32 bytes to test out solidity splitting stuff"
        );
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
        emit eventLogSingle(
            "payload as string",
            "really long string larger than 32 bytes to test out solidity splitting stuff"
        );
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
        emit eventLogAllIndexed(msg.data, gasleft(), msg.sender);
        emit eventLogMixedIndexed(msg.data, gasleft(), msg.sender, msg.sig, msg.value);
    }

    event eventLogEmpty();
    event eventLogSingle(string indexed payload, string secondPayload);
    event eventLogAll(bytes data, uint256 gas, address sender, bytes4 sig, uint256 value);
    event eventLogAllIndexed(bytes indexed data, uint256 indexed gas, address indexed sender);
    event eventLogMixedIndexed(
        bytes indexed data,
        uint256 indexed gas,
        address indexed sender,
        bytes4 sig,
        uint256 value
    );
}

contract ContractEmpty {
    constructor() public {}
}

contract ContractConstructor {
    bytes32 public Name;
    constructor(bytes32 name) public {
        Name = name;
    }
}
