// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 a) external returns (bool);
    function transfer(address to, uint256 a) external returns (bool);
}

contract VaultV0 {
    IERC20Minimal public immutable asset;
    mapping(address => uint256) public balanceOf;
    uint256 public totalAssets;

    constructor(address asset_) {
        require(asset_ != address(0), "asset=0");
        asset = IERC20Minimal(asset_);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(asset.transferFrom(msg.sender, address(this), amount), "pull fail");
        balanceOf[msg.sender] += amount;
        totalAssets += amount;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount=0");
        uint256 bal = balanceOf[msg.sender];
        require(bal >= amount, "insufficient");
        balanceOf[msg.sender] = bal - amount;
        totalAssets -= amount;
        require(asset.transfer(msg.sender, amount), "push fail");
    }
}