export interface Boost {
    name: string;
    level: number;
    count?: number;
}

export type BoostName = "RechargeSpeed" | "BatteryPack" | "MultiTap" | "AutoBot" | "Turbo";

export const getBoostCost = (boostName: BoostName, level: number): number => {
    const levelCosts = [10, 100, 150, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000, 1000000];
    const multipliers: { [key in BoostName]?: number } = {
        RechargeSpeed: 1,
        BatteryPack: 1.2,
        MultiTap: 1.5,
        AutoBot: 2
    };
    return Math.floor(levelCosts[Math.min(level, levelCosts.length - 1)] * (multipliers[boostName] || 1));
};

export const getBoostBonus = (boostName: BoostName, level: number, multiTapLevel: number = 0): string => {
    const nextLevel = level + 1;
    switch (boostName) {
        case "Turbo": return `+${Math.floor(500 * (1 + multiTapLevel * 0.5)).toLocaleString()} stones`;
        case "RechargeSpeed": return `+${nextLevel === 1 ? 2 : Math.floor(2 * Math.pow(1.1, nextLevel - 1))} energy/sec`;
        case "MultiTap": return `+${nextLevel === 1 ? 2 : Math.floor(2 * Math.pow(1.1, nextLevel - 1))} stones/click`;
        case "AutoBot": return `+${nextLevel === 1 ? 10 : Math.floor(10 * Math.pow(1.1, nextLevel - 1))} stones/sec`;
        case "BatteryPack": return `+${nextLevel === 1 ? 1500 : Math.floor(1500 * Math.pow(1.1, nextLevel - 1))} max energy`;
        default: return "";
    }
};