import './FilterBar.css';

const FilterBar = ({
    selectedCategory,
    selectedStatus,
    selectedDifficulty,
    searchQuery,
    onCategoryChange,
    onStatusChange,
    onDifficultyChange,
    onSearchChange,
    categories,
    categoryNames,
}) => {
    return (
        <div className="filter-bar">
            <div className="filter-row">
                <div className="filter-group">
                    <label>Category:</label>
                    <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories
                            .filter((cat) => cat !== 'all')
                            .map((cat) => (
                                <option key={cat} value={cat}>
                                    {categoryNames[cat]}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status:</label>
                    <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Difficulty:</label>
                    <select value={selectedDifficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
