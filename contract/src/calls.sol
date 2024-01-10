pragma solidity >=0.6.6 <0.7.0;

contract Calls {
    event eventLogAll(bytes data, uint256 gas, address sender, bytes4 sig, uint256 value);

    address latestAddress;
    uint256 callTreeIndex;

    function contractWithConstructor() public {
        new ContractConstructor(bytes32("testing"));
    }

    function contractWithFailingConstructor() public {
        new ContractFailingConstructor(true);
    }

    function contractWithEmptyConstructor() public {
        new ContractEmpty();
    }

    function contracFailingRecursiveConstructor() public {
        new ContractTopConstructorOkThenFailing();
    }

    event ContractDeployed(address indexed deployed_to);

    function contractSuicideThenCall() public payable {
        ContractSuicide deployment = new ContractSuicide(msg.sender);

        emit ContractDeployed(address(deployment));

        deployment.createContract();

        (bool successKill, bytes memory resultRawKill) = address(deployment).call(
            abi.encodeWithSignature("kill()")
        );
        require(successKill, "call to kill() succeed");
        require(resultRawKill.length == 0);

        // Contract suicided at this point
        deployment.createContract();

        (bool successKill2, bytes memory resultRawKill2) = address(deployment).call(
            abi.encodeWithSignature("kill()")
        );
        require(successKill2, "call to kill() failed");
        require(resultRawKill2.length == 0);

        (bool successTransferToValue, ) = address(deployment).call(
            abi.encodeWithSignature("transferToValue(address,uint256)", msg.sender, 1)
        );

        require(
            !successTransferToValue,
            "call to transferToValue(address,uint256) should have failed"
        );

        (bool successTransferToSuicided, ) = payable(address(deployment)).call{value: 1}("");
        require(!successTransferToSuicided, "Transfer after suicide should revert");
    }

    function contractFixedAddressSuicideThenTryToCreateOnSameAddress() public payable {
        bytes32 salt = "some salt";

        ContractSuicideNoConstructor deployment = new ContractSuicideNoConstructor{salt: salt}();
        emit ContractDeployed(address(deployment));

        address ownerInit = deployment.owner();
        require(ownerInit == 0x0000000000000000000000000000000000000000);

        deployment.setOwner(msg.sender);
        address ownerBefore = deployment.owner();
        require(ownerBefore == msg.sender);

        (bool successKill2, bytes memory resultRawKill2) = address(deployment).call(
            abi.encodeWithSignature("kill()")
        );
        require(successKill2, "call to kill() failed");
        require(resultRawKill2.length == 0);

        address ownerAfter = deployment.owner();
        require(ownerAfter == msg.sender);
    }

    function contractCreate2(
        bytes memory code,
        uint256 transferAmount,
        uint256 salt,
        bool revertOnFailure
    ) public {
        address addr;
        assembly {
            addr := create2(transferAmount, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                if revertOnFailure {
                    revert(0, 0)
                }
            }
        }
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

contract ContractSuicide {
    address payable public owner;

    constructor(address payable _owner) public {
        owner = _owner;
    }

    function kill() public payable returns (bool) {
        selfdestruct(owner);

        return true;
    }

    function transferToFromMsg(address payable receiver) public payable {
        receiver.transfer(msg.value);
    }

    function transferToValue(address payable receiver, uint256 value) public payable {
        receiver.transfer(value);
    }

    event ContractDeployed(address indexed deployed_to);

    function createContract() public {
        ContractSuicideNoConstructor deployment = new ContractSuicideNoConstructor();
        emit ContractDeployed(address(deployment));
    }
}

contract ContractSuicideNoConstructor {
    address payable public owner;

    constructor() public {}

    function setOwner(address payable _owner) public {
        owner = _owner;
    }

    function kill() public payable returns (bool) {
        selfdestruct(owner);

        return true;
    }

    event ContractDeployed(address indexed deployed_to);

    function createContract() public {
        ContractFailingConstructor deployment = new ContractFailingConstructor(false);
        emit ContractDeployed(address(deployment));
    }
}

contract ContractFailingConstructor {
    constructor(bool fail) public {
        if (fail) {
            assert(false);
        }
    }
}

contract ContractTopConstructorOkThenFailing {
    constructor() public {
        new ContractFailingConstructor(true);
    }
}
