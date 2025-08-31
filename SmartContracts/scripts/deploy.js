import hre from "hardhat";
import "dotenv/config";

const ownerAddress = process.env.DEPLOYER_SIGNER_PUBLIC_KEY

async function main() {

  const DepositVault = await hre.ethers.getContractFactory("DepositVault");
  const depositVaultContract = await DepositVault.deploy(ownerAddress);
  await depositVaultContract.waitForDeployment();

  console.log(
    `DepositVault deployed to ${depositVaultContract.target}`
  );

  const LoanContract = await hre.ethers.getContractFactory("LoanContract");
  const loanContract = await LoanContract.deploy("0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD","0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD",50);
  await loanContract.waitForDeployment();

  console.log(
    `LoanContract deployed to ${loanContract.target}`
  );

  const P2PLending = await hre.ethers.getContractFactory("P2PLending");
  const p2pLending = await P2PLending.deploy();
  await p2pLending.waitForDeployment();

  console.log(
    `P2PLending deployed to ${p2pLending.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
