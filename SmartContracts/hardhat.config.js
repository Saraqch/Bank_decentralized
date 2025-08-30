import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-abi-exporter";

const apiKey = process.env.ALCHEMY_API_KEY
;
const privateKey = process.env.DEPLOYER_SIGNER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  abiExporter: {
    path: "./abi",
    pretty: false,
    runOnCompile: true,
  },
};
