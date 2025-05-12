import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Palette, Sun, Moon, Monitor,  Layout, Save, Pencil } from 'lucide-react';
import Button from '../../../components/common/Button';

const AppearanceSettings = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    fontSize: 'medium',
    layout: 'default',
    animations: true,
    reduceMotion: false,
    highContrast: false
  });

  const handleThemeChange = (theme) => {
    setAppearanceSettings(prev => ({
      ...prev,
      theme
    }));
    changeTheme(theme);
  };

  const handleFontSizeChange = (size) => {
    setAppearanceSettings(prev => ({
      ...prev,
      fontSize: size
    }));
    // TODO: Implement font size change
  };

  const handleLayoutChange = (layout) => {
    setAppearanceSettings(prev => ({
      ...prev,
      layout
    }));
    // TODO: Implement layout change
  };

  const handleToggle = (setting) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving appearance settings:', appearanceSettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Appearance Settings
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
        {/* Theme Selection */}
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
            <Palette size={20} />
            <span>Theme</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  appearanceSettings.theme === key ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{ 
                  backgroundColor: appearanceSettings.theme === key ? currentTheme.colors.primary : 'transparent',
                  color: appearanceSettings.theme === key ? currentTheme.colors.background : currentTheme.colors.text
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
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
            <Pencil size={20} />
            <span>Font Size</span>
          </h3>
          <div className="flex items-center space-x-4">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  appearanceSettings.fontSize === size ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{ 
                  backgroundColor: appearanceSettings.fontSize === size ? currentTheme.colors.primary : 'transparent',
                  color: appearanceSettings.fontSize === size ? currentTheme.colors.background : currentTheme.colors.text
                }}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Layout */}
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
            <Layout size={20} />
            <span>Layout</span>
          </h3>
          <div className="flex items-center space-x-4">
            {['default', 'compact', 'spacious'].map((layout) => (
              <button
                key={layout}
                onClick={() => handleLayoutChange(layout)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  appearanceSettings.layout === layout ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{ 
                  backgroundColor: appearanceSettings.layout === layout ? currentTheme.colors.primary : 'transparent',
                  color: appearanceSettings.layout === layout ? currentTheme.colors.background : currentTheme.colors.text
                }}
              >
                {layout.charAt(0).toUpperCase() + layout.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Accessibility
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>Animations</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={appearanceSettings.animations}
                  onChange={() => handleToggle('animations')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: appearanceSettings.animations 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: appearanceSettings.animations 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>Reduce Motion</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={appearanceSettings.reduceMotion}
                  onChange={() => handleToggle('reduceMotion')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: appearanceSettings.reduceMotion 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: appearanceSettings.reduceMotion 
                        ? 'translateX(5px)' 
                        : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span style={{ color: currentTheme.colors.text }}>High Contrast</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={appearanceSettings.highContrast}
                  onChange={() => handleToggle('highContrast')}
                />
                <div 
                  className="w-11 h-6 rounded-full peer"
                  style={{ 
                    backgroundColor: appearanceSettings.highContrast 
                      ? currentTheme.colors.primary 
                      : currentTheme.colors.border
                  }}
                >
                  <div 
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      transform: appearanceSettings.highContrast 
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

export default AppearanceSettings; 