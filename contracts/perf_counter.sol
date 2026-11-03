// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Workload contract of the reth dev performance script: every call hashes `work` times, writes
// two storage slots and emits a log. `work` sets how much EVM time a transaction takes, so a block
// of calls exercises the execution and tracing paths with cheap or expensive transactions.
contract PerfCounter {
    mapping(address => uint256) public hits;
    uint256 public total;

    event Hit(address indexed sender, uint256 senderHits, uint256 total, bytes32 digest);

    function hit(uint256 work) public {
        bytes32 digest = bytes32(total);
        for (uint256 i = 0; i < work; i++) {
            digest = keccak256(abi.encodePacked(digest));
        }
        hits[msg.sender] += 1;
        total += 1;
        emit Hit(msg.sender, hits[msg.sender], total, digest);
    }
}
