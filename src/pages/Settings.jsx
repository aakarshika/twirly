import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeft, Menu, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import BillingSettings from '../components/settings/BillingSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import LanguageSettings from '../components/settings/LanguageSettings';
import HelpSettings from '../components/settings/HelpSettings';

const Settings = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'language':
        return <LanguageSettings />;
      case 'help':
        return <HelpSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const renderTabLabel = (tab) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{tab.icon}</span>
        <span>{tab.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg md:hidden"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          border: `1px solid ${currentTheme.colors.border}`
        }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ 
            backgroundColor: currentTheme.colors.background,
            borderRight: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="h-full flex flex-col">
            {/* User Profile and Navigation Section */}
            <div 
              className="p-4 border-b"
              style={{ borderColor: currentTheme.colors.border }}
            >
              <div 
                className="flex items-start space-x-4 mb-6 cursor-pointer mt-4"
                onClick={() => navigate('/dashboard')}
              >
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0 border-2"
                  style={{ 
                    backgroundColor: currentTheme.colors.border,
                    backgroundImage: user?.photoURL ? `url(${user.photoURL})` : 'none',
                    borderColor: currentTheme.colors.primary
                  }}
                >
                  {!user?.photoURL && (
                    <div 
                      className="w-full h-full flex items-center justify-center rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      <span className="text-white text-2xl">
                        {user?.displayName?.[0] || user?.email?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 
                    className="font-semibold text-lg mb-1"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {user?.displayName || 'User'}
                  </h3>
                  <div 
                    className="text-sm mb-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    @{user?.username || 'username'}
                  </div>
                  <div 
                    className="text-sm mb-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    {user?.fullName || 'Full Name'}
                  </div>
                  <div 
                    className="text-sm break-all"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    {user?.email || 'email@example.com'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`,
                  color: currentTheme.colors.text
                }}
              >
                <Home size={18} />
                <span>Home</span>
              </button>
            </div>

            <div className="p-4">
              <h1 
                className="text-2xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Settings
              </h1>
            </div>
            <nav className="flex-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isMobile) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                    activeTab === tab.id ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    color: currentTheme.colors.text,
                    backgroundColor: activeTab === tab.id ? currentTheme.colors.primary : 'transparent'
                  }}
                >
                  {renderTabLabel(tab)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-8">
            {/* Mobile Header */}
            {isMobile && (
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg mr-4"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  {/* <ChevronLeft size={24} /> */}
                </button>
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: currentTheme.colors.text }}
                >
                  {settingsTabs.find(tab => tab.id === activeTab)?.label}
                </h2>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings; 