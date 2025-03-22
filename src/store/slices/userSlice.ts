// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    telegramId: string;
    username: string;
    stones: number;
    energy: number;
    boosts: { name: string; level: number; count?: number }[]; // count опционален
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
    airdropStones?: number; // Добавляем для Airdrop
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
            if (!payload.telegramId) return;

            state.user = {
                ...(state.user || {}),
                ...payload,
                telegramId: payload.telegramId, // Обязательное поле
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
            } as UserState;
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