import { Wallet } from 'ethers';
 
export function createMnemonic() {
  const wallet = Wallet.createRandom();
  const phrase = wallet.mnemonic?.phrase; // string con 12 palabras
  if (!phrase) throw new Error('No se pudo generar la frase semilla.');
  return phrase;
}

  

   