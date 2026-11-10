// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IArbSys {
    function withdrawEth(address destination) external payable returns (uint256);
}

// Calls Arbitrum's ArbSys precompile from contract code, so the precompile call and its logs sit
// below the root call, as they do for bridge contracts.
contract ArbSysCaller {
    IArbSys constant ARB_SYS = IArbSys(address(100));

    event Withdrawn(uint256 position);

    function withdraw(address destination) external payable {
        uint256 position = ARB_SYS.withdrawEth{value: msg.value}(destination);
        emit Withdrawn(position);
    }
}
