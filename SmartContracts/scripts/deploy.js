import hre from "hardhat";
import "dotenv/config";

const ownerAddress = process.env.DEPLOYER_SIGNER_PUBLIC_KEY

async function main() {
  const DepositVault = await hre.ethers.getContractFactory("DepositVault");
  const recordsContract = await DepositVault.deploy(ownerAddress);

  await recordsContract.waitForDeployment();

  console.log(
    `Contract deployed to ${recordsContract.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
