require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require('hardhat-abi-exporter');
require('hardhat-test-utils');

const projectId = process.env.INFURA_PROJECT_ID;
const privateKey = process.env.DEPLOYER_SIGNER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.9',
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${projectId}`,
      accounts: [
        privateKey,
      ],
    },
  },
  abiExporter: {
    path: './abi',
    pretty: false,
    runOnCompile: true
  }
};
