// src/utils/leagues.ts
import rank1 from "../assets/ranks/rank_1.png";
import rank2 from "../assets/ranks/rank_2.png";
import rank3 from "../assets/ranks/rank_3.png";
import rank4 from "../assets/ranks/rank_4.png";
import rank5 from "../assets/ranks/rank_5.png";
import rank6 from "../assets/ranks/rank_6.png";
import rank7 from "../assets/ranks/rank_7.png";
import rank8 from "../assets/ranks/rank_8.png";
import rank9 from "../assets/ranks/rank_9.png";

export type LeagueName = "Pebble" | "Gravel" | "Cobblestone" | "Boulder" | "Quartz" | "Granite" | "Obsidian" | "Marble" | "Bedrock";

// Для MainPage.tsx (объект с иконками)
export const leagues: { [key in LeagueName]: string } = {
    Pebble: rank1,
    Gravel: rank2,
    Cobblestone: rank3,
    Boulder: rank4,
    Quartz: rank5,
    Granite: rank6,
    Obsidian: rank7,
    Marble: rank8,
    Bedrock: rank9,
};

// Для LeaderboardPage.tsx (массив с полной информацией)
export const leagueData = [
    { name: "Pebble" as const, icon: rank1, minStones: 0 },
    { name: "Gravel" as const, icon: rank2, minStones: 5_000 },
    { name: "Cobblestone" as const, icon: rank3, minStones: 50_000 },
    { name: "Boulder" as const, icon: rank4, minStones: 100_000 },
    { name: "Quartz" as const, icon: rank5, minStones: 500_000 },
    { name: "Granite" as const, icon: rank6, minStones: 1_000_000 },
    { name: "Obsidian" as const, icon: rank7, minStones: 10_000_000 },
    { name: "Marble" as const, icon: rank8, minStones: 50_000_000 },
    { name: "Bedrock" as const, icon: rank9, minStones: 100_000_000 },
];