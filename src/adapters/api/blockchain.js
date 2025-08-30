// src/adapters/api/blockchain.js
import { JsonRpcProvider, formatEther } from 'ethers';

// Usa tu .env si existe; si no, cae a un RPC público (fallback)
const RPC_URL =
  process.env.REACT_APP_ALCHEMY_URL || 'https://rpc.sepolia.org';

export const provider = new JsonRpcProvider(RPC_URL);

export async function getLatestBlock() {
  const block = await provider.getBlock('latest');
  return block; // { number, hash, ... }
}

export async function getBalance(address) {
  const wei = await provider.getBalance(address);
  return formatEther(wei); // string en ETH
}
