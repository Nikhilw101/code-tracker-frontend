import { useState, useEffect } from 'react';
import { leetcodeAPI } from '../services/leetcodeFrontendService';
import './LeetCodeActivity.css';

const LeetCodeActivity = ({ username }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (username) {
            fetchActivity();
        }
    }, [username]);

    const fetchActivity = async () => {
        setLoading(true);
        const data = await leetcodeAPI.getRecentSubmissions(username);
        if (data) {
            setActivities(data);
        }
        setLoading(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!username) return null;

    return (
        <div className="leetcode-activity-card">
            <h3>Recent Activity 🕒</h3>

            {loading ? (
                <div className="activity-loading">Loading history...</div>
            ) : activities.length > 0 ? (
                <div className="activity-list">
                    {activities.map((item, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-info">
                                <span className="activity-title">{item.title}</span>
                                <span className="activity-time">{formatTime(item.timestamp)}</span>
                            </div>
                            <span className="activity-status">✅ Solved</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="activity-empty">No recent activity found</div>
            )}
        </div>
    );
};

export default LeetCodeActivity;
