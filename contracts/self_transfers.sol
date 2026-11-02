// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

contract SelfTransfers {
    // Required so the contract can receive ETH via address(this).transfer(...)
    receive() external payable {}

    // Transfers msg.value to address(this) then always reverts.
    // Used directly for the "root call reverts after self-transfer" case and
    // as the inner target for the "nested self-transfer reverts" case.
    function selfTransferThenRevert() external payable {
        payable(address(this)).transfer(msg.value);
        revert("intentional revert after self transfer");
    }

    // Calls selfTransferThenRevert on address(this) with the full msg.value.
    // The inner call reverts; this function asserts that and returns normally,
    // so the root call succeeds while the child self-transfer is state-reverted.
    function nestedSelfTransferThenRevert() external payable {
        (bool success, ) = address(this).call{value: msg.value}(
            abi.encodeWithSignature("selfTransferThenRevert()")
        );
        require(!success, "inner call should have reverted");
    }
}
