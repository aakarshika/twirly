import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsPanel = ({ onClose }) => {
  const { currentTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    privacy: 'public'
  });

  const handleSettingChange = (setting) => (e) => {
    setSettings(prev => ({
      ...prev,
      [setting]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.colors.cardBackground }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentTheme.colors.text }}
            >
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={handleSettingChange('notifications')}
                  className="form-checkbox h-5 w-5"
                />
                <span style={{ color: currentTheme.colors.text }}>
                  Enable notifications
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.emailUpdates}
                  onChange={handleSettingChange('emailUpdates')}
                  className="form-checkbox h-5 w-5"
                />
                <span style={{ color: currentTheme.colors.text }}>
                  Email updates
                </span>
              </label>
            </div>
          </div>

          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentTheme.colors.text }}
            >
              Appearance
            </h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={handleSettingChange('darkMode')}
                className="form-checkbox h-5 w-5"
              />
              <span style={{ color: currentTheme.colors.text }}>
                Dark mode
              </span>
            </label>
          </div>

          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentTheme.colors.text }}
            >
              Privacy
            </h3>
            <select
              value={settings.privacy}
              onChange={handleSettingChange('privacy')}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.border
              }}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 