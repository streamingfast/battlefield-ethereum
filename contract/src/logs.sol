pragma solidity >=0.6.6 <0.7.0;

contract Logs {
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

    function logAndTopLevelFail() public payable {
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);
        assert(false); // force failure
    }

    function logInSubFailedCallButTrxSucceed(address child) public payable {
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);

        (bool success, ) = child.call(abi.encodeWithSignature("logAndRevert()"));
        require(!success, "should have failed");
    }

    function logInSubSuccessCallButTrxFails(address child) public payable {
        emit eventLogAll(msg.data, gasleft(), msg.sender, msg.sig, 0);

        (bool success, ) = child.call(abi.encodeWithSignature("logAndSucceed()"));
        require(success, "should have succeed");

        assert(false); // force failure
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