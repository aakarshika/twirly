import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Shield, Lock, Key, Save } from 'lucide-react';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const SecuritySettings = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [securitySettings, setSecuritySettings] = useState({
    password: {
      current: '',
      new: '',
      confirm: ''
    }
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      password: {
        ...prev.password,
        [name]: value
      }
    }));
    // Clear any previous messages
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Validate passwords
      if (securitySettings.password.new !== securitySettings.password.confirm) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (securitySettings.password.new.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
        return;
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: securitySettings.password.new
      });

      if (error) throw error;

      // Clear form and show success message
      setSecuritySettings(prev => ({
        ...prev,
        password: {
          current: '',
          new: '',
          confirm: ''
        }
      }));
      setPasswordSuccess('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  // Check if user has email/password auth
  const hasPasswordAuth = user?.app_metadata?.provider === 'email';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-md text-gray-500 font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Security Settings
        </h2>
        <Button
          onClick={handleUpdatePassword}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
          disabled={!hasPasswordAuth}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div 
          className="p-6 rounded-lg relative"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm">
            Coming Soon
          </div>
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Shield size={20} />
            <span>Two-Factor Authentication</span>
          </h3>
          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                Enable Two-Factor Authentication
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input
                type="checkbox"
                className="sr-only peer"
                disabled
              />
              <div 
                className="w-11 h-6 rounded-full peer"
                style={{ 
                  backgroundColor: currentTheme.colors.border
                }}
              >
                <div 
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    transform: 'translateX(0)'
                  }}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Password Change */}
        {hasPasswordAuth ? (
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
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-500">{passwordSuccess}</p>
              )}
            </div>
          </div>
        ) : (
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
              <span>Account Security</span>
            </h3>
            <p style={{ color: currentTheme.colors.text }}>
              Your account is secured through {user?.app_metadata?.provider || 'social authentication'}. 
              Password management is not available for social login accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings; 