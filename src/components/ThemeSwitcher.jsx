import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = themeName => {
    changeTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-10 hover:bg-current"
        style={{ color: currentTheme.colors.primary }}
      >
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTheme.colors.primary }} />
        <span>{currentTheme.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50"
          style={{
            backgroundColor: currentTheme.colors.card,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-current"
              style={{ color: theme.colors.primary }}
            >
              <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: theme.colors.primary }} />
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
