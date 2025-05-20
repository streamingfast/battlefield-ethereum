// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ERC20Predicate {
    function CHAINID() external view returns (uint256);
    function interpretStateUpdate(bytes memory state) external view returns (bytes memory);
    function networkId() external view returns (bytes memory);
    function onFinalizeExit(bytes memory data) external;
    function startExitForIncomingErc20Transfer(bytes memory data, bytes memory exitTx)
        external
        payable
        returns (address, uint256);
    function startExitForOutgoingErc20Transfer(bytes memory data, bytes memory exitTx)
        external
        payable
        returns (address, uint256);
    function startExitWithBurntTokens(bytes memory data) external;
    function verifyDeprecation(bytes memory exit, bytes memory inputUtxo, bytes memory challengeData)
        external
        returns (bool);
}
