import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categoryNames } from '../data/problems';
import ProblemCard from '../components/ProblemCard';
import FilterBar from '../components/FilterBar';
import './Problems.css';

const Problems = () => {
    const { getProblemsWithProgress } = useApp();
    const problemsWithProgress = getProblemsWithProgress();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Get all problems as a flat array
    const getAllProblems = () => {
        const allProblems = [];
        Object.keys(problemsWithProgress).forEach((category) => {
            problemsWithProgress[category].forEach((problem) => {
                allProblems.push({ ...problem, category });
            });
        });
        return allProblems;
    };

    // Filter problems
    const filteredProblems = getAllProblems().filter((problem) => {
        const matchesCategory = selectedCategory === 'all' || problem.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || problem.status === selectedStatus;
        const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesStatus && matchesDifficulty && matchesSearch;
    });

    return (
        <div className="problems-page">
            <div className="problems-header">
                <h1>Problem Sheet</h1>
                <p>Track and complete LeetCode problems organized by category</p>
            </div>

            <FilterBar
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                selectedDifficulty={selectedDifficulty}
                searchQuery={searchQuery}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                onDifficultyChange={setSelectedDifficulty}
                onSearchChange={setSearchQuery}
                categories={['all', ...Object.keys(problemsWithProgress)]}
                categoryNames={categoryNames}
            />

            <div className="problems-stats">
                <span>Showing {filteredProblems.length} problems</span>
            </div>

            <div className="problems-list">
                {filteredProblems.length === 0 ? (
                    <div className="no-problems">
                        <p>No problems found matching your filters</p>
                    </div>
                ) : (
                    filteredProblems.map((problem) => (
                        <ProblemCard key={problem.id} problem={problem} category={problem.category} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Problems;
