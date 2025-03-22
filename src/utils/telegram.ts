// src/utils/telegram.ts
import WebApp from "@twa-dev/sdk";

export const getTelegramInitData = (): string => {
    try {
        return WebApp.initData || "";
    } catch (error) {
        console.error("[telegram] Error getting initData:", error);
        return "";
    }
};

export const getTelegramUser = () => {
    try {
        return WebApp.initDataUnsafe.user || null;
    } catch (error) {
        console.error("[telegram] Error getting user:", error);
        return null;
    }
};

export const initTelegramUser = () => {
    const FAKE_USER = { id: 123456, username: "test_user", photo_url: "https://example.com/avatar.jpg" };
    return WebApp.initDataUnsafe.user || FAKE_USER;
};

export const isTelegramWebApp = () => !!WebApp.initData;