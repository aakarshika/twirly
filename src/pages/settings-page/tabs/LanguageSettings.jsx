import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Globe } from 'lucide-react';

const LanguageSettings = () => {
  const { currentTheme } = useTheme();
  const [languageSettings, setLanguageSettings] = useState({
    language: 'en',
    region: 'US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
  ];

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ];

  const handleSettingChange = (setting, value) => {
    setLanguageSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const _handleSave = () => {
    // TODO: Implement save functionality with Supabase
    // console.log('Saving language settings:', languageSettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-md font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Language & Region
        </h2>
        {/* <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </Button> */}
        <span className="text-sm text-gray-500 pl-2">Coming soon...</span>

      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Globe size={20} />
            <span>Language</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSettingChange('language', lang.code)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  languageSettings.language === lang.code ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{
                  backgroundColor: languageSettings.language === lang.code ? currentTheme.colors.primary : 'transparent',
                  color: languageSettings.language === lang.code ? currentTheme.colors.background : currentTheme.colors.text,
                }}
              >
                <span className="text-xl font-semibold">{lang.name}</span>
                <div><span className="text-sm">{lang.code.toUpperCase()}</span></div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Selection */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Region
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {regions.map(region => (
              <button
                key={region.code}
                onClick={() => handleSettingChange('region', region.code)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  languageSettings.region === region.code ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{
                  backgroundColor: languageSettings.region === region.code ? currentTheme.colors.primary : 'transparent',
                  color: languageSettings.region === region.code ? currentTheme.colors.background : currentTheme.colors.text,
                }}
              >
                <span className="text-xl font-semibold">{region.name}</span>
                <div><span className="text-sm">{region.code}</span></div>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time Format */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Date & Time Format
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Date Format
              </label>
              <select
                value={languageSettings.dateFormat}
                onChange={e => handleSettingChange('dateFormat', e.target.value)}
                className="w-full p-2 rounded"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Time Format
              </label>
              <select
                value={languageSettings.timeFormat}
                onChange={e => handleSettingChange('timeFormat', e.target.value)}
                className="w-full p-2 rounded"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <option value="12h">12-hour (1:30 PM)</option>
                <option value="24h">24-hour (13:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Timezone
          </h3>
          <select
            value={languageSettings.timezone}
            onChange={e => handleSettingChange('timezone', e.target.value)}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.border}`,
            }}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Currency
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => handleSettingChange('currency', currency.code)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  languageSettings.currency === currency.code ? 'bg-opacity-20' : 'hover:bg-opacity-5'
                }`}
                style={{
                  backgroundColor: languageSettings.currency === currency.code ? currentTheme.colors.primary : 'transparent',
                  color: languageSettings.currency === currency.code ? currentTheme.colors.background : currentTheme.colors.text,
                }}
              >
                <span className="text-xl font-semibold">{currency.symbol}</span>
                <span className="text-sm">{currency.name}</span>
                <span className="text-sm">{currency.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
