import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const defaultSettings = {
    notifications: {
      workoutReminders: true,
      mealReminders: true,
      progressUpdates: true
    },
    preferences: {
      theme: 'light',
      language: 'english',
      units: 'metric'
    },
    privacy: {
      shareProgress: false,
      publicProfile: false
    }
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [saveStatus, setSaveStatus] = useState('');

  const handleNotificationChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting]
      }
    }));
    setSaveStatus('');
  };

  const handlePreferenceChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [setting]: value
      }
    }));
    setSaveStatus('');
  };

  const handlePrivacyChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting]
      }
    }));
    setSaveStatus('');
  };

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('userSettings');
    setSaveStatus('Settings reset to defaults!');
    setTimeout(() => setSaveStatus(''), 3000);
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
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.progressUpdates}
                onChange={() => handleNotificationChange('progressUpdates')}
              />
              Progress Updates
            </label>
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
          <div className="setting-item">
            <label>Units</label>
            <select
              value={settings.preferences.units}
              onChange={(e) => handlePreferenceChange('units', e.target.value)}
            >
              <option value="metric">Metric (kg, km)</option>
              <option value="imperial">Imperial (lbs, miles)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Privacy</h2>
        <div className="settings-group">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.privacy.shareProgress}
                onChange={() => handlePrivacyChange('shareProgress')}
              />
              Share Progress with Friends
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.privacy.publicProfile}
                onChange={() => handlePrivacyChange('publicProfile')}
              />
              Public Profile
            </label>
          </div>
        </div>
      </section>

      {saveStatus && (
        <div className="settings-status">
          {saveStatus}
        </div>
      )}

      <div className="settings-actions">
        <button className="save-button" onClick={handleSave}>Save Changes</button>
        <button className="reset-button" onClick={handleReset}>Reset to Defaults</button>
      </div>
    </div>
  );
};

export default Settings;
