export interface Boost {
    name: string;
    level: number;
    count?: number;
}

export type BoostName = "RechargeSpeed" | "BatteryPack" | "MultiTap" | "AutoBot" | "Refill" | "Boost";

export const getBoostCost = (boostName: BoostName, level: number, isPremium: boolean = false): number => {
    const costs: { [key in BoostName]: number[] } = {
        MultiTap: [500, 700, 1000, 1400, 2000, 3400, 4700, 6500, 9000, 13000, 18000],
        AutoBot: [5000, 9000, 16000, 29000, 52000, 83000, 150000, 270000, 490000, 880000, 1300000],
        BatteryPack: [750, 1050, 1500, 2100, 3000, 7400, 10000, 14000, 20000, 28000, 38000],
        RechargeSpeed: [300, 400, 500, 700, 900, 2000, 2600, 3400, 4500, 6000, 13000],
        Refill: [0],
        Boost: [0],
    };
    let cost = costs[boostName][Math.min(level, costs[boostName].length - 1)];
    if (isPremium && level > 0) cost = Math.floor(cost * 0.75); // Скидка 25% для премиум
    return cost;
};

export const getBoostBonus = (boostName: BoostName, level: number): string => {
    const nextLevel = level + 1;
    switch (boostName) {
        case "MultiTap": return `+${2 + 2 * nextLevel} stones/click`;
        case "AutoBot": return `+${1 + nextLevel} stones/sec`; // Убрано "(max 25,000/day)"
        case "BatteryPack": return `+${1000 + 500 * nextLevel} max energy`;
        case "RechargeSpeed": return `+${1 + nextLevel} energy/sec`;
        case "Refill": return "Full energy refill";
        case "Boost": return "Double taps and auto-taps for 1 minute";
        default: return "";
    }
};