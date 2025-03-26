import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getLeaderboard } from "../utils/api";
import { leagueData, LeagueName } from "../utils/leagues";
import telegramplus from "../assets/frens/telegramplus.png";
import friendIcon from "../assets/frens/telegram.png";
import stoneImage from "../assets/stone.png";

interface Player {
    telegramId: string;
    username: string;
    stones: number;
    photo_url: string;
    isPremium: boolean;
}

const LeaderboardPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(0); // По умолчанию первая лига
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        // Устанавливаем лигу пользователя только после полной загрузки
        if (user?.league) {
            const index = leagueData.findIndex((l) => l.name === user.league);
            if (index !== -1 && index !== selectedLeagueIndex) {
                setSelectedLeagueIndex(index);
            }
        }
    }, [user?.league]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsFetching(true);
            try {
                const data = await getLeaderboard(leagueData[selectedLeagueIndex].name as LeagueName);
                console.log(`Leaderboard for ${leagueData[selectedLeagueIndex].name}:`, data); // Логи для отладки
                setPlayers(data.slice(0, 100));
            } catch (error) {
                console.error("[Leaderboard] Fetch error:", error);
                setPlayers([]);
            } finally {
                setIsFetching(false);
            }
        };
        fetchLeaderboard();
    }, [selectedLeagueIndex]);

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-content">
                <div className="league-switcher">
                    <button
                        onClick={() => setSelectedLeagueIndex((prev) => Math.max(prev - 1, 0))}
                        className="arrow-button"
                        disabled={selectedLeagueIndex === 0}
                    >
                        <span className="arrow-icon">❮</span>
                    </button>
                    <div className="league-display">
                        <div className="stars-container">
                            <div id="stars"></div>
                            <div id="stars2"></div>
                            <div id="stars3"></div>
                            <img src={leagueData[selectedLeagueIndex].icon} alt={leagueData[selectedLeagueIndex].name} className="league-icon" />
                        </div>
                        <h1 className="league-title">{leagueData[selectedLeagueIndex].name} League</h1>
                        <p className="league-min-stones">From {leagueData[selectedLeagueIndex].minStones.toLocaleString()} 🪨</p>
                    </div>
                    <button
                        onClick={() => setSelectedLeagueIndex((prev) => Math.min(prev + 1, leagueData.length - 1))}
                        className="arrow-button"
                        disabled={selectedLeagueIndex === leagueData.length - 1}
                    >
                        <span className="arrow-icon">❯</span>
                    </button>
                </div>

                <div className="leaderboard-card">
                    {isFetching ? (
                        <div>Loading...</div>
                    ) : players.length > 0 ? (
                        players.map((player, index) => (
                            <div key={player.telegramId} className="leader-item">
                                <img
                                    src={player.photo_url || (player.isPremium ? telegramplus : friendIcon)}
                                    alt={player.username}
                                    className="leader-avatar"
                                    onError={(e) => { e.currentTarget.src = player.isPremium ? telegramplus : friendIcon; }}
                                />
                                <div className="leader-info">
                                    <span className="leader-name">{player.username}</span>
                                    <div className="leader-score">
                                        <img src={stoneImage} alt="Stone" className="leader-reward-icon" />
                                        <span className="leader-text-xs">{player.stones.toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className="leader-rank">{index + 1}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-players">No players in this league yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;