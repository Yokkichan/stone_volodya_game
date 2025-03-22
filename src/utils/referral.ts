// src/utils/referral.ts
import WebApp from "@twa-dev/sdk";

export const generateInviteLink = (referralCode: string, isPremium = false): string | null => {
    if (!referralCode) {
        console.error("[Referral] No referral code provided");
        return null;
    }
    const baseUrl = process.env.REACT_APP_BASE_URL || "https://t.me/StoneVolodyaCoinBot";
    const inviteUrl = `${baseUrl}?start=${referralCode}`;
    const text = isPremium
        ? `Join Stone Volodya Game with Telegram Premium! ${inviteUrl}`
        : `Join Stone Volodya Game! ${inviteUrl}`;
    return `https://t.me/share/url?url=${encodeURIComponent(text)}`;
};

export const openInviteLink = (link: string | null) => {
    if (link) WebApp.openTelegramLink(link);
};