// src/App.tsx
import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import WebApp from "@twa-dev/sdk";
import { socket, initSocketListeners, cleanupSocketListeners } from "./utils/socket";
import { login, getProfile } from "./utils/api";
import { setUser } from "./store/slices/userSlice";
import MainPage from "./pages/MainPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import FriendsPage from "./pages/FriendsPage";
import EarnPage from "./pages/EarnPage";
import BoostsPage from "./pages/BoostsPage";
import AirdropPage from "./pages/AirdropPage";
import Layout from "./components/Layout";
import { UserState } from "./store/slices/userSlice";

import "./styles/layout.css";
import "./styles/main-page.css";
import "./styles/leaderboard-page.css";
import "./styles/friends-page.css";
import "./styles/earn-page.css";
import "./styles/boosts-page.css";
import "./styles/airdrop-page.css";
import "./styles/bottom-nav.css";
import "./App.css";

const FAKE_INIT_DATA = "auth_date=1698771234&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22test_user%22%7D&signature=abc123";

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: "/", element: <MainPage socket={socket} /> },
            { path: "/leaderboard", element: <LeaderboardPage /> },
            { path: "/friends", element: <FriendsPage /> },
            { path: "/earn", element: <EarnPage /> },
            { path: "/boosts", element: <BoostsPage /> },
            { path: "/airdrop", element: <AirdropPage /> },
        ],
    },
]);

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const [isSocketInitialized, setIsSocketInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const initAuth = async () => {
        if (user && user.telegramId) return setIsLoading(false);

        const initData = WebApp.initData || FAKE_INIT_DATA;
        const telegramUser = WebApp.initDataUnsafe.user || { id: 123456, username: "test_user" };

        if (WebApp.initData) WebApp.expand();

        const telegramId = String(telegramUser.id);
        const username = telegramUser.username || `Miner_${Math.random().toString(36).substring(7)}`;

        try {
            const loginUser = await login(initData);
            const profile = await getProfile();
            dispatch(setUser({ ...loginUser, ...profile } as Partial<UserState>));
        } catch (error) {
            console.error("[App] Error during init:", error);
            localStorage.removeItem("token");
            dispatch(setUser({
                telegramId,
                username,
                stones: 0,
                energy: 1000,
                boosts: [],
                skins: [],
                tasksCompleted: [],
                league: "Pebble",
                energyRegenRate: 1,
                stonesPerClick: 1,
                autoStonesPerSecond: 0,
                maxEnergy: 1000,
                isPremium: false,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const initSocket = () => {
        if (!user?.telegramId || isSocketInitialized) return;

        const handleUserUpdate = (data: { stones: number; league: string; energy?: number }) => {
            dispatch(setUser({ stones: data.stones, league: data.league, energy: data.energy }));
        };

        initSocketListeners(user.telegramId, handleUserUpdate);
        setIsSocketInitialized(true);

        return () => cleanupSocketListeners(handleUserUpdate);
    };

    useEffect(() => {
        initAuth();
    }, [dispatch]);

    useEffect(() => {
        const cleanup = initSocket();
        return () => cleanup && cleanup();
    }, [user, isSocketInitialized]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <TonConnectUIProvider manifestUrl="https://telegrambot-kappa-lake.vercel.app/tonconnect-manifest.json">
            <div className="app-container">
                <RouterProvider router={router} />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;