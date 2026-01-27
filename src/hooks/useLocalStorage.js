import { useState, useEffect } from 'react';
import { storage } from '../utils/helpers';

// Custom hook for localStorage
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        return storage.get(key, initialValue);
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storage.set(key, valueToStore);
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

// Hook for notification permissions
export const useNotificationPermission = () => {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') {
            console.warn('Notifications not supported');
            return false;
        }

        if (permission === 'granted') return true;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    return { permission, requestPermission };
};

// Hook for browser notifications
export const useNotification = () => {
    const { permission, requestPermission } = useNotificationPermission();

    const showNotification = (title, options = {}) => {
        if (permission !== 'granted') {
            requestPermission().then((granted) => {
                if (granted) {
                    new Notification(title, options);
                }
            });
        } else {
            new Notification(title, options);
        }
    };

    return { showNotification, requestPermission, permission };
};
