import { useNavigate, useLocation } from "react-router-dom";

// Импортируем иконки из src/assets/bot_menu/
import homeIcon from "../assets/bot_menu/home.png";
import frensIcon from "../assets/bot_menu/frens.png";
import earnIcon from "../assets/bot_menu/earn.png";
import boostsIcon from "../assets/bot_menu/boosts.png";
import airdropsIcon from "../assets/bot_menu/airdrops.png";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Плейсхолдер
    const placeholderImage = "https://boyard-ufa.ru/upload/iblock/fa3/d9spt6f3qd3wlbqvmgjtxfwo8y7pojz0.png";

    const navItems = [
        { path: "/", image: homeIcon, label: "Home" },
        { path: "/friends", image: frensIcon, label: "Frens" },
        { path: "/earn", image: earnIcon, label: "Earn" },
        { path: "/boosts", image: boostsIcon, label: "Boosts" },
        { path: "/airdrop", image: airdropsIcon, label: "Airdrop" },
    ];

    return (
        <div className="bottom-nav">
            <div className="nav-items">
                {navItems.map((item) => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${
                            location.pathname === item.path ? "active" : "inactive"
                        }`}
                    >
                        <img
                            src={item.image}
                            alt={item.label}
                            className="nav-icon"
                            onError={(e) => {
                                e.currentTarget.src = placeholderImage; // Подставляем плейсхолдер при ошибке
                            }}
                        />
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;