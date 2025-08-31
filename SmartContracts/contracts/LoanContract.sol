// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract LoanContract is Ownable {
    struct Loan {
        uint256 amount; //Borrowed amount
        uint256 collateral; // Collateral amount
        bool isActive; // Loan status
    }

    IERC20 public immutable collateralToken;
    IERC20 public immutable lendingToken;
    uint256 public collateralFactor; // Percentage of collateral allowed to be borrowed

    mapping(address => uint256) public collateralBalances; //User collateral balances
    mapping(address => Loan) public loans; // User loans

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdraw(address indexed user, uint256 amount);
    event LoanTaken(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);

    constructor(IERC20 _collateralToken, IERC20 _lendingToken, uint256 _collateralFactor) Ownable(msg.sender) {
        require(_collateralFactor <= 100, "Collateral factor must be <= 100");
        collateralToken = _collateralToken;
        lendingToken = _lendingToken;
        collateralFactor = _collateralFactor;
    }

    function setCollateralFactor(uint256 _newFactor) external onlyOwner {
        require(_newFactor <= 100,  "Collateral factor must be <= 100");
        collateralFactor = _newFactor;
    }

    function depositCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        collateralBalances[msg.sender] += _amount;
        collateralToken.transferFrom(msg.sender, address(this), _amount);
        emit CollateralDeposited(msg.sender, _amount);   
    }

    function withdrawCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greather than zero");
        require(collateralBalances[msg.sender] >= _amount , "Insuficient collateral");
        uint256 maxWithdrawable = collateralBalances[msg.sender] - _loanRequiredCollateral(msg.sender);
        require(_amount <= maxWithdrawable, "Cannot withdraw collateral locked for a loan");
        collateralBalances[msg.sender] -= _amount;
        collateralToken.transfer(msg.sender, _amount);
        emit CollateralWithdraw(msg.sender, _amount);
    }

    function takeLoan(uint256 _amount) external {
        require(_amount > 0, "Amount must be greather than zero");
        require(loans[msg.sender].isActive == false, "Existing loan must be repaid first");
        uint256 maxLoan = (collateralBalances[msg.sender] * collateralFactor) / 100;
        require(_amount <= maxLoan, "Loan exceeds collateral limit");
        loans[msg.sender] = Loan({
            amount: _amount,
            collateral: collateralBalances[msg.sender],
            isActive: true
        });
        lendingToken.transfer(msg.sender, _amount);
        emit LoanTaken(msg.sender, _amount);
    }

    function repayLoan(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        Loan storage userLoan = loans[msg.sender];
        require(userLoan.isActive, "No active loan");
        require(_amount <= userLoan.amount, "Repay amount exceeds loan");
        lendingToken.transferFrom(msg.sender, address(this), _amount);
        userLoan.amount -= _amount;
        if (userLoan.amount == 0) {
            userLoan.isActive = false;
        }
        emit LoanRepaid(msg.sender, _amount);
    }

    function _loanRequiredCollateral(address _user) internal view returns (uint256) {
        Loan memory userLoan = loans[_user];
        if (!userLoan.isActive) return 0;
        return (userLoan.amount * 100) / collateralFactor;
    }

    function getLoanDetails(address _user) external view returns (uint256 amount, uint256 collateral, bool isActive) {
        Loan memory userLoan = loans[_user];
        return (userLoan.amount, userLoan.collateral, userLoan.isActive);
    }
}
