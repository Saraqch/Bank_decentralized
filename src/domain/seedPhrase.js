// src/domain/seedPhrase.js
import { Wallet } from 'ethers';

/**
 * Genera una frase semilla de 12 palabras (BIP-39) en el cliente.
 * NO requiere internet ni provider.
 * ¡Nunca la envíes a servidores ni la guardes en texto plano!
 */
export function createMnemonic() {
  const wallet = Wallet.createRandom();
  const phrase = wallet.mnemonic?.phrase; // string con 12 palabras
  if (!phrase) throw new Error('No se pudo generar la frase semilla.');
  return phrase;
}

  

   