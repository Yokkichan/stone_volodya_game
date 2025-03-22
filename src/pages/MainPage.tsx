import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser, decreaseEnergy, increaseEnergy } from "../store/slices/userSlice";
import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { Socket } from "socket.io-client";
import { updateBalance as updateBalanceAPI } from "../utils/api";
import { initTelegramUser } from "../utils/telegram";
import coinImage from "../assets/volodya_stone.png";
import BottomNav from "../components/BottomNav";
import { leagues, LeagueName } from "../utils/leagues";
import { SocketScoreUpdate, SocketUserUpdate } from "../utils/socket";

interface MainPageProps {
    socket: Socket;
}

const MainPage: React.FC<MainPageProps> = ({ socket }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const { telegramId = "", username = "", stones = 0, energy = 1000,
        energyRegenRate = 1, stonesPerClick = 1, maxEnergy = 1000, autoStonesPerSecond = 0
    } = user || {};

    const safeLeague = (user?.league || "Pebble") as LeagueName;

    const [pendingStones, setPendingStones] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const coinRef = useRef<HTMLImageElement>(null);
    const coinHolderRef = useRef<HTMLDivElement>(null);
    const middleSectionRef = useRef<HTMLDivElement>(null);
    const webAppUser = initTelegramUser();

    useEffect(() => {
        if (!telegramId || !username) {
            dispatch(setUser({ telegramId: String(webAppUser.id), username: webAppUser.username || `Miner_${Math.random().toString(36).substring(7)}` }));
            return;
        }

        const initialize = async () => {
            try {
                const updatedData = await updateBalanceAPI(0, false);
                dispatch(setUser(updatedData));
                setIsInitialized(true);

                const offlineStones = calculateOfflineStones(updatedData.lastAutoBotUpdate);
                if (offlineStones > 0) {
                    const offlineData = await updateBalanceAPI(offlineStones, false);
                    dispatch(setUser(offlineData));
                }
                localStorage.setItem(`lastAutoBotUpdate_${telegramId}`, new Date().toISOString());
            } catch (error) {
                console.error("[MainPage] Init error:", error);
                setIsInitialized(true);
            }
        };
        if (!isInitialized) initialize();
    }, [telegramId, username, dispatch, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;

        const energyInterval = setInterval(() => {
            if (energy < maxEnergy) dispatch(increaseEnergy(energyRegenRate));
        }, 1000);

        const autoTapInterval = setInterval(() => {
            if (autoStonesPerSecond > 0) {
                setPendingStones((prev) => prev + autoStonesPerSecond);
            }
        }, 1000);

        const syncInterval = setInterval(() => {
            if (pendingStones > 0) {
                updateBalanceAPI(pendingStones, false)
                    .then((data) => {
                        dispatch(setUser(data));
                        setPendingStones(0);
                        localStorage.setItem(`lastAutoBotUpdate_${telegramId}`, new Date().toISOString());
                    })
                    .catch((error) => console.error("[MainPage] Sync error:", error));
            }
        }, 10000);

        return () => {
            clearInterval(energyInterval);
            clearInterval(autoTapInterval);
            clearInterval(syncInterval);
        };
    }, [isInitialized, energy, maxEnergy, autoStonesPerSecond, pendingStones, dispatch, telegramId]);

    useEffect(() => {
        if (!telegramId || !socket) return;

        socket.emit("join", telegramId);
        const handleUserUpdate = (data: SocketUserUpdate) => {
            dispatch(setUser(data));
            if (data.stones >= stones + pendingStones) setPendingStones(0);
        };
        const handleScoreUpdate = (data: SocketScoreUpdate) => {
            if (data.id === telegramId && data.score !== stones) dispatch(setUser({ stones: data.score }));
        };

        socket.on("userUpdate", handleUserUpdate);
        socket.on("updateScore", handleScoreUpdate);
        socket.on("connect_error", (error) => console.error("[Socket] Error:", error));

        return () => {
            socket.off("userUpdate", handleUserUpdate);
            socket.off("updateScore", handleScoreUpdate);
            socket.off("connect_error");
        };
    }, [socket, telegramId, stones, pendingStones, dispatch]);

    const calculateOfflineStones = useCallback((lastUpdate?: string) => {
        if (autoStonesPerSecond <= 0 || !lastUpdate) return 0;
        const secondsPassed = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000);
        return secondsPassed > 0 ? Math.floor(autoStonesPerSecond * secondsPassed) : 0;
    }, [autoStonesPerSecond]);

    const handleCollect = useCallback(async (event: React.MouseEvent | React.TouchEvent) => {
        if (energy < 1) return;

        const coin = coinRef.current;
        if (coin) {
            const rect = coin.getBoundingClientRect();
            const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
            const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
            createStoneEffect(clientX - rect.left, clientY - rect.top);

            // Анимация наклона монеты
            const x = Math.abs(rect.x - clientX);
            const y = Math.abs(rect.y - clientY);
            const halfWidth = rect.width / 2;
            const halfHeight = rect.height / 2;
            const calcAngleX = (x - halfWidth) / 16;
            const calcAngleY = (y - halfHeight) / 14 * -1;

            coin.style.perspective = `${halfWidth * 4}px`;
            if (Math.floor(calcAngleX) === 0 && Math.floor(calcAngleY) === 0) {
                coin.style.transform = `rotateY(${calcAngleX}deg) rotateX(${calcAngleY}deg) scale(0.99)`;
            } else {
                coin.style.transform = `rotateY(${calcAngleX}deg) rotateX(${calcAngleY}deg)`;
            }
            WebApp.HapticFeedback.impactOccurred("medium");

            setTimeout(() => {
                coin.style.transform = "rotateY(0deg) rotateX(0deg)";
            }, 100);
        }

        try {
            dispatch(decreaseEnergy(1));
            const totalStones = stonesPerClick + pendingStones;
            const updatedData = await updateBalanceAPI(totalStones, true);
            dispatch(setUser(updatedData));
            setPendingStones(0);
            socket.emit("updateScore", { id: telegramId, name: username, score: updatedData.stones });
        } catch (error) {
            console.error("[MainPage] Tap error:", error);
        }
    }, [energy, stonesPerClick, pendingStones, dispatch, socket, telegramId, username]);

    const createStoneEffect = (x: number, y: number) => {
        const middleSection = middleSectionRef.current;
        if (!middleSection) return;

        const stone = document.createElement("span");
        stone.className = "stone-effect";
        stone.innerHTML = `🪨 +${stonesPerClick}`;
        stone.style.left = `${x}px`;
        stone.style.top = `${y}px`;
        middleSection.appendChild(stone);

        const angle = Math.random() * 360;
        const distance = 90 + Math.random() * 90;
        stone.style.setProperty("--translate-x", `${Math.cos((angle * Math.PI) / 180) * distance}px`);
        stone.style.setProperty("--translate-y", `${Math.sin((angle * Math.PI) / 180) * distance}px`);
        stone.addEventListener("animationend", () => stone.remove());
    };

    const displayedStones = stones + pendingStones;

    return (
        <div className="dashboard">
            <div className="relative z-[10] w-full">
                <div className="add-pad">
                    <div className="top-section">
                        <div className="avatar-container">
                            {webAppUser.photo_url ? (
                                <img src={webAppUser.photo_url} alt="Avatar" className="w-10 h-10 rounded-full border border-white" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">?</div>
                            )}
                        </div>
                        <div className="score-holder stones">
                            <span>🪨</span>
                            <p>{Math.floor(displayedStones).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="middle-section" ref={middleSectionRef}>
                        <button
                            onClick={handleCollect}
                            onTouchStart={(e) => { e.preventDefault(); handleCollect(e); }}
                            disabled={energy < 1}
                            className="coin-button"
                        >
                            <div ref={coinHolderRef} className="coin-holder">
                                <img ref={coinRef} src={coinImage} alt="Coin" className="coin-image-main" />
                            </div>
                        </button>
                    </div>
                    <div className="bottom-section">
                        <div className="energy-container">
                            <div className="energy-bar">
                                <div className="energy-bar-slider" style={{ width: `${(energy / maxEnergy) * 100}%` }} />
                            </div>
                            <span className="energy-value">{energy}/{maxEnergy}</span>
                        </div>
                        <button onClick={() => navigate("/leaderboard")} className="rating-button">
                            <div className="rating-left">
                                <img src={leagues[safeLeague]} alt={safeLeague} className="rating-icon" />
                                <span className="league-name">{safeLeague}</span>
                            </div>
                            <span className="rating-divider"></span>
                            <span className="rating-text">Go to rating</span>
                        </button>
                    </div>
                </div>
                <div className="bottom-nav">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
};

export default MainPage;