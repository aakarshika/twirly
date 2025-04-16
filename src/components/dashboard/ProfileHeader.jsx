import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ userData }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

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

        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
          <User size={48} className="text-gray-400" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            {userData?.username }
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
        onClick={() => navigate('/settings')}
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