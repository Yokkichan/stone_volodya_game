import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { useState, useEffect } from "react";
import { applyBoost as applyBoostAPI, buySkin as buySkinAPI } from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import { getBoostCost, getBoostBonus, Boost, BoostName } from "../utils/boosts";
import turboIcon from "../assets/boost/basic.png";
import refillsIcon from "../assets/boost/refile.png";
import rechargeSpeedIcon from "../assets/boost/recharge-speed.png";
import multiTapIcon from "../assets/boost/multi-tap.png";
import autoBotIcon from "../assets/boost/auto-bot.png";
import batteryPackIcon from "../assets/boost/battery-pack.png";
import jadeCoinIcon from "../assets/boost/jade-coin.png";
import bitcoinIcon from "../assets/boost/bitcoin.png";
import pedroPinIcon from "../assets/boost/pedro-pin.png";
import basicIcon from "../assets/boost/basic.png";

type ItemName = BoostName | "Refills" | "JadeCoin" | "Bitcoin" | "PedroPin" | "Basic";

const icons: { [key in ItemName]: string } = {
    Turbo: turboIcon, Refills: refillsIcon, RechargeSpeed: rechargeSpeedIcon, MultiTap: multiTapIcon,
    AutoBot: autoBotIcon, BatteryPack: batteryPackIcon, JadeCoin: jadeCoinIcon, Bitcoin: bitcoinIcon,
    PedroPin: pedroPinIcon, Basic: basicIcon,
};

const descriptions: { [key in ItemName]: string } = {
    Turbo: "Boost your mining speed temporarily", Refills: "Refill your energy instantly to max",
    RechargeSpeed: "Increase the speed of energy recharge", MultiTap: "Mine more stones per tap",
    AutoBot: "Automate your mining process", BatteryPack: "Increase the energy limit so you can mine more per session",
    JadeCoin: "A shiny jade coin skin", Bitcoin: "A golden Bitcoin skin", PedroPin: "A unique Pedro pin skin",
    Basic: "A simple basic skin",
};

interface ModalData {
    itemName: ItemName;
    itemType: "boost" | "skin";
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
        { name: "Turbo", count: 3, level: 0 }, { name: "Refills", count: 3, level: 0 },
        { name: "RechargeSpeed", count: 0, level: 0 }, { name: "MultiTap", count: 0, level: 0 },
        { name: "AutoBot", count: 0, level: 0 }, { name: "BatteryPack", count: 0, level: 0 },
    ];
    const skins = user?.skins ?? [];
    const telegramId = user?.telegramId;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalData, setModalData] = useState<ModalData | null>(null);

    useEffect(() => {
        if (!telegramId) setError("User not initialized");
    }, [telegramId]);

    const getBoostData = (boostName: string): Boost => {
        return boosts.find((b) => b.name === boostName) ?? { name: boostName, level: 0, count: 0 };
    };

    const handleApplyBoost = async (boostName: string) => {
        if (!telegramId || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await applyBoostAPI(boostName);
            dispatch(setUser(response));
        } catch (error) {
            setError(`Failed to apply ${boostName}`);
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const handleUpgradeBoost = async (boostName: BoostName) => {
        if (!telegramId || isLoading) return;
        const { level } = getBoostData(boostName);
        const cost = getBoostCost(boostName, level);
        if (stones < cost) return setError("Not enough stones");

        setIsLoading(true);
        setError(null);
        try {
            const response = await applyBoostAPI(boostName);
            dispatch(setUser(response));
        } catch (error) {
            setError(`Failed to upgrade ${boostName}`);
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const handleBuySkin = async (skinName: string) => {
        if (!telegramId || isLoading || stones < 1000) return setError("Not enough stones or user not initialized");
        setIsLoading(true);
        setError(null);
        try {
            const response = await buySkinAPI(skinName, "stones");
            dispatch(setUser(response));
        } catch (error) {
            setError(`Failed to buy ${skinName}`);
        } finally {
            setIsLoading(false);
            setModalData(null);
        }
    };

    const openModal = (data: ModalData) => setModalData(data);

    return (
        <div className="boosts-page">
            <div className="boosts-content">
                <div className="boosts-balance-section">
                    <div className="boosts-reward">
                        <span className="boosts-reward-icon">🪨</span>
                        <span className="boosts-balance-text">{stones.toLocaleString()}</span>
                    </div>
                    <span className="boosts-balance-label">Your Stones</span>
                </div>

                {error && <div className="boosts-error">{error}</div>} {/* error используется здесь */}

                <h2 className="boosts-section-title">Free Daily Boosters</h2>
                <div className="boosts-card boosts-free-boosters">
                    {(["Turbo", "Refills"] as const).map((name) => {
                        const { count } = getBoostData(name);
                        return (
                            <div
                                key={name}
                                className="boosts-booster-item"
                                onClick={() => openModal({
                                    itemName: name,
                                    itemType: "boost",
                                    cost: 0,
                                    icon: icons[name],
                                    description: descriptions[name],
                                    onConfirm: () => handleApplyBoost(name),
                                    count,
                                    bonus: name === "Turbo" ? getBoostBonus(name, 0, getBoostData("MultiTap").level) : undefined,
                                })}
                            >
                                <img src={icons[name]} alt={name} className="boosts-booster-icon" />
                                <div className="boosts-booster-details">
                                    <span className="boosts-task-text">{name}</span>
                                    <span className="boosts-booster-count">{`${count}/3`}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h2 className="boosts-section-title">Boosters</h2>
                <div className="boosts-card">
                    {(["RechargeSpeed", "MultiTap", "AutoBot", "BatteryPack"] as const).map((name) => {
                        const { level } = getBoostData(name);
                        const cost = getBoostCost(name, level);
                        return (
                            <div
                                key={name}
                                className="boosts-task-item"
                                onClick={() => openModal({
                                    itemName: name,
                                    itemType: "boost",
                                    cost,
                                    icon: icons[name],
                                    description: descriptions[name],
                                    onConfirm: () => handleUpgradeBoost(name),
                                    level,
                                    bonus: getBoostBonus(name, level, getBoostData("MultiTap").level),
                                })}
                            >
                                <img src={icons[name]} alt={name} className="boosts-task-icon" />
                                <div className="boosts-task-details">
                                    <div className="boosts-task-info">
                                        <span className="boosts-task-text">{name} * Level {level}</span>
                                        <div className="boosts-reward">
                                            <span className="boosts-reward-icon">🪨</span>
                                            <span className="boosts-text-xs">{cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className="boosts-bonus-text">{getBoostBonus(name, level, getBoostData("MultiTap").level)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h2 className="boosts-section-title">Buy Skins</h2>
                <div className="boosts-card">
                    {(["JadeCoin", "Bitcoin", "PedroPin", "Basic"] as const).map((name) => (
                        <div
                            key={name}
                            className="boosts-task-item"
                            onClick={() => openModal({
                                itemName: name,
                                itemType: "skin",
                                cost: 1000,
                                icon: icons[name],
                                description: descriptions[name],
                                onConfirm: () => handleBuySkin(name),
                            })}
                        >
                            <img src={icons[name]} alt={name} className="boosts-task-icon" />
                            <div className="boosts-task-details">
                                <span className="boosts-task-text">{name}</span>
                                <div className="boosts-reward">
                                    <span className="boosts-reward-icon">🪨</span>
                                    <span className="boosts-text-xs">{skins.includes(name) ? "Owned" : "1,000"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                onConfirm={modalData?.onConfirm ?? (() => {})}
                itemName={modalData?.itemName ?? ""}
                itemType={modalData?.itemType ?? "boost"}
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