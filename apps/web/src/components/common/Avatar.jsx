import React from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@utils/utils';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-32 h-32',
};

const initialFontSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const Avatar = ({
  profileImageUrl,
  displayName,
  username,
  size = 'md',
  isEditable = false,
  onAvatarChange,
  className = '',
  onClick,
}) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const initial = (displayName?.[0] || username?.[0] || '?').toLowerCase();

  return (
    <div className="relative inline-block">
      <div
        onClick={onClick}
        className={cn(
          'rounded-full bg-cover bg-center overflow-hidden',
          sizeClasses[size] ?? sizeClasses.md,
          onClick && 'cursor-pointer',
          className,
        )}
        style={{ backgroundColor: t.bgDeep }}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn('w-full h-full flex items-center justify-center rounded-full', initialFontSize[size] ?? 'text-base')}
            style={{ backgroundColor: t.ink, color: t.bg, fontFamily: '"Fraunces", serif' }}
          >
            {initial}
          </div>
        )}
      </div>

      {isEditable && (
        <label
          className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer"
          style={{ backgroundColor: t.ink, color: t.bg }}
        >
          <Camera size={14} />
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
