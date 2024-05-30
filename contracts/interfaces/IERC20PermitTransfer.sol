// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20PermitTransfer {
    /**
     * @notice Transfer tokens with permit.
     *
     * This function makes transfer from with permitting amount from the ERC20 token.
     * First of all method calls permit method in the initial token for the message sender and
     * exact amount of tokens to make transfer and cover fee amount (this values have to be
     * calculated and changed off-chain). Next step is to make transfer to the original recipient and the
     * last action is to make transfer fee to the transaction sender.
     *
     * @param token_ address of the token ERC20 token to interact with.
     * @param owner_ coins holder from which balance tokens will be transferred.
     * @param recipient_ address to which the original transfer is created.
     * @param amount_ tokens amount to transfer for original transfer.
     * @param feeAmount_ amount of tokens to be transferred to the transaction sender as fee coverage.
     * @param deadline_ permit deadline value.
     * @param v_ the parity of the y coordinate of R.
     * @param r_ permit the x coordinate of R value of the signature .
     * @param s_ permit the x coordinate of S value of the signature .
     *
     * Requirements:
     *  - block timestamp higher than `deadline_` value;
     *  - ECDSA signature signer is equal to the `owner_` parameter;
     *  - `owner_`, `recipient_` and spender for approving and transferring are non zero addresses;
     *  - current allowance for spender is lower than max uint256 value and higher than transferred
     *    amount;
     */
    function transferWithPermit(
        address token_,
        address owner_,
        address recipient_,
        uint256 amount_,
        uint256 feeAmount_,
        uint256 deadline_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_
    ) external;
}
