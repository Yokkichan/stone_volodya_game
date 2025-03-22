import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { useState } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { connectTonWallet, claimAirdrop, addAirdropProgress } from "../utils/api";
import coinPig from "../assets/coin_pig.png";
import { AIRDROP_CONFIG } from "../config/airdrop";

const AirdropPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const stones = user?.stones ?? 0;
    const airdropProgress = user?.airdropProgress ?? 0;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tonConnectUI] = useTonConnectUI();
    const tonAddress = useTonAddress();

    console.log("[AirdropPage] Current user state before action:", user);

    const handleAddStones = async () => {
        if (stones < AIRDROP_CONFIG.STONES_TO_ADD || isLoading) {
            setError("Not enough stones or action in progress");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const updatedUser = await addAirdropProgress(AIRDROP_CONFIG.STONES_TO_ADD);
            console.log("[AirdropPage] Updated user from API:", updatedUser);
            dispatch(setUser(updatedUser));
            console.log("[AirdropPage] User state after dispatch:", user);
        } catch (error) {
            console.error("[Airdrop] Add stones error:", error);
            setError("Failed to add stones");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectWallet = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            if (!tonAddress) await tonConnectUI.connectWallet();
            if (tonAddress) {
                await connectTonWallet(tonAddress);
                const updatedUser = await claimAirdrop();
                dispatch(setUser(updatedUser));
                alert(`Airdrop claimed! ${AIRDROP_CONFIG.REWARD} SV coins sent to your wallet.`);
            }
        } catch (error) {
            console.error("[Airdrop] Claim error:", error);
            setError("Failed to claim airdrop");
        } finally {
            setIsLoading(false);
        }
    };

    const canClaimAirdrop = airdropProgress >= AIRDROP_CONFIG.REQUIRED_STONES;
    const hasClaimed = user?.tasksCompleted?.includes("airdrop") || false;
    const progressPercentage = Math.min((airdropProgress / AIRDROP_CONFIG.REQUIRED_STONES) * 100, 100);

    return (
        <div className="airdrop-page">
            <div className="content">
                <img src={coinPig} alt="Coin Pig" className="coin-pig" />
                <h1 className="fren-zone">Get {AIRDROP_CONFIG.REWARD} SV Coin</h1>
                <p className="airdrop-description">
                    *Add {AIRDROP_CONFIG.REQUIRED_STONES.toLocaleString()} stones to the container to participate in the Airdrop*
                </p>
                <div className="progress-wrapper">
                    <div className="progress-label">Your Progress</div>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                        <div className="progress-slider" style={{ left: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="progress-marks">
                        <span className="progress-mark">0</span>
                        <span className="progress-mark">100,000</span>
                        <span className="progress-mark">{AIRDROP_CONFIG.REQUIRED_STONES.toLocaleString()}</span>
                    </div>
                </div>
                {hasClaimed ? (
                    <h2 className="sub-title">You already claimed the Airdrop</h2>
                ) : canClaimAirdrop ? (
                    <>
                        <h2 className="sub-title">{tonAddress ? "Wallet Connected" : "Connect your TON Wallet"}</h2>
                        <button onClick={handleConnectWallet} className="connect-button" disabled={isLoading}>
                            {isLoading ? "Processing..." : tonAddress ? "Claim Airdrop" : "Connect TON Wallet"}
                        </button>
                    </>
                ) : (
                    <button onClick={handleAddStones} className="add-stones-button" disabled={isLoading}>
                        {isLoading ? "Adding..." : `Add Stones (+${AIRDROP_CONFIG.STONES_TO_ADD.toLocaleString()})`}
                    </button>
                )}
                {error && <div className="airdrop-error">{error}</div>}
            </div>
        </div>
    );
};

export default AirdropPage;