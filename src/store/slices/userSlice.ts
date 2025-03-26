import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    telegramId: string;
    username: string;
    stones: number;
    energy: number;
    boosts: { name: string; level: number; count?: number }[];
    skins: string[];
    tasksCompleted: string[];
    league: string;
    tonWallet?: string;
    referralCode: string;
    energyRegenRate: number;
    stonesPerClick: number;
    autoStonesPerSecond: number;
    maxEnergy: number;
    lastAutoBotUpdate?: string;
    isPremium: boolean;
    airdropStones?: number;
    referralBonus?: number;
    airdropProgress: number;
    refillLastUsed?: string;      // Добавляем для Refill
    boostLastUsed?: string;       // Добавляем для Boost
    boostActiveUntil?: string;    // Добавляем для Boost
}

const initialState: { user: UserState | null } = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Partial<UserState>>) => {
            const payload = action.payload;
            if (!payload.telegramId) {
                console.log("[userSlice] setUser: telegramId missing, skipping update");
                return;
            }

            const updatedUser = {
                ...(state.user || {}),
                ...payload,
                telegramId: payload.telegramId,
                username: payload.username || "Unknown",
                stones: payload.stones ?? 0,
                energy: payload.energy ?? 1000,
                boosts: payload.boosts ?? [],
                skins: payload.skins ?? [],
                tasksCompleted: payload.tasksCompleted ?? [],
                league: payload.league ?? "Pebble",
                energyRegenRate: payload.energyRegenRate ?? 1,
                stonesPerClick: payload.stonesPerClick ?? 1,
                autoStonesPerSecond: payload.autoStonesPerSecond ?? 0,
                maxEnergy: payload.maxEnergy ?? 1000,
                isPremium: payload.isPremium ?? false,
                airdropProgress: payload.airdropProgress ?? (state.user?.airdropProgress ?? 0),
                refillLastUsed: payload.refillLastUsed ?? state.user?.refillLastUsed,
                boostLastUsed: payload.boostLastUsed ?? state.user?.boostLastUsed,
                boostActiveUntil: payload.boostActiveUntil ?? state.user?.boostActiveUntil,
            } as UserState;

            state.user = updatedUser;
        },
        clearUser: (state) => {
            state.user = null;
        },
        decreaseEnergy(state, action: PayloadAction<number>) {
            if (state.user) {
                state.user.energy = Math.max(0, state.user.energy - action.payload);
            }
        },
        increaseEnergy(state, action: PayloadAction<number>) {
            if (state.user) {
                state.user.energy = Math.min(state.user.maxEnergy, state.user.energy + action.payload);
            }
        },
    },
});

export const { setUser, clearUser, decreaseEnergy, increaseEnergy } = userSlice.actions;
export default userSlice.reducer;