import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Eye, EyeOff, Lock, Globe, User, Shield, MessageSquare, Mail } from 'lucide-react';
import Button from '../../../../components/common/Button';

const PrivacySettings = () => {
  const { currentTheme } = useTheme();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // public, private, friends
    showEmail: false,
    showLocation: true,
    showActivity: true,
    allowMentions: true,
    allowMessages: true,
    dataSharing: {
      analytics: true,
      marketing: false,
      thirdParty: false
    }
  });

  const handleToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDataSharingToggle = (category) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataSharing: {
        ...prev.dataSharing,
        [category]: !prev.dataSharing[category]
      }
    }));
  };

  const handleProfileVisibilityChange = (visibility) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    // console.log('Saving privacy settings:', privacySettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-md text-gray-500 font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Privacy Settings
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
        {/* Profile Visibility */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Globe size={20} />
            <span>Profile Visibility</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleProfileVisibilityChange('public')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  privacySettings.profileVisibility === 'public'
                    ? 'bg-opacity-10 bg-current'
                    : 'hover:bg-opacity-5 hover:bg-current'
                }`}
                style={{ color: currentTheme.colors.text }}
              >
                <Globe size={16} />
                <span>Public</span>
              </button>
              <button
                onClick={() => handleProfileVisibilityChange('private')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  privacySettings.profileVisibility === 'private'
                    ? 'bg-opacity-10 bg-current'
                    : 'hover:bg-opacity-5 hover:bg-current'
                }`}
                style={{ color: currentTheme.colors.text }}
              >
                <Lock size={16} />
                <span>Private</span>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <User size={20} />
            <span>Personal Information</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span style={{ color: currentTheme.colors.text }}>Show Email Address</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.showEmail 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.showEmail 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe size={16} />
                <span style={{ color: currentTheme.colors.text }}>Show Location</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.showLocation}
                  onChange={() => handleToggle('showLocation')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.showLocation 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.showLocation 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Settings */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Eye size={20} />
            <span>Activity Settings</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye size={16} />
                <span style={{ color: currentTheme.colors.text }}>Show Activity Status</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.showActivity}
                  onChange={() => handleToggle('showActivity')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.showActivity 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.showActivity 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span style={{ color: currentTheme.colors.text }}>Allow Mentions</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.allowMentions}
                  onChange={() => handleToggle('allowMentions')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.allowMentions 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.allowMentions 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare size={16} />
                <span style={{ color: currentTheme.colors.text }}>Allow Direct Messages</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.allowMessages}
                  onChange={() => handleToggle('allowMessages')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.allowMessages 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.allowMessages 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Sharing */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Shield size={20} />
            <span>Data Sharing</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>Analytics Data</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.dataSharing.analytics}
                  onChange={() => handleDataSharingToggle('analytics')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.dataSharing.analytics 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.dataSharing.analytics 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>Marketing Data</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.dataSharing.marketing}
                  onChange={() => handleDataSharingToggle('marketing')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.dataSharing.marketing 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.dataSharing.marketing 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>Third-Party Data Sharing</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={privacySettings.dataSharing.thirdParty}
                  onChange={() => handleDataSharingToggle('thirdParty')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: privacySettings.dataSharing.thirdParty 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: privacySettings.dataSharing.thirdParty 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings; 