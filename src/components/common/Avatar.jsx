import React from 'react';
import { Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Avatar = ({ 
  profileImageUrl, 
  displayName, 
  username, 
  size = 'md', 
  isEditable = false, 
  onAvatarChange,
  className = '',
  onClick
}) => {
  const { currentTheme } = useTheme();

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32'
  };
  const fontSize = {
    sm: 'text-sm',
    md: 'text-md',
    lg: 'text-lg'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="relative">
      <div 
        onClick={onClick}
        className={`${sizeClass} rounded-full bg-cover bg-center overflow-hidden ${className}`}
        style={{ 
          backgroundColor: currentTheme.colors.border,
        }}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading image:', e);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}>
            <span className={`text-white ${fontSize[size]}`}>
              {(displayName?.[0] || username?.[0] || '?').toLowerCase()}
            </span>
          </div>
        )}
      </div>
      {isEditable && (
        <label 
          className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.background
          }}
        >
          <Camera size={16} />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onAvatarChange}
          />
        </label>
      )}
    </div>
  );
};

export default Avatar; 