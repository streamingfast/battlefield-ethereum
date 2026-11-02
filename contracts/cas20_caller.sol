// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface ICAS20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

// Calls a BSC CAS20 token from contract code, so its precompile call sits below the root call.
// Transfers spend this contract's own token balance.
contract CAS20Caller {
    event Before(uint256 amount);
    event Between(uint256 amount);
    event Result(bool ok);

    // Two transfers in one transaction, with this contract's logs around them: the token's logs
    // and storage changes must interleave with the caller's in execution order.
    function transferTwice(ICAS20 token, address to, uint256 first, uint256 second) external {
        emit Before(first);
        token.transfer(to, first);
        emit Between(second);
        token.transfer(to, second);
    }

    // The transfer succeeds, then this frame reverts: the token call keeps its writes and logs in
    // the trace, marked reverted by its parent.
    function transferThenRevert(ICAS20 token, address to, uint256 amount) external {
        token.transfer(to, amount);
        revert("after transfer");
    }

    // Calls transfer with a fixed gas allowance and carries on whatever the outcome.
    function transferWithGas(ICAS20 token, address to, uint256 amount, uint256 callGas) external {
        (bool ok, ) = address(token).call{gas: callGas}(abi.encodeCall(ICAS20.transfer, (to, amount)));
        emit Result(ok);
    }
}
