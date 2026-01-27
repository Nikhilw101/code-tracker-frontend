import './CategoryProgress.css';

const CategoryProgress = ({ name, completed, total, percentage }) => {
    return (
        <div className="category-card">
            <div className="category-header">
                <h4>{name}</h4>
                <span className="category-count">
                    {completed} / {total}
                </span>
            </div>
            <div className="category-progress-bar">
                <div
                    className="category-progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="category-percentage">{percentage}% Complete</div>
        </div>
    );
};

export default CategoryProgress;
