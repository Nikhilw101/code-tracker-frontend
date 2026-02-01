import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from '../hooks/useLocalStorage'; // Keeping notification hook for now if generic, or check unique usage
import { problemsData } from '../data/problems';
import { API_BASE_URL } from '../config';
import { getTodayDateString } from '../utils/helpers';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userProgress, setUserProgress] = useState({});
    const [dailyGoal, setDailyGoal] = useState(4);
    const [loading, setLoading] = useState(true); // Start loading true
    const { showNotification, requestPermission } = useNotification();

    // Load session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('leetcode_tracker_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.userId) {
                    setCurrentUserId(parsedUser.userId);
                    // We can also store the full user object or fetch it
                    // For now, let's restore basic info if available, then fetch fresh
                    setCurrentUser(parsedUser);
                    fetchUserData(parsedUser.userId); // Fetch fresh data in background
                }
            } catch (e) {
                console.error('Failed to parse stored session');
                localStorage.removeItem('leetcode_tracker_user');
            }
        }
        setLoading(false);
    }, []);

    // Fetch User Data
    const fetchUserData = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}`);
            const data = await response.json();

            if (data.success) {
                const { username, email, leetcodeUsername, dailyGoal, preferences, progress } = data.data;

                const updatedUser = { username, email, leetcodeUsername, preferences, userId };
                setCurrentUser(updatedUser);
                setDailyGoal(dailyGoal || 4);

                // Update local storage with fresh data
                localStorage.setItem('leetcode_tracker_user', JSON.stringify(updatedUser));

                // Convert array progress to object map for frontend easy access
                const progressMap = {};
                progress.forEach(p => {
                    progressMap[p.problemId] = p;
                });
                setUserProgress(progressMap);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            showNotification('Error', { body: 'Failed to load progress' });
        }
    };

    // Auth functions
    const signup = async (username, password, email) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });
            const data = await response.json();

            if (data.success) {
                // Auto login
                const user = { userId: data.userId, username: data.username, email: data.email };
                setCurrentUserId(data.userId);
                setCurrentUser(user);
                setUserProgress({});

                // Persist
                localStorage.setItem('leetcode_tracker_user', JSON.stringify(user));

                return { success: true, message: 'Signup successful' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error during signup' };
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                const user = {
                    userId: data.userId,
                    username: data.username,
                    email: data.email,
                    preferences: data.preferences
                };
                setCurrentUserId(data.userId);
                setCurrentUser(user);

                // Persist
                localStorage.setItem('leetcode_tracker_user', JSON.stringify(user));

                await fetchUserData(data.userId);
                return { success: true, message: 'Login successful' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error during login' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setCurrentUserId(null);
        setCurrentUser(null);
        setUserProgress({});
        localStorage.removeItem('leetcode_tracker_user');
    };

    // Update problem progress
    const updateProblemProgress = async (problemId, updates) => {
        if (!currentUserId) return;

        // Optimistic UI update
        setUserProgress(prev => ({
            ...prev,
            [problemId]: { ...prev[problemId], ...updates }
        }));

        try {
            const pIdStr = String(problemId);
            const response = await fetch(`${API_BASE_URL}/user/${currentUserId}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemId: pIdStr, updates })
            });
            const data = await response.json();
            if (!data.success) {
                // Revert or show error
                console.error('Failed to sync progress');
            }
        } catch (error) {
            console.error('Network error saving progress');
        }
    };

    // Update Preferences (Daily Goal, LeetCode, Email)
    const updatePreferences = async (newPrefs) => {
        if (!currentUserId) return;

        // Optimistic
        if (newPrefs.dailyGoal) setDailyGoal(newPrefs.dailyGoal);
        if (newPrefs.leetcodeUsername) setCurrentUser(prev => ({ ...prev, leetcodeUsername: newPrefs.leetcodeUsername }));

        try {
            await fetch(`${API_BASE_URL}/user/${currentUserId}/preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrefs)
            });
        } catch (error) {
            console.error('Failed to save preferences');
        }
    };

    // Wrapper/Helpers to match legacy signature where possible or cleaner new one
    // We export setDailyGoal but hook it to API
    const handleSetDailyGoal = (goal) => {
        updatePreferences({ dailyGoal: goal });
    };

    // Get problems with progress
    const getProblemsWithProgress = () => {
        const result = {};

        Object.keys(problemsData).forEach(category => {
            result[category] = problemsData[category].map(problem => ({
                ...problem,
                ...(userProgress[problem.id] || { status: 'todo' }),
            }));
        });

        return result;
    };

    // Get statistics
    const getStatistics = () => {
        // Use userProgress state directly
        const problems = Object.values(userProgress); // Only contains touched problems

        // Wait, for 'total', 'todo' stats, we need ALL problems, not just touched ones. (Actually todo is implicit)
        // Let's iterate over ALL static data to get accurate totals

        let total = 0;
        let completed = 0;
        let inProgress = 0;
        let todo = 0;
        let todayCompleted = 0;

        const todayStr = getTodayDateString();
        Object.values(problemsData).flat().forEach(p => {
            total++;
            const progress = userProgress[p.id];
            if (progress?.status === 'done') {
                completed++;
                if (progress.dateCompleted === todayStr) {
                    todayCompleted++;
                }
            } else if (progress?.status === 'inProgress') {
                inProgress++;
            } else {
                todo++;
            }
        });

        // Calculate streak (client-side simple calc based on loaded progress)
        // Note: For full historic streak, we rely on what's loaded. 
        // Since we load all progress, this logic still works.
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let checkDate = new Date(today);
        // Simple streak check - limited to what's in memory. 
        // Ideally backend calculates this, but this is fine for now.
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const completedOnDate = problems.some(p =>
                p.status === 'done' && p.dateCompleted === dateStr
            );

            // Current day doesn't break streak if not done yet? usually streak is "consecutive days before today" + today if done
            // Let's stick to existing logic:
            const countOnDate = problems.filter(p => p.status === 'done' && p.dateCompleted === dateStr).length;

            if (countOnDate > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (checkDate.getTime() === today.getTime() && countOnDate === 0) {
                    // If today is 0, verify yesterday
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }

        // Category stats
        const categoryProgress = {};
        Object.keys(problemsData).forEach(category => {
            const categoryProblems = problemsData[category];
            const catCompleted = categoryProblems.filter(p => userProgress[p.id]?.status === 'done').length;
            categoryProgress[category] = {
                total: categoryProblems.length,
                completed: catCompleted,
                percentage: Math.round((catCompleted / categoryProblems.length) * 100)
            };
        });

        return {
            total,
            completed,
            inProgress,
            todo,
            todayCompleted,
            streak,
            categoryProgress,
        };
    };

    // Check daily goal notification
    useEffect(() => {
        if (!currentUserId) return;
        const stats = getStatistics();
        if (stats.todayCompleted >= dailyGoal) {
            // Logic for "Goal Achieved" notification
            // We can prevent spamming by tracking "notifiedToday" state if needed
        }
    }, [userProgress, dailyGoal]);

    const value = {
        currentUserId,
        currentUser,
        loading,
        userProgress,
        dailyGoal,

        signup,
        login,
        logout,

        updateProblemProgress,
        getProblemsWithProgress,
        getStatistics,

        setDailyGoal: handleSetDailyGoal,
        updatePreferences, // Expose for Settings page
        setUserProgress, // Exposed just in case, but prefer updateProblemProgress
        showNotification
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Helper
const isToday = (date) => {
    const today = new Date();
    return (
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
    );
};

