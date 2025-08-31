import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

const { ethers } = hre;

const DECIMALS = 18;
const toUnits = (n) => ethers.parseUnits(n.toString(), DECIMALS);

describe("BankManager", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();

    // Token
    const Mock = await ethers.getContractFactory("MockERC20");
    const usdt = await Mock.deploy("Mock USDT", "USDT", DECIMALS);
    await usdt.waitForDeployment();

    // Rate: ~12% APR => perSec = 0.12e18 / 365d
    const perSec = toUnits(0.12) / BigInt(365 * 24 * 3600);

    // Limits: maxDep 1,000; maxWdr 600; cooldown 1 day
    const maxDep = toUnits(1000);
    const maxWdr = toUnits(600);
    const cooldown = 24 * 3600;

    // BankManager
    const Bank = await ethers.getContractFactory("BankManager");
    const bank = await Bank.deploy(await usdt.getAddress(), perSec, maxDep, maxWdr, cooldown);
    await bank.waitForDeployment();

    // Mint balances
    await usdt.mint(alice.address, toUnits(10_000));
    await usdt.mint(bob.address,   toUnits(10_000));

    // Fund reward pool so interest is payable
    await usdt.mint(owner.address, toUnits(50_000));
    await usdt.connect(owner).approve(await bank.getAddress(), toUnits(50_000));
    await bank.connect(owner).fundRewards(toUnits(50_000));

    return { owner, alice, bob, usdt, bank, perSec, maxDep, maxWdr, cooldown };
  }

  it("deposits and updates balances", async () => {
    const { alice, usdt, bank } = await deployFixture();

    await usdt.connect(alice).approve(await bank.getAddress(), toUnits(500));
    await expect(bank.connect(alice).deposit(toUnits(500)))
      .to.emit(bank, "Deposited")
      .withArgs(alice.address, toUnits(500));

    expect(await bank.balanceOf(alice.address)).to.equal(toUnits(500));
    expect(await bank.totalAssets()).to.equal(toUnits(500));
  });

  it("accrues interest over time and allows withdrawal", async () => {
    const { alice, usdt, bank } = await deployFixture();

    await usdt.connect(alice).approve(await bank.getAddress(), toUnits(1000));
    await bank.connect(alice).deposit(toUnits(1000));

    // Wait 30 days
    await time.increase(30 * 24 * 3600);

    // Withdraw after cooldown (already > 1 day)
    const balBefore = await usdt.balanceOf(alice.address);
    await expect(bank.connect(alice).withdraw(toUnits(200)))
      .to.emit(bank, "Withdrawn")
      .withArgs(alice.address, toUnits(200));

    const balAfter = await usdt.balanceOf(alice.address);
    expect(balAfter - balBefore).to.equal(toUnits(200));

    // balanceOf should be > 800 due to accrued interest
    const userBal = await bank.balanceOf(alice.address);
    expect(userBal).to.be.gt(toUnits(800));
  });

  it("enforces max deposit per tx", async () => {
    const { alice, usdt, bank, maxDep } = await deployFixture();

    await usdt.connect(alice).approve(await bank.getAddress(), maxDep + 1n);
    await expect(bank.connect(alice).deposit(maxDep + 1n)).to.be.revertedWith("max deposit");

    await expect(bank.connect(alice).deposit(maxDep)).to.emit(bank, "Deposited");
  });

  it("enforces max withdraw per tx and cooldown", async () => {
    const { alice, usdt, bank, maxWdr, cooldown } = await deployFixture();

    await usdt.connect(alice).approve(await bank.getAddress(), toUnits(1000));
    await bank.connect(alice).deposit(toUnits(1000));

    // Can't withdraw before cooldown
    await expect(bank.connect(alice).withdraw(toUnits(10))).to.be.revertedWith("cooldown");

    // Advance just enough
    await time.increase(cooldown);

    // Max per tx
    await expect(bank.connect(alice).withdraw(maxWdr + 1n)).to.be.revertedWith("max withdraw");

    await expect(bank.connect(alice).withdraw(maxWdr)).to.emit(bank, "Withdrawn");
  });
});
