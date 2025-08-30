import { ethers } from 'ethers';

export const getBalance = async (address) => {
  const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);  // Devuelve el saldo en Ether
};
