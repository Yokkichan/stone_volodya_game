import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { useState, useEffect } from "react";
import { applyBoost as applyBoostAPI } from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import { getBoostCost, getBoostBonus, Boost, BoostName } from "../utils/boosts";
import turboIcon from "../assets/boost/basic.png";
import rechargeSpeedIcon from "../assets/boost/recharge-speed.png";
import multiTapIcon from "../assets/boost/multi-tap.png";
import autoBotIcon from "../assets/boost/auto-bot.png";
import batteryPackIcon from "../assets/boost/battery-pack.png";

const icons: { [key in BoostName]: string } = {
    Turbo: turboIcon,
    RechargeSpeed: rechargeSpeedIcon,
    MultiTap: multiTapIcon,
    AutoBot: autoBotIcon,
    BatteryPack: batteryPackIcon,
};

const descriptions: { [key in BoostName]: string } = {
    Turbo: "Boost your mining speed temporarily",
    RechargeSpeed: "Increase the speed of energy recharge",
    MultiTap: "Mine more stones per tap",
    AutoBot: "Automate your mining process",
    BatteryPack: "Increase the energy limit so you can mine more per session",
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
        { name: "Turbo", count: 3, level: 0 },
        { name: "RechargeSpeed", level: 0 },
        { name: "MultiTap", level: 0 },
        { name: "AutoBot", level: 0 },
        { name: "BatteryPack", level: 0 },
    ];
    const isPremium = user?.isPremium ?? false;
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

                {error && <div className="boosts-error">{error}</div>}

                <h2 className="boosts-section-title">Free Daily Boosters</h2>
                <div className="boosts-card boosts-free-boosters">
                    <div
                        className="boosts-booster-item"
                        onClick={() => {
                            const boost = getBoostData("Turbo");
                            const cost = (boost.count ?? 0) > 0 ? 0 : getBoostCost("Turbo", boost.level, isPremium);
                            openModal({
                                itemName: "Turbo",
                                cost,
                                icon: icons.Turbo,
                                description: descriptions.Turbo,
                                onConfirm: () => handleApplyBoost("Turbo"),
                                count: boost.count,
                                bonus: getBoostBonus("Turbo", boost.level, getBoostData("MultiTap").level),
                            });
                        }}
                    >
                        <img src={icons.Turbo} alt="Turbo" className="boosts-booster-icon" />
                        <div className="boosts-booster-details">
                            <span className="boosts-task-text">Turbo</span>
                            <span className="boosts-booster-count">{`${getBoostData("Turbo").count ?? 0}/3`}</span>
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
                                        setError("MultiTap max level reached, upgrade AutoBot instead");
                                        return;
                                    }
                                    openModal({
                                        itemName: name,
                                        cost,
                                        icon: icons[name],
                                        description: descriptions[name],
                                        onConfirm: () => handleApplyBoost(name),
                                        level,
                                        bonus: getBoostBonus(name, level, getBoostData("MultiTap").level),
                                    });
                                }}
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