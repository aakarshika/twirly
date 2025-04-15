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
      accent: '#FBBF24', // amber-400
      muted: '#E5E7EB', // gray-300
      hover: '#E0F2FE', // light blue for hover
      focus: '#BFDBFE', // blue for focus
      disabled: '#D1D5DB', // gray for disabled
      shadow: 'rgba(0, 0, 0, 0.1)', // light shadow
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
      accent: '#FBBF24', // amber-400
      muted: '#4B5563', // gray-600
      hover: '#4B5563', // dark gray for hover
      focus: '#A1A1A1', // gray for focus
      disabled: '#6B7280', // gray for disabled
      shadow: 'rgba(255, 255, 255, 0.1)', // light shadow
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
      accent: '#FFB74D', // orange-400
      muted: '#FFF3E0', // light orange
      hover: '#FFEDD5', // light orange for hover
      focus: '#FCA5A1', // pink for focus
      disabled: '#FBBF24', // amber for disabled
      shadow: 'rgba(0, 0, 0, 0.2)', // shadow
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
      accent: '#3B82F6', // blue-500
      muted: '#E0F7FA', // light cyan
      hover: '#B2F5EA', // light cyan for hover
      focus: '#81E6D9', // cyan for focus
      disabled: '#B2F5EA', // light cyan for disabled
      shadow: 'rgba(0, 0, 0, 0.1)', // light shadow
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
      accent: '#FFB74D', // orange-400
      muted: '#C8E6C9', // light green
      hover: '#A5D6A7', // light green for hover
      focus: '#81C784', // green for focus
      disabled: '#A5D6A7', // light green for disabled
      shadow: 'rgba(0, 0, 0, 0.1)', // light shadow
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
      accent: '#FFEB3B', // yellow
      muted: '#424242', // dark gray
      hover: '#FF80AB', // pink for hover
      focus: '#00B0FF', // cyan for focus
      disabled: '#FF4081', // pink for disabled
      shadow: 'rgba(255, 255, 255, 0.2)', // light shadow
    },
  },
  pastel: {
    name: 'Pastel',
    colors: {
      primary: '#FFB3BA', // light pink
      secondary: '#FFDFBA', // light orange
      background: '#FFFFBA', // light yellow
      text: '#B9FBC0', // light green
      card: '#BAE1FF', // light blue
      border: '#FFC3A0', // light coral
      accent: '#FF677D', // coral
      muted: '#D3D3D3', // light gray
      hover: '#FFEBEE', // light pink for hover
      focus: '#FFCCBC', // light orange for focus
      disabled: '#FFB3BA', // light pink for disabled
      shadow: 'rgba(0, 0, 0, 0.1)', // light shadow
    },
  },
  retro: {
    name: 'Retro',
    colors: {
      primary: '#FF6F61', // coral
      secondary: '#6B5B95', // purple
      background: '#88B04B', // green
      text: '#F7CAC9', // pink
      card: '#92A8D1', // blue
      border: '#955251', // brown
      accent: '#B9FBC0', // light green
      muted: '#E0E0E0', // light gray
      hover: '#FFABAB', // light coral for hover
      focus: '#D7B2D8', // light purple for focus
      disabled: '#FF6F61', // coral for disabled
      shadow: 'rgba(0, 0, 0, 0.2)', // shadow
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