import './StatsCard.css';

const StatsCard = ({ title, value, total, icon, color, suffix = '' }) => {
    return (
        <div className={`stats-card ${color}`}>
            <div className="stats-icon">{icon}</div>
            <div className="stats-content">
                <h3>{title}</h3>
                <div className="stats-value">
                    {value}{suffix}
                    {total && <span className="stats-total"> / {total}</span>}
                </div>
                {total && (
                    <div className="stats-progress-bar">
                        <div
                            className="stats-progress-fill"
                            style={{ width: `${(value / total) * 100}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
