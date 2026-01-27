import { useApp } from '../context/AppContext';
import './DailyGoal.css';

const DailyGoal = ({ todayCompleted }) => {
    const { dailyGoal, setDailyGoal } = useApp();
    const percentage = Math.min((todayCompleted / dailyGoal) * 100, 100);
    const isMissing = todayCompleted < dailyGoal;
    const isComplete = todayCompleted >= dailyGoal;

    return (
        <div className={`daily-goal-card ${isComplete ? 'complete' : isMissing ? 'warning' : ''}`}>
            <div className="daily-goal-header">
                <h2>Daily Goal {isComplete && '🎉'}</h2>
                <span className="goal-count">
                    {todayCompleted} / {dailyGoal}
                </span>
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="goal-footer">
                {isComplete ? (
                    <p className="success-message">✅ Daily goal achieved! Keep it up!</p>
                ) : (
                    <p className="warning-message">
                        ⚠️ {dailyGoal - todayCompleted} more problem{dailyGoal - todayCompleted > 1 ? 's' : ''} to reach your goal
                    </p>
                )}
            </div>
        </div>
    );
};

export default DailyGoal;
