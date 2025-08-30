import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("P2PLending (step1)", function () {
  it("should create an offer", async () => {
    const [lender] = await ethers.getSigners();
    const P2PLending = await ethers.getContractFactory("P2PLending");
    const lending = await P2PLending.deploy();

    const tx = await lending.connect(lender).createOffer(1000, 7 * 24 * 3600);
    const receipt = await tx.wait();

    const id = receipt.logs[0].args.id;
    const loan = await lending.loans(id);
    expect(loan.lender).to.equal(lender.address);
  });

  it("should accept an offer", async () => {
  const [lender, borrower] = await ethers.getSigners();
  const P2PLending = await ethers.getContractFactory("P2PLending");
  const lending = await P2PLending.deploy();

  const tx = await lending.connect(lender).createOffer(1000, 3600);
  const receipt = await tx.wait();
  const id = receipt.logs[0].args.id;

  await lending.connect(borrower).acceptOffer(id);
  const loan = await lending.loans(id);
  expect(loan.borrower).to.equal(borrower.address);
  });

  it("should allow borrower to repay", async () => {
  const [lender, borrower] = await ethers.getSigners();
  const P2PLending = await ethers.getContractFactory("P2PLending");
  const lending = await P2PLending.deploy();

  const tx = await lending.connect(lender).createOffer(1000, 3600);
  const receipt = await tx.wait();
  const id = receipt.logs[0].args.id;

  await lending.connect(borrower).acceptOffer(id);
  await lending.connect(borrower).repay(id, 500);

  const loan = await lending.loans(id);
  expect(loan.repaid).to.equal(500);
  });

});