// src/utils/socket.ts
import { io, Socket } from "socket.io-client";
import {AppDispatch} from "../store";

const SOCKET_URL = "https://bishop-restoration-come-dayton.trycloudflare.com";

export const socket: Socket = io(SOCKET_URL, { autoConnect: false }); // Отключаем авто-подключение, управляем вручную

socket.on("connect", () => console.log("[socket] Connected"));
socket.on("disconnect", () => console.log("[socket] Disconnected"));
socket.on("connect_error", (error) => console.error("[socket] Connection error:", error));

// Функция для инициализации подписок
export const initSocketListeners = (
    telegramId: string,
    onUserUpdate: (data: { stones: number; league: string; energy?: number }) => void
) => {
    socket.connect();
    socket.emit("join", telegramId);
    socket.on("userUpdate", onUserUpdate);
};

// Функция для очистки подписок
export const cleanupSocketListeners = (
    onUserUpdate: (data: { stones: number; league: string; energy?: number }) => void
) => {
    socket.off("userUpdate", onUserUpdate);
    socket.disconnect();
};

export interface SocketUserUpdate {
    stones: number;
    league: string;
    lastAutoBotUpdate: string;
}

export const initMainPageSocket = (
    socket: Socket,
    telegramId: string,
    dispatch: AppDispatch,
    setUser: typeof import("../store/slices/userSlice").setUser,
    isTapping: boolean,
    stones: number,
    pendingStones: number,
    setPendingStones: (value: number) => void
) => {
    socket.emit("join", telegramId);
    socket.on("connect", () => socket.emit("join", telegramId));
    socket.on("updateScore", (data: { id: string; score: number }) => {
        if (data.id === telegramId && data.score !== stones) {
            dispatch(setUser({ stones: data.score }));
        }
    });
    socket.on("userUpdate", (data: SocketUserUpdate) => {
        if (isTapping) return;
        dispatch(setUser(data));
        if (data.stones >= stones + pendingStones) setPendingStones(0);
    });
    return () => {
        socket.off("connect");
        socket.off("updateScore");
        socket.off("userUpdate");
    };
};

// src/utils/socket.ts
export interface SocketUserUpdate {
    stones: number;
    league: string;
    lastAutoBotUpdate: string;
}

export interface SocketScoreUpdate {
    id: string;
    score: number;
}