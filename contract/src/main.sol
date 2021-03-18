pragma solidity >=0.6.6 <0.7.0;

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

    address latestAddress;

    //
    /// Transfers
    //

    function nativeTransfer(address payable to) public payable {
        to.transfer(msg.value);
    }

    function nestedNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call{value: msg.value}(
            abi.encodeWithSignature("nativeTransfer(address)", to)
        );
        require(success, "should have succeed");
    }

    function nestedFailtNativeTransfer(address child, address payable to) public payable {
        (bool success, ) = child.call{value: msg.value - 1}(
            abi.encodeWithSignature("failNativeTransfer(address)", to)
        );
        require(!success, "should have failed");
        (bool success2, ) = child.call{value: msg.value - 2}(
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
     */
    function completeCallTree(address child, address grandChild) public payable {
        callTreeIndex = 0xca110001;

        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);

        uint256 callGasLimit = 0x30000;
        (bool success, ) = child.call{gas: callGasLimit}(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callTreeIndex = 0xca110002;

        callGasLimit = 0x40000;

        (success, ) = child.call{gas: callGasLimit}(
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
        (success, ) = child.call{gas: callGasLimit}(
            abi.encodeWithSignature("recordGasLeft(uint256,uint256)", callGasLimit, gasleft())
        );
        require(success, "should have succeed");

        callTreeIndex = 0xca110004;

        // Create remaing call types
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
        //revertValue += revertValue - 1;
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

    function allPrecompiled() public {
        latestAddress = ecrecover(
            0xdaf5a779ae972f972197303d7b574746c7ef83eadac0f2791ad23db92e4c8e53,
            0x25,
            0x28ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276,
            0x67cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83
        );

        bytes memory inputSha256 = abi.encodeWithSignature("revertFailure()");
        sha256(inputSha256);

        precompile0x07(0x00, 0x00);
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

    //
    /// Gas
    //

    string gasConsumedStorage;

    function emptyCallForLowestGas() public pure {}

    function nestedCallForLowestGas(address child) public view {
        (bool success, ) = child.staticcall(abi.encodeWithSignature("emptyCallForLowestGas()"));
        success;
    }

    function nestedLowGas(address child) public {
        uint256 callGasLimit = 2500000;

        (bool success, ) = child.call{gas: callGasLimit}(
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

        (bool success, ) = child.call{gas: callGasLimit}(
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

        uintList.pop();

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
