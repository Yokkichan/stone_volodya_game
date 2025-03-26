import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { useState, useEffect } from "react";
import { applyBoost as applyBoostAPI, useRefill as applyRefillAPI, useBoost as applyBoostTimerAPI } from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import { getBoostCost, getBoostBonus, Boost, BoostName } from "../utils/boosts";
import rechargeSpeedIcon from "../assets/boost/recharge-speed.png";
import multiTapIcon from "../assets/boost/multi-tap.png";
import autoBotIcon from "../assets/boost/auto-bot.png";
import batteryPackIcon from "../assets/boost/battery-pack.png";
import refillIcon from "../assets/boost/refill.png";
import boostIcon from "../assets/boost/basic.png";
import stoneImage from "../assets/stone.png";

const icons: { [key in BoostName]: string } = {
    RechargeSpeed: rechargeSpeedIcon,
    MultiTap: multiTapIcon,
    AutoBot: autoBotIcon,
    BatteryPack: batteryPackIcon,
    Refill: refillIcon,
    Boost: boostIcon,
};

const descriptions: { [key in BoostName]: string } = {
    RechargeSpeed: "Increase the speed of energy recharge",
    MultiTap: "Mine more stones per tap",
    AutoBot: "Automate your mining process",
    BatteryPack: "Increase the energy limit so you can mine more per session",
    Refill: "Instantly refill your energy to the maximum",
    Boost: "Double your taps and auto-taps for 1 minute",
};

interface ModalData {
    itemName: BoostName;
    cost: number;
    icon: string;
    description: string;
    onConfirm: () => void;
    level?: number;
    count?: number;
    bonus?: string;
}

const BoostsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const stones = user?.stones ?? 0;
    const boosts = user?.boosts ?? [
        { name: "RechargeSpeed", level: 0 },
        { name: "MultiTap", level: 0 },
        { name: "AutoBot", level: 0 },
        { name: "BatteryPack", level: 0 },
        { name: "Refill", count: 1, level: 0 },
        { name: "Boost", count: 1, level: 0 },
    ];
    const isPremium = user?.isPremium ?? false;
    const telegramId = user?.telegramId;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [boostTimer, setBoostTimer] = useState<number>(0);

    useEffect(() => {
        if (!telegramId) setError("User not initialized");

        if (user?.boostActiveUntil) {
            const timeLeft = Math.max(0, new Date(user.boostActiveUntil).getTime() - Date.now()) / 1000;
            setBoostTimer(timeLeft);
            if (timeLeft > 0) {
                const interval = setInterval(() => {
                    setBoostTimer((prev) => Math.max(0, prev - 1));
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [telegramId, user?.boostActiveUntil]);

    const getBoostData = (boostName: string): Boost => {
        return boosts.find((b) => b.name === boostName) ?? {
            name: boostName,
            level: 0,
            count: boostName === "Refill" || boostName === "Boost" ? 1 : 0,
        };
    };

    const handleApplyBoost = async (boostName: BoostName) => {
        if (!telegramId || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await applyBoostAPI(boostName);
            dispatch(setUser(response));
        } catch {
            setError(`Failed to apply ${boostName}`);
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const handleUseRefill = async () => {
        if (!telegramId || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await applyRefillAPI();
            dispatch(setUser(response));
        } catch {
            setError("Failed to use Refill");
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const handleUseBoost = async () => {
        if (!telegramId || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await applyBoostTimerAPI();
            dispatch(setUser(response));
            setBoostTimer(60);
        } catch {
            setError("Failed to use Boost");
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const openModal = (data: ModalData) => setModalData(data);

    const isBoostAvailable = (boostName: "Refill" | "Boost") => {
        const lastUsed = boostName === "Refill" ? user?.refillLastUsed : user?.boostLastUsed;
        if (!lastUsed) return true;
        return Date.now() - new Date(lastUsed).getTime() >= 24 * 60 * 60 * 1000;
    };

    return (
        <div className="boosts-page">
            <div className="boosts-content">
                <div className="boosts-balance-section">
                    <div className="boosts-reward">
                        <img src={stoneImage} alt="Stone" className="boosts-balance-icon" /> {/* Новый класс */}
                        <span className="boosts-balance-text">{stones.toLocaleString()}</span>
                    </div>
                    <span className="boosts-balance-label">Your Stones</span>
                </div>

                {error && <div className="boosts-error">{error}</div>}

                <h2 className="boosts-section-title">Free Daily Boosters</h2>
                <div className="boosts-card boosts-free-boosters">
                    <div
                        className={`boosts-booster-item ${!isBoostAvailable("Refill") ? "disabled" : ""}`}
                        onClick={() => {
                            if (!isBoostAvailable("Refill")) return;
                            const boost = getBoostData("Refill");
                            openModal({
                                itemName: "Refill",
                                cost: 0,
                                icon: icons.Refill,
                                description: descriptions.Refill,
                                onConfirm: handleUseRefill,
                                count: boost.count,
                                bonus: getBoostBonus("Refill", boost.level),
                            });
                        }}
                    >
                        <img src={icons.Refill} alt="Refill" className="boosts-booster-icon" />
                        <div className="boosts-booster-details">
                            <span className="boosts-task-text">Refill</span>
                            <span className="boosts-booster-count">{isBoostAvailable("Refill") ? "1/1" : "0/1"}</span>
                        </div>
                    </div>
                    <div
                        className={`boosts-booster-item ${!isBoostAvailable("Boost") || boostTimer > 0 ? "disabled" : ""}`}
                        onClick={() => {
                            if (!isBoostAvailable("Boost") || boostTimer > 0) return;
                            const boost = getBoostData("Boost");
                            openModal({
                                itemName: "Boost",
                                cost: 0,
                                icon: icons.Boost,
                                description: descriptions.Boost,
                                onConfirm: handleUseBoost,
                                count: boost.count,
                                bonus: boostTimer > 0 ? `Active: ${Math.floor(boostTimer)}s` : getBoostBonus("Boost", boost.level),
                            });
                        }}
                    >
                        <img src={icons.Boost} alt="Boost" className="boosts-booster-icon" />
                        <div className="boosts-booster-details">
                            <span className="boosts-task-text">Boost</span>
                            <span className="boosts-booster-count">
                                {boostTimer > 0 ? `${Math.floor(boostTimer)}s` : isBoostAvailable("Boost") ? "1/1" : "0/1"}
                            </span>
                        </div>
                    </div>
                </div>

                <h2 className="boosts-section-title">Boosters</h2>
                <div className="boosts-card">
                    {(["RechargeSpeed", "MultiTap", "AutoBot", "BatteryPack"] as const).map((name) => {
                        const { level } = getBoostData(name);
                        const cost = getBoostCost(name, level, isPremium);
                        return (
                            <div
                                key={name}
                                className="boosts-task-item"
                                onClick={() => {
                                    if (name === "MultiTap" && level >= 10) {
                                        setError("MultiTap max level reached");
                                        return;
                                    }
                                    if (name === "AutoBot" && level >= 10) {
                                        setError("AutoBot max level reached");
                                        return;
                                    }
                                    if (name === "BatteryPack" && level >= 10) {
                                        setError("BatteryPack max level reached");
                                        return;
                                    }
                                    if (name === "RechargeSpeed" && level >= 10) {
                                        setError("RechargeSpeed max level reached");
                                        return;
                                    }
                                    openModal({
                                        itemName: name,
                                        cost,
                                        icon: icons[name],
                                        description: descriptions[name],
                                        onConfirm: () => handleApplyBoost(name),
                                        level,
                                        bonus: getBoostBonus(name, level),
                                    });
                                }}
                            >
                                <img src={icons[name]} alt={name} className="boosts-task-icon" />
                                <div className="boosts-task-details">
                                    <div className="boosts-task-info">
                                        <span className="boosts-task-text">{name} * Level {level}</span>
                                        <div className="boosts-reward">
                                            <img src={stoneImage} alt="Stone" className="boosts-reward-icon" />
                                            <span className="boosts-text-xs">{cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className="boosts-bonus-text">{getBoostBonus(name, level)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                onConfirm={modalData?.onConfirm ?? (() => {})}
                itemName={modalData?.itemName ?? ""}
                itemType="boost"
                cost={modalData?.cost ?? 0}
                level={modalData?.level}
                count={modalData?.count}
                icon={modalData?.icon ?? ""}
                description={modalData?.description ?? ""}
                bonus={modalData?.bonus}
            />
        </div>
    );
};

export default BoostsPage;