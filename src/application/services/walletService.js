import { generatePublicKey } from "../../domain/wallet"; 

export const generateWallet = (mnemonic) => {
   return generatePublicKey(mnemonic);
};
