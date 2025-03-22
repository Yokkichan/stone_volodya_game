export interface Boost {
    name: string;
    level: number;
    count?: number;
}

export type BoostName = "RechargeSpeed" | "BatteryPack" | "MultiTap" | "AutoBot" | "Turbo";

export const getBoostCost = (boostName: BoostName, level: number, isPremium: boolean = false): number => {
    const baseCosts: { [key in BoostName]: number } = {
        RechargeSpeed: 100,
        BatteryPack: 200,
        MultiTap: 150,
        AutoBot: 500,
        Turbo: 500,
    };
    const multipliers: { [key in BoostName]: number } = {
        RechargeSpeed: 1.3,
        BatteryPack: 1.4,
        MultiTap: 1.5,
        AutoBot: 1.6,
        Turbo: 1, // Фиксированная цена для Turbo
    };

    let cost = Math.floor(baseCosts[boostName] * Math.pow(multipliers[boostName], level));
    if (boostName === "RechargeSpeed" && level < 5) cost = Math.floor(cost * 0.7); // Скидка 30%
    if (isPremium && level > 0) cost = Math.floor(cost * 0.5); // VIP скидка 50% (пример)
    return cost;
};

export const getBoostBonus = (boostName: BoostName, level: number, multiTapLevel: number = 0): string => {
    const nextLevel = level + 1;
    switch (boostName) {
        case "RechargeSpeed":
            return `+${Math.floor(1 + 0.1 * nextLevel)} energy/sec`;
        case "BatteryPack":
            return `+${Math.floor(1000 * Math.pow(1.1, nextLevel))} max energy`;
        case "MultiTap":
            return `+${Math.floor(1 + 0.2 * nextLevel)} stones/click`;
        case "AutoBot":
            return `+${Math.floor(10 * Math.pow(1.15, nextLevel))} stones/sec`;
        case "Turbo":
            let turboBonus = Math.floor(500 * (1 + 0.5 * multiTapLevel));
            if (multiTapLevel >= 3) turboBonus *= 2; // Комбо Turbo + MultiTap
            return `+${turboBonus.toLocaleString()} stones`;
        default:
            return "";
    }
};