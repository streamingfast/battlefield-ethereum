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
                gasConsumedStorage = "really long string larger than 32 bytes to test out solidity splitting stuff";
            } else {
                gasConsumedStorage = "REALLY LONG STRING LARGER THAN 32 BYTES TO TEST OUT SOLIDITY SPLITTING STUFF";
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
        stringMap[
            "really long string larger than 32 bytes to test out solidity splitting stuff"
        ] = "a";
        nestedStringMap[
            "REALLY LONG STRING LARGER THAN 32 BYTES TO TEST OUT SOLIDITY SPLITTING STUFF"
        ]["really long string larger than 32 bytes to test out solidity splitting stuff"] = "a";

        shortString = "1234567890123456789012345678901";
        flushLongString = "12345678901234567890123456789012";
        longString = "really long string larger than 32 bytes to test out solidity splitting stuff";
        uintList.push(55);
        uintList.push(75);

        uintList.pop();

        return 120;
    }

    function setAfter() public {
        uintList[0] = 95;
        longString = "really long string larger than 32 bytes to test out solidity splitting stuff";
    }

    function longStringInput(string memory /* input */) public pure returns (uint256) {
        return 0;
    }
}
