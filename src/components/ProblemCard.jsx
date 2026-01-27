import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categoryNames } from '../data/problems';
import { formatDate, getTodayDateString } from '../utils/helpers';
import './ProblemCard.css';

const ProblemCard = ({ problem, category }) => {
    const { updateProblemProgress } = useApp();
    const [showDetails, setShowDetails] = useState(false);
    const [notes, setNotes] = useState(problem.notes || '');
    const [timeSpent, setTimeSpent] = useState(problem.timeSpent || 0);

    const handleStatusChange = (newStatus) => {
        const updates = { status: newStatus };
        if (newStatus === 'done' && problem.status !== 'done') {
            updates.dateCompleted = getTodayDateString();
        } else if (newStatus !== 'done') {
            updates.dateCompleted = null; // Clear completion date if unchecked
        }
        updateProblemProgress(problem.id, updates);
    };

    const handlePriorityChange = (priority) => {
        updateProblemProgress(problem.id, { priority });
    };

    const handleNotesChange = () => {
        updateProblemProgress(problem.id, { notes });
    };

    const handleTimeChange = () => {
        updateProblemProgress(problem.id, { timeSpent: Number(timeSpent) });
    };

    const getStatusColor = () => {
        switch (problem.status) {
            case 'done':
                return 'status-done';
            case 'inProgress':
                return 'status-progress';
            default:
                return 'status-todo';
        }
    };

    const getDifficultyColor = () => {
        switch (problem.difficulty) {
            case 'Easy':
                return 'difficulty-easy';
            case 'Medium':
                return 'difficulty-medium';
            case 'Hard':
                return 'difficulty-hard';
            default:
                return '';
        }
    };

    return (
        <div className={`problem-card ${getStatusColor()}`}>
            <div className="problem-main">
                <div className="problem-info">
                    <h3 className="problem-title">
                        <a href={problem.link} target="_blank" rel="noopener noreferrer">
                            {problem.title}
                        </a>
                    </h3>
                    <div className="problem-meta">
                        <span className={`difficulty-badge ${getDifficultyColor()}`}>
                            {problem.difficulty}
                        </span>
                        <span className="category-badge">{categoryNames[category]}</span>
                        {problem.dateCompleted && (
                            <span className="completion-date">
                                ✅ {formatDate(problem.dateCompleted)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="problem-actions">
                    <select
                        value={problem.status || 'todo'}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="status-select"
                    >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Done</option>
                    </select>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="btn-details"
                    >
                        {showDetails ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {showDetails && (
                <div className="problem-details">
                    <div className="detail-row">
                        <label>Priority:</label>
                        <div className="priority-buttons">
                            {['none', 'low', 'medium', 'high'].map((priority) => (
                                <button
                                    key={priority}
                                    onClick={() => handlePriorityChange(priority)}
                                    className={`priority-btn ${problem.priority === priority ? 'active' : ''}`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-row">
                        <label>Time Spent (minutes):</label>
                        <div className="time-input-group">
                            <input
                                type="number"
                                value={timeSpent}
                                onChange={(e) => setTimeSpent(e.target.value)}
                                min="0"
                            />
                            <button onClick={handleTimeChange} className="btn-save">
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="detail-row">
                        <label>Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add your notes, approach, or solution details..."
                            rows="4"
                        />
                        <button onClick={handleNotesChange} className="btn-save">
                            Save Notes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemCard;
