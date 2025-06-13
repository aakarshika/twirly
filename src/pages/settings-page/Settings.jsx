import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft, Menu, X, Home } from 'lucide-react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSettings from './tabs/ProfileSettings';
import AppearanceSettings from './tabs/AppearanceSettings';
import BillingSettings from './tabs/BillingSettings';
import SecuritySettings from './tabs/SecuritySettings';
import LanguageSettings from './tabs/LanguageSettings';
import HelpSettings from './tabs/HelpSettings';
import { useHeader } from '../../contexts/HeaderContext';

const Settings = () => {
  const { currentTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isHeaderVisible } = useHeader();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'language', label: 'Language', icon: '🌐' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];

  const renderTabLabel = (tab) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{tab.icon}</span>
        <span>{tab.label}</span>
      </div>
    );
  };

  // Get current tab from URL path
  const currentTab = location.pathname.split('/').pop() || 'profile';

  return (
    <div className="max-w-screen-lg mx-auto flex flex-col pt-10" style={{ 
      position: 'relative'
    }}>
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="appearance" element={<AppearanceSettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="language" element={<LanguageSettings />} />
              <Route path="help" element={<HelpSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings; 