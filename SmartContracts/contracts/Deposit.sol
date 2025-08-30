// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

interface IERC20Lite {
    function transferFrom(address from, address to, uint256 a) external returns (bool);
    function transfer(address to, uint256 a) external returns (bool);
}

error AmountZero();
error InsufficientBalance();
error ZeroAddress();

contract VaultV2 is Ownable, Pausable {
    IERC20Lite public immutable asset;
    mapping(address => uint256) private _balances;
    uint256 public totalAssets;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address asset_, address owner_) Ownable(owner_) {
        if (asset_ == address(0)) revert ZeroAddress();
        asset = IERC20Lite(asset_);
    }

    function balanceOf(address u) external view returns (uint256) { return _balances[u]; }

    function deposit(uint256 amount) external whenNotPaused {
        if (amount == 0) revert AmountZero();
        require(asset.transferFrom(msg.sender, address(this), amount), "TRANSFER_FROM_FAIL");
        _balances[msg.sender] += amount;
        totalAssets += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        if (amount == 0) revert AmountZero();
        uint256 bal = _balances[msg.sender];
        if (bal < amount) revert InsufficientBalance();
        _balances[msg.sender] = bal - amount;
        totalAssets -= amount;
        require(asset.transfer(msg.sender, amount), "TRANSFER_FAIL");
        emit Withdrawn(msg.sender, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function emergencySweep(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        require(asset.transfer(to, amount), "SWEEP_FAIL");
    }
}