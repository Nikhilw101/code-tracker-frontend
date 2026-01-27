import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { categoryNames } from '../data/problems';
import { leetcodeAPI } from '../services/leetcodeFrontendService';
import DailyGoal from '../components/DailyGoal';
import StatsCard from '../components/StatsCard';
import CategoryProgress from '../components/CategoryProgress';
import LeetCodeStats from '../components/LeetCodeStats';
import LeetCodeActivity from '../components/LeetCodeActivity';
import './Dashboard.css';

const Dashboard = () => {
    const { getStatistics, currentUser, currentUserId } = useApp();
    const stats = getStatistics();

    // LeetCode Stats State
    const [leetCodeStats, setLeetCodeStats] = useState(null);
    const [leetCodeLoading, setLeetCodeLoading] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (currentUserId) {
            const storedUsername = localStorage.getItem(`leetcode_user_${currentUserId}`);
            if (storedUsername) {
                setUsername(storedUsername);
                fetchLeetCodeStats(storedUsername);
            }
        }
    }, [currentUserId]);

    const fetchLeetCodeStats = async (user) => {
        setLeetCodeLoading(true);
        const data = await leetcodeAPI.getStats(user);
        if (data) {
            setLeetCodeStats(data);
        }
        setLeetCodeLoading(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, {currentUser?.username}! 👋</h1>
                <p>Track your progress and achieve your coding goals</p>
            </div>

            <DailyGoal todayCompleted={stats.todayCompleted} />

            <LeetCodeStats stats={leetCodeStats} loading={leetCodeLoading} />

            <LeetCodeActivity username={username} />

            <div className="stats-grid">
                <StatsCard
                    title="Total Solved"
                    value={stats.completed}
                    total={stats.total}
                    icon="✅"
                    color="success"
                />
                <StatsCard
                    title="Today's Progress"
                    value={stats.todayCompleted}
                    icon="🔥"
                    color="primary"
                />
                <StatsCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon="⏳"
                    color="warning"
                />
                <StatsCard
                    title="Current Streak"
                    value={stats.streak}
                    icon="🎯"
                    color="info"
                    suffix=" days"
                />
            </div>

            <div className="category-section">
                <h2>Progress by Category</h2>
                <div className="category-grid">
                    {Object.keys(stats.categoryProgress).map((category) => (
                        <CategoryProgress
                            key={category}
                            name={categoryNames[category]}
                            completed={stats.categoryProgress[category].completed}
                            total={stats.categoryProgress[category].total}
                            percentage={stats.categoryProgress[category].percentage}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
