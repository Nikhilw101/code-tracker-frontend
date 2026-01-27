import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './BottomNav.css';

const BottomNav = () => {
    const { currentUser } = useApp();
    const location = useLocation();

    if (!currentUser) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bottom-nav">
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                <span className="nav-icon">📊</span>
                <span className="nav-label">Dashboard</span>
            </Link>
            <Link to="/problems" className={`nav-item ${isActive('/problems') ? 'active' : ''}`}>
                <span className="nav-icon">📝</span>
                <span className="nav-label">Problems</span>
            </Link>
            <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Settings</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
