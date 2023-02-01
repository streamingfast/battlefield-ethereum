pragma solidity >=0.6.6 <0.7.0;

contract Owned {
    address payable owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }
}

contract Mortal is Owned {
    function kill() public payable onlyOwner {
        selfdestruct(owner);
    }
}

contract Suicidal is Owned, Mortal {
    receive() external payable {}

    event ContractDeployed(address indexed deployed_to);

    function createContract() public {
        Dummy deployment = new Dummy();
        emit ContractDeployed(address(deployment));
    }
}

contract Dummy {
    constructor() public {}
}
