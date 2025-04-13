import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3B82F6', // blue-500
      secondary: '#10B981', // emerald-500
      background: '#FFFFFF', // white
      text: '#1F2937', // dark gray
      card: '#F3F4F6', // light gray
      border: '#D1D5DB', // darker gray
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60A5FA', // blue-400
      secondary: '#34D399', // emerald-400
      background: '#1F2937', // dark gray
      text: '#F3F4F6', // light gray
      card: '#2D3748', // darker gray
      border: '#4B5563', // darker gray
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#F59E0B', // amber-500
      secondary: '#EC4899', // pink-500
      background: '#FEF3C7', // light yellow
      text: '#78350F', // dark brown
      card: '#FDE68A', // light yellow
      border: '#FCD34D', // yellow
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06B6D4', // cyan-500
      secondary: '#6366F1', // indigo-500
      background: '#ECFDFF', // light cyan
      text: '#164E63', // dark teal
      card: '#CFFAFE', // lighter cyan
      border: '#A5F3FC', // light cyan
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#4CAF50', // green
      secondary: '#FF9800', // orange
      background: '#E8F5E9', // light green
      text: '#1B5E20', // dark green
      card: '#C8E6C9', // lighter green
      border: '#A5D6A7', // green
    },
  },
  neon: {
    name: 'Neon',
    colors: {
      primary: '#FF4081', // pink
      secondary: '#00E5FF', // cyan
      background: '#000000', // black
      text: '#FFFFFF', // white
      card: '#1C1C1C', // dark gray
      border: '#FF4081', // pink
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : themes.light;
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(currentTheme));
    document.documentElement.style.setProperty('--color-primary', currentTheme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.colors.secondary);
    document.documentElement.style.setProperty('--color-background', currentTheme.colors.background);
    document.documentElement.style.setProperty('--color-text', currentTheme.colors.text);
    document.documentElement.style.setProperty('--color-card', currentTheme.colors.card);
    document.documentElement.style.setProperty('--color-border', currentTheme.colors.border);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    setCurrentTheme(themes[themeName]);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 