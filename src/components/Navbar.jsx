import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useApp();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <span className="brand-icon">📝</span>
                    <span className="brand-text">LeetCode Tracker</span>
                </Link>

                {currentUser && (
                    <div className="navbar-menu">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/problems"
                            className={`nav-link ${isActive('/problems') ? 'active' : ''}`}
                        >
                            Problems
                        </Link>
                        <Link
                            to="/settings"
                            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
                        >
                            Settings
                        </Link>
                    </div>
                )}

                <div className="navbar-user">
                    {currentUser ? (
                        <>
                            <span className="user-name">👤 {currentUser.username}</span>
                            <button onClick={logout} className="btn-logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-login">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
