import { useMemo } from "react";
import { Contract } from 'ethers';
import { P2PLendingArtifact } from "../../config/ethers/artifacts/P2PLendingArtifact";
import { provider } from "../../adapters/api/blockchain";


const useP2PLendingContract = () => {
    const { address, abi } = P2PLendingArtifact;
    console.log(address);
    console.log(abi);
    const p2pLendingContract = useMemo(() => {
            return new Contract(address, abi, provider);
        }, [address, abi, provider, Contract]);
        return p2pLendingContract;
    };
export default useP2PLendingContract;