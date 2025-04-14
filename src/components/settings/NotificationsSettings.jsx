import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Mail, MessageSquare, ThumbsUp, UserPlus } from 'lucide-react';
import Button from '../common/Button';

const NotificationsSettings = () => {
  const { currentTheme } = useTheme();
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      newComparisons: true,
      votes: true,
      comments: true,
      mentions: true,
      followers: true
    },
    push: {
      newComparisons: true,
      votes: true,
      comments: true,
      mentions: true,
      followers: true
    },
    inApp: {
      newComparisons: true,
      votes: true,
      comments: true,
      mentions: true,
      followers: true
    }
  });

  const handleToggle = (type, category) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: !prev[type][category]
      }
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving notification preferences:', notificationPreferences);
  };

  const notificationTypes = [
    { id: 'newComparisons', label: 'New Comparisons', icon: <Bell size={16} /> },
    { id: 'votes', label: 'Votes', icon: <ThumbsUp size={16} /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare size={16} /> },
    { id: 'mentions', label: 'Mentions', icon: <Mail size={16} /> },
    { id: 'followers', label: 'New Followers', icon: <UserPlus size={16} /> }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Notification Settings
        </h2>
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Email Notifications
          </h3>
          <div className="space-y-4">
            {notificationTypes.map(({ id, label, icon }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {icon}
                  <span style={{ color: currentTheme.colors.text }}>{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.email[id]}
                    onChange={() => handleToggle('email', id)}
                  />
                  <div 
                    className="w-11 h-6 rounded-full peer"
                    style={{ 
                      backgroundColor: notificationPreferences.email[id] 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.border
                    }}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                      style={{ 
                        backgroundColor: currentTheme.colors.background,
                        transform: notificationPreferences.email[id] 
                          ? 'translateX(5px)' 
                          : 'translateX(0)'
                      }}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Push Notifications
          </h3>
          <div className="space-y-4">
            {notificationTypes.map(({ id, label, icon }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {icon}
                  <span style={{ color: currentTheme.colors.text }}>{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.push[id]}
                    onChange={() => handleToggle('push', id)}
                  />
                  <div 
                    className="w-11 h-6 rounded-full peer"
                    style={{ 
                      backgroundColor: notificationPreferences.push[id] 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.border
                    }}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                      style={{ 
                        backgroundColor: currentTheme.colors.background,
                        transform: notificationPreferences.push[id] 
                          ? 'translateX(5px)' 
                          : 'translateX(0)'
                      }}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            In-App Notifications
          </h3>
          <div className="space-y-4">
            {notificationTypes.map(({ id, label, icon }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {icon}
                  <span style={{ color: currentTheme.colors.text }}>{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.inApp[id]}
                    onChange={() => handleToggle('inApp', id)}
                  />
                  <div 
                    className="w-11 h-6 rounded-full peer"
                    style={{ 
                      backgroundColor: notificationPreferences.inApp[id] 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.border
                    }}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                      style={{ 
                        backgroundColor: currentTheme.colors.background,
                        transform: notificationPreferences.inApp[id] 
                          ? 'translateX(5px)' 
                          : 'translateX(0)'
                      }}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings; 