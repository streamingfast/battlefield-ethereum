pragma solidity >=0.4.0 <0.7.0;

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
    function kill() public payable onlyOwner() {
        selfdestruct(owner);
    }
}

contract Suicidal is Owned, Mortal {
  function() external payable {}
}