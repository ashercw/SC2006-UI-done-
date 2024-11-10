import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../hooks/useNotification'; // Import the hook
import { 
  requestNotificationPermission, 
  createWorkoutReminder, 
  createMealReminder 
} from '../../utils/notificationService';
import { convertWorkoutStats } from '../../utils/unitConverter';
import './Settings.css';

const Settings = () => {
  const { showSuccess, showError, showInfo } = useNotification(); // Destructure the hook
  const { theme, setTheme } = useTheme();
  const [notificationPermission, setNotificationPermission] = useState(
    ("Notification" in window) ? Notification.permission : "denied"
  );

  const defaultSettings = {
    notifications: {
      workoutReminders: false,
      mealReminders: false,
      progressUpdates: false
    },
    preferences: {
      theme: theme,
      language: 'english',
      units: 'metric'
    },
    privacy: {
      shareProgress: false,
      publicProfile: false
    }
  };

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [reminderTimes, setReminderTimes] = useState(() => {
    const savedTimes = localStorage.getItem('reminderTimes');
    return savedTimes ? JSON.parse(savedTimes) : {
      workout: '09:00',
      meal: '12:00'
    };
  });

  useEffect(() => {
    // Load saved settings on component mount
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      // Update theme from saved settings
      if (parsedSettings.preferences.theme !== theme) {
        setTheme(parsedSettings.preferences.theme);
      }
    }

    // Load saved reminder times
    const savedTimes = localStorage.getItem('reminderTimes');
    if (savedTimes) {
      setReminderTimes(JSON.parse(savedTimes));
    }
  }, [setTheme, theme]);

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  // Save reminder times whenever they change
  useEffect(() => {
    localStorage.setItem('reminderTimes', JSON.stringify(reminderTimes));
  }, [reminderTimes]);

  const handleNotificationChange = async (setting) => {
    if (!notificationPermission || notificationPermission === "denied") {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission ? "granted" : "denied");
      if (!permission) {
        setSaveStatus('Please enable notifications in your browser settings');
        return;
      }
    }
  
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [setting]: !prev.notifications[setting]
        }
      };
  
      // Save to localStorage immediately
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
  
      return updatedSettings;
    });
  
    setSaveStatus('');
  };
  

  const handlePreferenceChange = (setting, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        preferences: {
          ...prev.preferences,
          [setting]: value
        }
      };

      // Save to localStorage immediately
      localStorage.setItem('userSettings', JSON.stringify(newSettings));

      // If theme is changing, update it immediately
      if (setting === 'theme') {
        setTheme(value);
      }

      // If units are changing, convert existing workout data
      if (setting === 'units' && value !== prev.preferences.units) {
        const workoutData = localStorage.getItem('workoutData');
        if (workoutData) {
          const converted = convertWorkoutStats(
            JSON.parse(workoutData),
            prev.preferences.units,
            value
          );
          localStorage.setItem('workoutData', JSON.stringify(converted));
        }
      }

      return newSettings;
    });
    setSaveStatus('');
  };

  const handleReminderTimeChange = (type, time) => {
    setReminderTimes(prev => {
      const newTimes = {
        ...prev,
        [type]: time
      };
      // Save to localStorage immediately
      localStorage.setItem('reminderTimes', JSON.stringify(newTimes));
      return newTimes;
    });
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Notifications</h2>
        <div className="settings-group">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.workoutReminders}
                onChange={() => handleNotificationChange('workoutReminders')}
              />
              Workout Reminders
            </label>
            {settings.notifications.workoutReminders && (
              <input
                type="time"
                value={reminderTimes.workout}
                onChange={(e) => handleReminderTimeChange('workout', e.target.value)}
                className="time-input"
              />
            )}
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.mealReminders}
                onChange={() => handleNotificationChange('mealReminders')}
              />
              Meal Reminders
            </label>
            {settings.notifications.mealReminders && (
              <input
                type="time"
                value={reminderTimes.meal}
                onChange={(e) => handleReminderTimeChange('meal', e.target.value)}
                className="time-input"
              />
            )}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-group">
          <div className="setting-item">
            <label>Theme</label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Language</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
