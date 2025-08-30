// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BankManager is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public lastAccrued;
    mapping(address => uint256) public lastDepositTs;
    uint256 public totalAssets;

    uint256 public ratePerSec;
    uint256 public rewardPool;

    uint256 public maxDepositPerTx;
    uint256 public maxWithdrawPerTx;
    uint256 public withdrawCooldown;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Accrued(address indexed user, uint256 interest);
    event RewardsFunded(uint256 amount);
    event RateUpdated(uint256 ratePerSec);
    event LimitsUpdated(uint256 maxDep, uint256 maxWdr, uint256 cooldown);

    constructor(
        address asset_,
        uint256 ratePerSec_,
        uint256 maxDep_,
        uint256 maxWdr_,
        uint256 cooldown_
    ) Ownable(msg.sender) {
        require(asset_ != address(0), "asset=0");
        asset = IERC20(asset_);
        ratePerSec = ratePerSec_;
        maxDepositPerTx = maxDep_;
        maxWithdrawPerTx = maxWdr_;
        withdrawCooldown = cooldown_;
    }

    function setRate(uint256 r) external onlyOwner { ratePerSec = r; emit RateUpdated(r); }
    function setLimits(uint256 maxDep, uint256 maxWdr, uint256 cooldown) external onlyOwner {
        maxDepositPerTx = maxDep; maxWithdrawPerTx = maxWdr; withdrawCooldown = cooldown;
        emit LimitsUpdated(maxDep, maxWdr, cooldown);
    }
    function fundRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "amount=0");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardsFunded(amount);
    }

    // --- interés ---
    function _accrue(address user) internal {
        uint256 last = lastAccrued[user];
        uint256 bal = balanceOf[user];
        if (bal == 0) { lastAccrued[user] = block.timestamp; return; }
        uint256 dt = (last == 0) ? 0 : (block.timestamp - last);
        if (dt == 0) { lastAccrued[user] = block.timestamp; return; }

        uint256 interest = (bal * ratePerSec * dt) / 1e18;
        if (interest > rewardPool) interest = rewardPool;
        if (interest > 0) {
            balanceOf[user] += interest;
            totalAssets += interest;
            rewardPool -= interest;
            emit Accrued(user, interest);
        }
        lastAccrued[user] = block.timestamp;
    }

    function previewAccrued(address user) external view returns (uint256) {
        uint256 last = lastAccrued[user];
        uint256 bal = balanceOf[user];
        if (bal == 0 || last == 0) return 0;
        uint256 dt = block.timestamp - last;
        return (bal * ratePerSec * dt) / 1e18;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");
        if (maxDepositPerTx > 0) require(amount <= maxDepositPerTx, "max deposit");
        _accrue(msg.sender);
        asset.safeTransferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
        totalAssets += amount;
        lastDepositTs[msg.sender] = block.timestamp;
        if (lastAccrued[msg.sender] == 0) lastAccrued[msg.sender] = block.timestamp;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount=0");
        if (maxWithdrawPerTx > 0) require(amount <= maxWithdrawPerTx, "max withdraw");
        if (withdrawCooldown > 0) require(block.timestamp >= lastDepositTs[msg.sender] + withdrawCooldown, "cooldown");
        _accrue(msg.sender);
        uint256 bal = balanceOf[msg.sender];
        require(bal >= amount, "insufficient");
        balanceOf[msg.sender] = bal - amount;
        totalAssets -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}