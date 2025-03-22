// src/pages/EarnPage.tsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { completeTask } from "../utils/api";
import coinLogo from "../assets/coin.png";
import subscribeTelegramIcon from "../assets/earn/telegram.png";
import followTwitterIcon from "../assets/earn/x.png";
import voteCoinmarketcapIcon from "../assets/earn/coinmarketcap.png";
import joinRedditIcon from "../assets/earn/reddit.png";
import shareTiktokIcon from "../assets/earn/tiktok.png";

interface Task {
    name: string;
    icon: string;
    reward: number;
    label: string;
    link: string;
}

const EarnPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);
    const completedTasks = user?.tasksCompleted || [];
    const [loadingTask, setLoadingTask] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onboardingTasks: Task[] = [
        { name: "join_telegram", icon: subscribeTelegramIcon, reward: 1000, label: "Join Our Telegram", link: "https://t.me/stonevolodyacoin" },
        { name: "follow_twitter", icon: followTwitterIcon, reward: 1000, label: "Follow Us on X", link: "https://x.com/stonevolodya" },
    ];

    const specialTasks: Task[] = [
        { name: "vote_coinmarketcap", icon: voteCoinmarketcapIcon, reward: 1200, label: "Vote for Us on CoinMarketCap", link: "https://coinmarketcap.com/dexscan/ton/EQCKZoM7SmmND7PqpR6sIb1Uy2y0oMuzsxIHDF2ZTouSnBcF/#action=oauth&state=BMOQ5OWPTRHKP57NEBW2V4MI2HX2CO4Q" },
        { name: "join_reddit", icon: joinRedditIcon, reward: 1000, label: "Join Our Reddit Community", link: "https://reddit.com/r/stonevolodya" },
        { name: "share_tiktok", icon: shareTiktokIcon, reward: 1000, label: "Share Us on TikTok", link: "https://tiktok.com" },
    ];

    const handleConfirmTask = async (task: Task) => {
        if (completedTasks.includes(task.name)) {
            console.log("Task already completed:", { taskName: task.name });
            return;
        }

        console.log("Confirming task:", { taskName: task.name });

        setLoadingTask(task.name);
        setError(null);

        try {
            const updatedUser = await completeTask(task.name);
            dispatch(setUser(updatedUser));
        } catch (err: unknown) { // Заменили any на unknown
            console.error("[EarnPage] Error:", err);
            setError(err instanceof Error ? err.message : "Failed to confirm task. Try again.");
        } finally {
            setLoadingTask(null);
        }
    };

    const handleTaskClick = (task: Task) => {
        if (!completedTasks.includes(task.name)) {
            window.open(task.link, "_blank");
        }
    };

    return (
        <div className="earn-page">
            <div className="earn-content">
                <img src={coinLogo} alt="Stone Volodya Coin" className="earn-coin-image" />
                <h1 className="earn-title">Earn more coins</h1>

                {user && <div className="user-league"><span>Your League: {user.league}</span></div>}

                <h2 className="earn-section-title">On Boarding</h2>
                <div className="earn-card">
                    {onboardingTasks.map((task) => (
                        <div
                            key={task.name}
                            className={`earn-task-item ${completedTasks.includes(task.name) ? "completed" : ""} ${loadingTask === task.name ? "loading" : ""}`}
                            onClick={() => handleTaskClick(task)}
                        >
                            <img src={task.icon} alt={task.label} className="earn-task-icon" />
                            <div className="earn-task-details">
                                <span className="earn-task-text">{task.label}</span>
                                <div className="earn-reward">
                                    <span className="earn-reward-icon">🪨</span>
                                    <span className="earn-text-xs">{task.reward}</span>
                                </div>
                            </div>
                            {completedTasks.includes(task.name) ? (
                                <span className="earn-task-status completed">Completed</span>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmTask(task);
                                    }}
                                    disabled={loadingTask === task.name}
                                    className="earn-task-button confirm"
                                >
                                    {loadingTask === task.name ? "Loading..." : "Confirm"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <h2 className="earn-section-title">Specials</h2>
                <div className="earn-card">
                    {specialTasks.map((task) => (
                        <div
                            key={task.name}
                            className={`earn-task-item ${completedTasks.includes(task.name) ? "completed" : ""} ${loadingTask === task.name ? "loading" : ""}`}
                            onClick={() => handleTaskClick(task)}
                        >
                            <img src={task.icon} alt={task.label} className="earn-task-icon" />
                            <div className="earn-task-details">
                                <span className="earn-task-text">{task.label}</span>
                                <div className="earn-reward">
                                    <span className="earn-reward-icon">🪨</span>
                                    <span className="earn-text-xs">{task.reward}</span>
                                </div>
                            </div>
                            {completedTasks.includes(task.name) ? (
                                <span className="earn-task-status completed">Completed</span>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmTask(task);
                                    }}
                                    disabled={loadingTask === task.name}
                                    className="earn-task-button confirm"
                                >
                                    {loadingTask === task.name ? "Loading..." : "Confirm"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {error && <div className="earn-error">{error}</div>}
            </div>
        </div>
    );
};

export default EarnPage;