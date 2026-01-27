import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exportToJSON, importFromJSON } from '../utils/helpers';
import { emailAPI } from '../services/emailService';
import './Settings.css';

const Settings = () => {
    const { dailyGoal, setDailyGoal, userProgress, setUserProgress, currentUserId, currentUser, showNotification, getStatistics } = useApp();
    const [tempGoal, setTempGoal] = useState(dailyGoal);
    const [importing, setImporting] = useState(false);

    // Email settings state
    const [enableDailyReminder, setEnableDailyReminder] = useState(false);
    const [enableEndOfDaySummary, setEnableEndOfDaySummary] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');

    // LeetCode settings
    const [leetcodeUsername, setLeetcodeUsername] = useState('');

    // Load preferences on mount
    useEffect(() => {
        if (currentUserId) {
            loadPreferences();
        }
    }, [currentUserId]);

    const loadPreferences = async () => {
        // Load email prefs
        const prefs = await emailAPI.getPreferences(currentUserId);
        setEnableDailyReminder(prefs.enableDailyReminder || false);
        setEnableEndOfDaySummary(prefs.enableEndOfDaySummary || false);

        // Load LeetCode username (stored in localStorage via AppContext usually, but let's store here for now or use localStorage directly)
        const storedUsername = localStorage.getItem(`leetcode_user_${currentUserId}`);
        if (storedUsername) setLeetcodeUsername(storedUsername);
    };

    const handleSaveLeetCode = () => {
        localStorage.setItem(`leetcode_user_${currentUserId}`, leetcodeUsername);
        showNotification('Settings Saved', { body: `LeetCode username linked: ${leetcodeUsername}` });
    };

    const handleSaveGoal = () => {
        if (tempGoal < 1 || tempGoal > 20) {
            alert('Please enter a goal between 1 and 20');
            return;
        }
        setDailyGoal(tempGoal);
        showNotification('Settings Saved', { body: `Daily goal set to ${tempGoal} problems` });
    };

    const handleExport = () => {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            userId: currentUserId,
            dailyGoal,
            progress: userProgress[currentUserId],
        };
        exportToJSON(exportData, `leetcode-tracker-${new Date().toISOString().split('T')[0]}.json`);
        showNotification('Export Successful', { body: 'Your progress has been exported' });
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const data = await importFromJSON(file);

            if (!data.progress) {
                throw new Error('Invalid export file format');
            }

            setUserProgress({
                ...userProgress,
                [currentUserId]: data.progress,
            });

            if (data.dailyGoal) {
                setDailyGoal(data.dailyGoal);
                setTempGoal(data.dailyGoal);
            }

            showNotification('Import Successful', { body: 'Your progress has been imported' });
        } catch (error) {
            alert('Failed to import: ' + error.message);
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    // Email settings functions
    const handleSaveEmailSettings = async () => {
        setEmailLoading(true);
        setEmailMessage('');

        // We send empty email string, backend will fallback to env EMAIL_USER
        const result = await emailAPI.savePreferences(currentUserId, {
            email: '',
            enableDailyReminder,
            enableEndOfDaySummary,
            reminderTime: '', // Not used anymore
            summaryTime: '', // Not used anymore
        });

        setEmailLoading(false);

        if (result.success) {
            setEmailMessage('✅ Preferences saved successfully!');
            showNotification('Settings Saved', { body: 'Email preferences updated' });
        } else {
            setEmailMessage('❌ Failed to save settings: ' + result.error);
        }
    };

    const handleTestEmail = async () => {
        setEmailLoading(true);
        setEmailMessage('Sending test email...');

        // No email arg, backend uses default
        const result = await emailAPI.testEmail('');

        setEmailLoading(false);

        if (result.success) {
            setEmailMessage('✅ Test email sent! Check your inbox.');
        } else {
            setEmailMessage('❌ Failed to send test email. Check backend console.');
        }
    };

    const handleSendReminderNow = async () => {
        setEmailLoading(true);
        setEmailMessage('Sending daily reminder...');

        const stats = getStatistics();
        const result = await emailAPI.sendReminder(
            currentUserId,
            '', // Backend uses default
            currentUser?.username || 'User',
            stats.todayCompleted,
            dailyGoal
        );

        setEmailLoading(false);

        if (result.success) {
            setEmailMessage('✅ Daily reminder sent! Check your inbox.');
        } else {
            setEmailMessage('❌ Failed to send reminder: ' + result.error);
        }
    };

    const handleSendSummaryNow = async () => {
        setEmailLoading(true);
        setEmailMessage('Sending end-of-day summary...');

        const stats = getStatistics();
        const result = await emailAPI.sendSummary(
            currentUserId,
            '', // Backend uses default
            currentUser?.username || 'User',
            { ...stats, dailyGoal }
        );

        setEmailLoading(false);

        if (result.success) {
            setEmailMessage('✅ Summary sent! Check your inbox.');
        } else {
            setEmailMessage('❌ Failed to send summary: ' + result.error);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your preferences and data</p>
            </div>

            <div className="settings-section">
                <h2>Daily Goal</h2>
                <p>Set how many problems you want to solve each day</p>
                <div className="goal-input-group">
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={tempGoal}
                        onChange={(e) => setTempGoal(Number(e.target.value))}
                    />
                    <button onClick={handleSaveGoal} className="btn-primary">
                        Save Goal
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h2>🔗 LeetCode Integration</h2>
                <p>Connect your LeetCode profile to sync stats</p>
                <div className="goal-input-group">
                    <input
                        type="text"
                        placeholder="LeetCode Username (e.g. Nikhilw101)"
                        value={leetcodeUsername}
                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                    />
                    <button onClick={handleSaveLeetCode} className="btn-primary">
                        Link Profile
                    </button>
                </div>
            </div>

            {/* Email Notifications Section */}
            <div className="settings-section email-section">
                <h2>📧 Email Notifications</h2>
                <p>Notifications will be sent to your configured email address.</p>

                <div className="email-config">
                    <div className="notification-toggles">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <label className="toggle-label">Daily Reminders (Multiplier)</label>
                                <p className="toggle-description">
                                    Receive reminders at <strong>10:00 AM, 7:00 PM, and 11:00 PM</strong> daily.
                                </p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={enableDailyReminder}
                                    onChange={(e) => setEnableDailyReminder(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <label className="toggle-label">End-of-Day Summary</label>
                                <p className="toggle-description">
                                    Receive a complete summary of your achievements at <strong>11:00 PM</strong>.
                                </p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={enableEndOfDaySummary}
                                    onChange={(e) => setEnableEndOfDaySummary(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="email-actions">
                        <button
                            onClick={handleSaveEmailSettings}
                            className="btn-primary"
                            disabled={emailLoading}
                        >
                            {emailLoading ? 'Saving...' : 'Save Preferences'}
                        </button>
                        <button
                            onClick={handleTestEmail}
                            className="btn-secondary"
                            disabled={emailLoading}
                        >
                            Send Test Email
                        </button>
                    </div>

                    <div className="manual-triggers">
                        <h4>Manual Triggers (Testing)</h4>
                        <div className="trigger-buttons">
                            <button
                                onClick={handleSendReminderNow}
                                className="btn-secondary"
                                disabled={emailLoading}
                            >
                                📬 Send Reminder Now
                            </button>
                            <button
                                onClick={handleSendSummaryNow}
                                className="btn-secondary"
                                disabled={emailLoading}
                            >
                                📊 Send Summary Now
                            </button>
                        </div>
                    </div>

                    {emailMessage && (
                        <div className={`email-message ${emailMessage.includes('✅') ? 'success' : 'error'}`}>
                            {emailMessage}
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-section">
                <h2>Export / Import Data</h2>
                <p>Backup or restore your progress</p>
                <div className="export-import-buttons">
                    <button onClick={handleExport} className="btn-secondary">
                        📥 Export Progress
                    </button>
                    <label htmlFor="import-file" className="btn-secondary">
                        {importing ? 'Importing...' : '📤 Import Progress'}
                        <input
                            type="file"
                            id="import-file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                            disabled={importing}
                        />
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h2>Notifications</h2>
                <p>Enable browser notifications to stay on track</p>
                <button
                    onClick={() => {
                        Notification.requestPermission().then((permission) => {
                            if (permission === 'granted') {
                                showNotification('Notifications Enabled', {
                                    body: 'You will receive daily reminders',
                                });
                            }
                        });
                    }}
                    className="btn-secondary"
                >
                    Enable Browser Notifications
                </button>
            </div>
        </div>
    );
};

export default Settings;
