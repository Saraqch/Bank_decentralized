// domain/wallet.js
import { ethers } from 'ethers';

export const generatePublicKey = (mnemonic) => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  return wallet.address; // Devuelve la llave pública de la wallet
};
