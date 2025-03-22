import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const Layout = () => {
    return (
        <div className="layout-container">
            {/* Фон */}
            <div className="background-layer"></div>
            {/* Размытый полупрозрачный слой */}
            <div className="backdrop"></div>
            <Outlet />
            <BottomNav />
        </div>
    );
};

export default Layout;