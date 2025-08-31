import { ethers } from 'ethers';

export const generatePublicKey = (mnemonic) => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  return wallet.address;  
};
