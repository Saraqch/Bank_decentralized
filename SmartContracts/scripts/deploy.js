const hre = require("hardhat");

async function main() {
  const Records = await hre.ethers.getContractFactory("Records");
  const recordsContract = await Records.deploy();

  await recordsContract.deployed();

  console.log(
    `Contract deployed to ${recordsContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
