// test/Deposit.test.js  (ESM)
import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

const { ethers } = hre;

const DECIMALS = 18; // change to 6 if you want USDT-like behavior
const toUnits = (n) => ethers.parseUnits(n.toString(), DECIMALS);

describe("DepositVault + MockERC20", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();

    // === Deploy MockERC20(name, symbol, decimals) ===
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdt = await MockERC20.deploy("Mock USDT", "USDT", DECIMALS);
    await usdt.waitForDeployment();

    // Mint tokens to users
    await usdt.mint(alice.address, toUnits(1000));
    await usdt.mint(bob.address,   toUnits(1000));

    // === Deploy DepositVault(asset) ===
    const Vault = await ethers.getContractFactory("DepositVault");
    const vault = await Vault.deploy(await usdt.getAddress());
    await vault.waitForDeployment();

    return { owner, alice, bob, usdt, vault };
  }

  it("allows deposits and updates balances and totalAssets", async () => {
    const { alice, usdt, vault } = await loadFixture(deployFixture);

    await usdt.connect(alice).approve(await vault.getAddress(), toUnits(100));

    await expect(vault.connect(alice).deposit(toUnits(100)))
      .to.emit(vault, "Deposited")
      .withArgs(alice.address, toUnits(100));

    expect(await vault.balanceOf(alice.address)).to.equal(toUnits(100));
    expect(await vault.totalAssets()).to.equal(toUnits(100));
    expect(await usdt.balanceOf(await vault.getAddress())).to.equal(toUnits(100));
  });

  it("allows withdrawals and reduces balances and totalAssets", async () => {
    const { alice, usdt, vault } = await loadFixture(deployFixture);

    await usdt.connect(alice).approve(await vault.getAddress(), toUnits(50));
    await vault.connect(alice).deposit(toUnits(50));

    const balanceBefore = await usdt.balanceOf(alice.address);

    await expect(vault.connect(alice).withdraw(toUnits(20)))
      .to.emit(vault, "Withdrawn")
      .withArgs(alice.address, toUnits(20));

    expect(await vault.balanceOf(alice.address)).to.equal(toUnits(30));
    expect(await vault.totalAssets()).to.equal(toUnits(30));

    const balanceAfter = await usdt.balanceOf(alice.address);
    expect(balanceAfter - balanceBefore).to.equal(toUnits(20));
  });

  it("reverts when trying to withdraw more than deposited", async () => {
    const { alice, usdt, vault } = await loadFixture(deployFixture);

    await usdt.connect(alice).approve(await vault.getAddress(), toUnits(10));
    await vault.connect(alice).deposit(toUnits(10));

    await expect(
      vault.connect(alice).withdraw(toUnits(11))
    ).to.be.reverted;
  });

  it("reverts when trying to deposit amount = 0", async () => {
    const { alice, usdt, vault } = await loadFixture(deployFixture);

    await usdt.connect(alice).approve(await vault.getAddress(), toUnits(1));
    await expect(
      vault.connect(alice).deposit(0)
    ).to.be.reverted;
  });
});
