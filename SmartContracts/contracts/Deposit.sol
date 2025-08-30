// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 a) external returns (bool);
    function transfer(address to, uint256 a) external returns (bool);
}

error AmountZero();
error InsufficientBalance();

contract VaultV1 {
    IERC20 public immutable asset;
    mapping(address => uint256) private _balances;
    uint256 public totalAssets;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address asset_) {
        if (asset_ == address(0)) revert AmountZero();
        asset = IERC20(asset_);
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }

    function deposit(uint256 amount) external {
        if (amount == 0) revert AmountZero();
        require(asset.transferFrom(msg.sender, address(this), amount), "TRANSFER_FROM_FAIL");
        _balances[msg.sender] += amount;
        totalAssets += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert AmountZero();
        uint256 bal = _balances[msg.sender];
        if (bal < amount) revert InsufficientBalance();
        _balances[msg.sender] = bal - amount;
        totalAssets -= amount;
        require(asset.transfer(msg.sender, amount), "TRANSFER_FAIL");
        emit Withdrawn(msg.sender, amount);
    }
}