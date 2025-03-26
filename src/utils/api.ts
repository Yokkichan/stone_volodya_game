import axios, { AxiosError } from "axios";
import { store } from "../store";

const API_URL = "https://fear-worldcat-ev-spent.trycloudflare.com/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const state = store.getState();
    const telegramId = state.user.user?.telegramId;
    if (telegramId && !config.data?.telegramId) {
        config.data = { ...config.data, telegramId };
    }

    return config;
});

const handleApiError = (error: unknown, message: string) => {
    console.error(`[api.ts] ${message}:`, error);
    throw error instanceof AxiosError ? error.response?.data || error.message : error;
};

export const login = async (initData: string) => {
    try {
        const response = await api.post("/auth/login", { initData });
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        return user;
    } catch (error) {
        handleApiError(error, "Error in login");
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get("/user/profile");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in getProfile");
    }
};

export const updateBalance = async (stones: number, useEnergy: boolean = true) => {
    try {
        const response = await api.post("/game/update-balance", { stones, useEnergy });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in updateBalance");
    }
};

export const applyBoost = async (boostName: string) => {
    try {
        const response = await api.post("/game/apply-boost", { boostName });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in applyBoost");
    }
};

export const useRefill = async () => {
    try {
        const response = await api.post("/game/use-refill");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in useRefill");
    }
};

export const useBoost = async () => {
    try {
        const response = await api.post("/game/use-boost");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in useBoost");
    }
};

export const buySkin = async (skinName: string, paymentMethod: "stones" | "ton") => {
    try {
        const response = await api.post("/game/buy-skin", { skinName, paymentMethod });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in buySkin");
    }
};

export const getReferalFriends = async () => {
    try {
        const response = await api.get("/referral/friends");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in getInvitedFriends");
    }
};

export const getLeaderboard = async (league: string) => {
    try {
        const response = await api.get("/leaderboard", { params: { league } });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in getLeaderboard");
    }
};

export const connectTonWallet = async (tonWallet: string) => {
    try {
        const response = await api.post("/user/connect-ton-wallet", { tonWallet });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in connectTonWallet");
    }
};

export const claimAirdrop = async () => {
    try {
        const response = await api.post("/airdrop/claim");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in claimAirdrop");
    }
};

export const addAirdropProgress = async (stonesToAdd: number) => {
    try {
        const response = await api.post("/airdrop/add-progress", { stonesToAdd });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in addAirdropProgress");
    }
};

export const completeTask = async (taskName: string) => {
    try {
        const response = await api.post("/earn/completeTask", { taskName });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error in completeTask");
    }
};