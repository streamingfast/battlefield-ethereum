// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract SuicideContractAsBeneficiarySameTrx {
    function execute() public payable {
        SuicideContractAsBeneficiary deployment = new SuicideContractAsBeneficiary();

        address(deployment).transfer(msg.value);
        deployment.killSelf();
    }
}

contract SuicideContractAsBeneficiary {
    receive() external payable {
        // Accepts ether
    }

    function killSelf() public {
        (bool success, ) = address(this).call(abi.encodeWithSignature("kill()"));
        require(success, "call to kill() succeed");
    }

    function kill() public {
        selfdestruct(msg.sender);
    }
}
