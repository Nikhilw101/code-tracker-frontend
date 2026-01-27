// API client for email service backend
// We use the common config
import { API_BASE_URL } from '../config';

export const emailAPI = {
    // Save email preferences
    savePreferences: async (userId, preferences) => {
        try {
            // preferences contains { email, enableDailyReminder, ... }
            // The new API expects { email, preferences: { enableDailyReminder... } }

            const payload = {
                email: preferences.email,
                preferences: {
                    enableDailyReminder: preferences.enableDailyReminder,
                    enableEndOfDaySummary: preferences.enableEndOfDaySummary
                }
            };

            const response = await fetch(`${API_BASE_URL}/user/${userId}/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving email preferences:', error);
            return { success: false, error: error.message };
        }
    },

    // Get email preferences
    getPreferences: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}`);
            const data = await response.json();

            if (data.success && data.data) {
                // Merge top-level email with nested preferences object for frontend compatibility
                return {
                    email: data.data.email,
                    ...data.data.preferences
                };
            }
            throw new Error('User data not found');
        } catch (error) {
            console.error('Error getting email preferences:', error);
            return {
                enableDailyReminder: false,
                enableEndOfDaySummary: false,
                email: '',
            };
        }
    },

    // Test email configuration
    testEmail: async (email) => {
        try {
            const response = await fetch(`${API_BASE_URL}/email/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error testing email:', error);
            return { success: false, error: error.message };
        }
    },

    // Send daily reminder
    sendReminder: async (userId, email, username, todayCompleted, dailyGoal) => {
        try {
            const response = await fetch(`${API_BASE_URL}/email/send-reminder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    email,
                    username,
                    todayCompleted,
                    dailyGoal,
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error sending reminder:', error);
            return { success: false, error: error.message };
        }
    },

    // Send end of day summary
    sendSummary: async (userId, email, username, stats) => {
        try {
            const response = await fetch(`${API_BASE_URL}/email/send-summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    email,
                    username,
                    stats,
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error sending summary:', error);
            return { success: false, error: error.message };
        }
    },
};
