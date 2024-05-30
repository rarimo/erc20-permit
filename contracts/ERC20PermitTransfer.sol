// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import {IERC20PermitTransfer} from "./interfaces/IERC20PermitTransfer.sol";

contract ERC20PermitTransfer is IERC20PermitTransfer, Ownable {
    constructor(address owner_) Ownable(owner_) {}

    /**
     * @inheritdoc IERC20PermitTransfer
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
    ) external onlyOwner {
        // Make permit from ERC20 token for the exact amount to transfer. This function checks
        // permit signature and increases allowance for the transaction sender.
        ERC20Permit(token_).permit(
            owner_,
            address(this),
            amount_ + feeAmount_,
            deadline_,
            v_,
            r_,
            s_
        );

        // Transfer the tokens to the desired address.
        ERC20Permit(token_).transferFrom(owner_, recipient_, amount_);

        // Transfer the tokens for the commission to the sender to cover gas expenses.
        ERC20Permit(token_).transferFrom(owner_, msg.sender, feeAmount_);
    }
}
