// src/pages/EarnPage.tsx
import { useState } from "react"; // Убираем useEffect
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser } from "../store/slices/userSlice";
import { updateBalance as updateBalanceAPI } from "../utils/api";
import { TaskItem } from "../components/TaskItem";
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

    const earnReward = async (task: Task) => {
        if (completedTasks.includes(task.name)) return;

        setLoadingTask(task.name);
        setError(null);
        window.open(task.link, "_blank");

        // Имитация выполнения задачи
        await new Promise((resolve) => setTimeout(resolve, 5000));

        try {
            const updatedUser = await updateBalanceAPI(task.reward, true);
            dispatch(setUser({ ...updatedUser, tasksCompleted: [...completedTasks, task.name] }));
            alert(`Reward earned! You received ${task.reward} stones.`);
        } catch (err) {
            console.error("[EarnPage] Error:", err);
            setError("Failed to claim reward. Try again.");
        } finally {
            setLoadingTask(null);
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
                        <TaskItem
                            key={task.name}
                            task={task}
                            isLoading={loadingTask === task.name}
                            isCompleted={completedTasks.includes(task.name)}
                            onClick={() => earnReward(task)}
                        />
                    ))}
                </div>

                <h2 className="earn-section-title">Specials</h2>
                <div className="earn-card">
                    {specialTasks.map((task) => (
                        <TaskItem
                            key={task.name}
                            task={task}
                            isLoading={loadingTask === task.name}
                            isCompleted={completedTasks.includes(task.name)}
                            onClick={() => earnReward(task)}
                        />
                    ))}
                </div>

                {error && <div className="earn-error">{error}</div>}
            </div>
        </div>
    );
};

export default EarnPage;