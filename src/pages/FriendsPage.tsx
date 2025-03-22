// src/pages/FriendsPage.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { generateInviteLink, openInviteLink } from "../utils/referral";
import coinImage from "../assets/frens/icon_coin.png";
import telegramplus from "../assets/frens/telegramplus.png";
import friendIcon from "../assets/frens/telegram.png";
import {getReferalFriends} from "../utils/api.ts";

interface Friend {
    telegramId: string;
    username: string;
    stones: number;
    isPremium: boolean;
    photo_url: string;
}

interface FriendsResponse {
    invitedFriends: Friend[];
    totalBonus: number;
}

const FriendsPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const telegramId = user?.telegramId || "";
    const referralCode = user?.referralCode || "";
    const [invitedFriends, setInvitedFriends] = useState<Friend[]>([]);
    const [totalBonus, setTotalBonus] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!telegramId) return;
            setIsLoading(true);
            try {
                const data: FriendsResponse = await getReferalFriends();
                setInvitedFriends(data.invitedFriends || []);
                setTotalBonus(data.totalBonus || 0);
            } catch (error) {
                console.error("[FriendsPage] Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [telegramId]);

    const handleInvite = (isPremium: boolean) => {
        const link = generateInviteLink(referralCode, isPremium);
        openInviteLink(link);
    };

    return (
        <div className="friends-page">
            <div className="content">
                <h1 className="fren-zone">Fren Zone</h1>

                <div className="card leaders">
                    <div className="flex items-center gap-2">
                        <span className="coin-icon">🪨</span>
                        <span className="bonus">+{totalBonus.toLocaleString()}</span>
                    </div>
                    <button onClick={() => navigate("/leaderboard")} className="top-leaders">
                        Top 30 leaders
                    </button>
                </div>

                <p className="invite-text">Invite frens to get bonuses</p>

                <div className="card invite">
                    <div className="invite-item">
                        <img src={friendIcon} alt="Friend" className="avatar-icon" />
                        <button onClick={() => handleInvite(false)} className="invite-button">
                            <p className="font-semibold">Invite Fren</p>
                            <p className="text-xs flex items-center gap-1">
                                <span className="coin-icon">🪨</span> 1,000 + 5% over time{" "}
                                <span className="for-you">for you and fren</span>
                            </p>
                        </button>
                    </div>
                    <div className="invite-item">
                        <img src={telegramplus} alt="Telegram Premium" className="avatar-icon" />
                        <button onClick={() => handleInvite(true)} className="invite-button">
                            <p className="font-semibold">
                                Invite Fren with <span className="text-[#0088cc]">Telegram Premium</span>
                            </p>
                            <p className="text-xs flex items-center gap-1">
                                <span className="coin-icon">🪨</span> 10,000 + 10% over time{" "}
                                <span className="for-you">for you and fren</span>
                            </p>
                        </button>
                    </div>
                </div>

                <p className="invite-text">Your Frens</p>
                <div className="card friends-list">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : invitedFriends.length === 0 ? (
                        <div className="no-friends">
                            <img src={coinImage} alt="No Friend" className="coin-large" />
                            <p className="no-fren-text">No Fren yet</p>
                        </div>
                    ) : (
                        invitedFriends.map((friend) => (
                            <div key={friend.telegramId} className="friend-item">
                                <img
                                    src={friend.photo_url || (friend.isPremium ? telegramplus : friendIcon)}
                                    alt={friend.username}
                                    className="avatar-icon"
                                    onError={(e) => { e.currentTarget.src = friend.isPremium ? telegramplus : friendIcon; }}
                                />
                                <div className="friend-info">
                                    <p className="friend-name">{friend.username}</p>
                                    <p className="friend-bonus">
                                        <span className="coin-icon">🪨</span> {friend.stones.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;