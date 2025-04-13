import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileHeader = ({ userData }) => {
  const { currentTheme } = useTheme();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div 
      className="flex flex-col md:flex-row items-center justify-between p-6 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img 
            src="/default-avatar.png" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            {userData?.username || 'Anonymous'}
          </h1>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Member since {userData?.created_at ? formatDate(userData.created_at) : 'Unknown'}
          </p>
        </div>
      </div>
      
      <button
        className="mt-4 md:mt-0 px-4 py-2 rounded-lg font-medium"
        style={{ 
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.buttonText
        }}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileHeader; 