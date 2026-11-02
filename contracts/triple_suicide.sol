// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract TripleSuicideChild {
    function kill(address payable beneficiary) public {
        selfdestruct(beneficiary);
    }
}

contract TripleSuicide {
    function createAndDestroyThree() public {
        TripleSuicideChild child1 = new TripleSuicideChild();
        TripleSuicideChild child2 = new TripleSuicideChild();
        TripleSuicideChild child3 = new TripleSuicideChild();

        child1.kill(msg.sender);
        child2.kill(msg.sender);
        child3.kill(msg.sender);
    }
}
