// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract P2PLending {
    struct Loan {
        address lender;
        address borrower;
        uint256 principal;
        uint256 duration;
        uint256 startTs;
        uint256 dueTs;
        uint256 repaid;
    }

    uint256 public nextId;
    mapping(uint256 => Loan) public loans;

    event OfferCreated(uint256 indexed id, address indexed lender, uint256 principal, uint256 duration);
    event LoanAccepted(uint256 indexed id, address indexed borrower, uint256 startTs, uint256 dueTs);
    event Repaid(uint256 indexed id, address indexed borrower, uint256 amount, uint256 totalRepaid);

    function createOffer(uint256 principal, uint256 duration) external returns (uint256 id) {
        require(principal > 0, "principal=0");
        require(duration > 0, "duration=0");

        id = nextId++;
        loans[id] = Loan(msg.sender, address(0), principal, duration, 0, 0, 0);

        emit OfferCreated(id, msg.sender, principal, duration);
    }

    function acceptOffer(uint256 id) external {
        Loan storage L = loans[id];
        require(L.lender != address(0), "no offer");
        require(L.borrower == address(0), "already accepted");

        L.borrower = msg.sender;
        L.startTs = block.timestamp;
        L.dueTs = block.timestamp + L.duration;

        emit LoanAccepted(id, msg.sender, L.startTs, L.dueTs);
    }

    function repay(uint256 id, uint256 amount) external {
        Loan storage L = loans[id];
        require(L.borrower == msg.sender, "not borrower");
        require(L.startTs > 0, "not active");
        require(amount > 0, "amount=0");

        L.repaid += amount;

        emit Repaid(id, msg.sender, amount, L.repaid);
    }
}