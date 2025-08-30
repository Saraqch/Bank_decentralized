// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DepositVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    mapping(address => uint256) private _balances;
    uint256 public totalAssets;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address asset_) {
        require(asset_ != address(0), "asset=0");
        asset = IERC20(asset_);
    }

    function balanceOf(address u) external view returns (uint256) { return _balances[u]; }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        totalAssets += amount;
        emit Deposited(msg.sender, amount);
    }

    function permitAndDeposit(
        uint256 amount,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external nonReentrant {
        require(amount > 0, "amount=0");
        IERC20Permit(address(asset)).permit(msg.sender, address(this), amount, deadline, v, r, s);
        asset.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        totalAssets += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        uint256 bal = _balances[msg.sender];
        require(bal >= amount, "insufficient");
        _balances[msg.sender] = bal - amount;
        totalAssets -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}