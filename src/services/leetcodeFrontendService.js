const API_URL = 'http://localhost:5000/api';

export const leetcodeAPI = {
    // Get user stats (total solved, easy/medium/hard)
    getStats: async (username) => {
        try {
            const response = await fetch(`${API_URL}/leetcode/${username}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch stats');
            }
            return await response.json();
        } catch (error) {
            console.error('LeetCode Stats Error:', error);
            return null;
        }
    },

    // Get recently solved problems
    getRecentSubmissions: async (username) => {
        try {
            const response = await fetch(`${API_URL}/leetcode/${username}/recent`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch submissions');
            }
            return await response.json();
        } catch (error) {
            console.error('LeetCode Recent Submissions Error:', error);
            return [];
        }
    }
};
