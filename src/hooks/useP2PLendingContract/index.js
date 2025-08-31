import { useWeb3React } from '@web3-react/core';
import { useMemo } from "react";
import P2PLendingArtifact from "../../config/web3/artifacts/P2PLendingArtifact";

const { address, abi } = P2PLendingArtifact;

const useP2PLendingContract = () => {
    const { active, library, chainId } = useWeb3React();
    const p2pLendingContract = useMemo(() => {
            if (active) return new library.eth.Contract(abi, address[chainId]);
        }, [active, chainId, library?.eth?.Contract]);
        return p2pLendingContract;
    };
export default useP2PLendingContract;