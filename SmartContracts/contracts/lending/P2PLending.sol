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
    }

    uint256 public nextId;
    mapping(uint256 => Loan) public loans;

    event OfferCreated(uint256 indexed id, address indexed lender, uint256 principal, uint256 duration);

    function createOffer(uint256 principal, uint256 duration) external returns (uint256 id) {
        require(principal > 0, "principal=0");
        require(duration > 0, "duration=0");

        id = nextId++;
        loans[id] = Loan(msg.sender, address(0), principal, duration, 0, 0);

        emit OfferCreated(id, msg.sender, principal, duration);
    }
}