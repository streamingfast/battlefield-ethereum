// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.6 <0.7.0;

// Used to verify that the gas refund balance change records oldValue from the
// post-gas-buy state, not the (reverted) value-transfer state.
contract GasRefund {
    uint256 gasConsumingValue;

    function consumeGasTransferAndRevert(address payable to) public payable {
        gasConsumingValue += 1;
        to.transfer(msg.value);
        revert("intentional revert");
    }
}
