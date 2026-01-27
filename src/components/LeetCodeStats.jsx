import './LeetCodeStats.css';

const LeetCodeStats = ({ stats, loading }) => {
    if (loading) {
        return <div className="leetcode-stats-loading">Loading LeetCode stats...</div>;
    }

    if (!stats) {
        return (
            <div className="leetcode-stats-empty">
                <p>Link your LeetCode account in Settings to see your real-time stats!</p>
            </div>
        );
    }

    return (
        <div className="leetcode-stats-card">
            <div className="leetcode-header">
                <div className="leetcode-icon">
                    <img src="https://leetcode.com/static/images/LeetCode_logo_rvs.png" alt="LeetCode" />
                </div>
                <h3>LeetCode Sync</h3>
            </div>

            <div className="leetcode-total">
                <span className="total-count">{stats.totalSolved}</span>
                <span className="total-label">Solved</span>
            </div>

            <div className="leetcode-distribution">
                <div className="stat-item easy">
                    <span className="stat-label">Easy</span>
                    <span className="stat-count">{stats.easySolved}</span>
                </div>
                <div className="stat-item medium">
                    <span className="stat-label">Medium</span>
                    <span className="stat-count">{stats.mediumSolved}</span>
                </div>
                <div className="stat-item hard">
                    <span className="stat-label">Hard</span>
                    <span className="stat-count">{stats.hardSolved}</span>
                </div>
            </div>
        </div>
    );
};

export default LeetCodeStats;
