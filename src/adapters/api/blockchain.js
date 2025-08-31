// src/adapters/api/blockchain.js
import { JsonRpcProvider, formatEther } from 'ethers';

const RPC_URL =
  process.env.REACT_APP_ALCHEMY_URL || 'https://eth-sepolia.g.alchemy.com/v2/kYt-_Q2YU3eJz50RIZaWO';

export const provider = new JsonRpcProvider(RPC_URL);

export async function getLatestBlock() {
  const block = await provider.getBlock('latest');
  return block;
}

export async function getBalance(address) {
  const wei = await provider.getBalance(address);
  return formatEther(wei); 
}