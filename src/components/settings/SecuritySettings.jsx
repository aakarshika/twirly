import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, Lock, Key, Smartphone, Save, Check, X } from 'lucide-react';
import Button from '../common/Button';

const SecuritySettings = () => {
  const { currentTheme } = useTheme();
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    password: {
      current: '',
      new: '',
      confirm: ''
    },
    devices: [
      {
        id: '1',
        name: 'MacBook Pro',
        lastActive: '2024-03-15 14:30',
        location: 'San Francisco, CA',
        isCurrent: true
      },
      {
        id: '2',
        name: 'iPhone 13',
        lastActive: '2024-03-15 14:25',
        location: 'San Francisco, CA',
        isCurrent: false
      }
    ],
    sessions: [
      {
        id: '1',
        browser: 'Chrome',
        os: 'macOS',
        ip: '192.168.1.1',
        lastActive: '2024-03-15 14:30',
        isCurrent: true
      }
    ]
  });

  const handleTwoFactorToggle = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFactorAuth: !prev.twoFactorAuth
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      password: {
        ...prev.password,
        [name]: value
      }
    }));
  };

  const handleUpdatePassword = () => {
    // TODO: Implement password update with Supabase
    console.log('Updating password:', securitySettings.password);
  };

  const handleRevokeDevice = (id) => {
    // TODO: Implement device revocation with Supabase
    console.log('Revoking device:', id);
  };

  const handleEndSession = (id) => {
    // TODO: Implement session termination with Supabase
    console.log('Ending session:', id);
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving security settings:', securitySettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Security Settings
        </h2>
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
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
            <span>Two-Factor Authentication</span>
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                Enable Two-Factor Authentication
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={securitySettings.twoFactorAuth}
                onChange={handleTwoFactorToggle}
              />
              <div 
                className="w-11 h-6 rounded-full peer"
                style={{ 
                  backgroundColor: securitySettings.twoFactorAuth 
                    ? currentTheme.colors.primary 
                    : currentTheme.colors.border
                }}
              >
                <div 
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    transform: securitySettings.twoFactorAuth 
                      ? 'translateX(5px)' 
                      : 'translateX(0)'
                  }}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Password Change */}
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
            <Lock size={20} />
            <span>Change Password</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Current Password
              </label>
              <input
                type="password"
                name="current"
                value={securitySettings.password.current}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                New Password
              </label>
              <input
                type="password"
                name="new"
                value={securitySettings.password.new}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirm"
                value={securitySettings.password.confirm}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <Button
              onClick={handleUpdatePassword}
              className="flex items-center space-x-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Key size={16} />
              <span>Update Password</span>
            </Button>
          </div>
        </div>

        {/* Active Devices */}
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
            <Smartphone size={20} />
            <span>Active Devices</span>
          </h3>
          <div className="space-y-4">
            {securitySettings.devices.map(device => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    {device.name}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    Last active: {device.lastActive}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    Location: {device.location}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {device.isCurrent ? (
                    <span className="text-sm" style={{ color: currentTheme.colors.primary }}>
                      Current Device
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
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
            <Key size={20} />
            <span>Active Sessions</span>
          </h3>
          <div className="space-y-4">
            {securitySettings.sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    {session.browser} on {session.os}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    IP: {session.ip}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    Last active: {session.lastActive}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {session.isCurrent ? (
                    <span className="text-sm" style={{ color: currentTheme.colors.primary }}>
                      Current Session
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 