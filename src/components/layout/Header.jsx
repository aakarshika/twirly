// File: src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2 } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useHeader } from '../../contexts/HeaderContext';
import Button from '../common/Button';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Header component with app title, navigation, and main actions
 */
const Header = () => {
  const { 
    customMode,
    setCustomMode,
    resetToDefault
  } = useComparison();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isHeaderVisible, setIsHeaderVisible } = useHeader();
  const { currentTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) { // scrolling down
        setIsHeaderVisible(false);
      } else { // scrolling up
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY, setIsHeaderVisible]);

  const navItems = [
    { name: 'Trending', icon: <Home size={20} />, path: '/' },
    { name: 'Dashboard', icon: <User size={20} />, path: '/dashboard' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const pageName = 'TWIRLY';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.border,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/public/teleport.png" alt="Twirly Logo" className="w-8 h-8 mr-2" />
              {/* <Sparkles className="text-amber-400" size={24} /> */}
              <h1 className="ml-2 text-lg font-bold" style={{ color: currentTheme.colors.text }}>{pageName}</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-1"
                style={{ color: currentTheme.colors.text }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="w-8 h-8 rounded-full overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                  </button>
                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                      style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                      }}
                    >
                      <div className="px-4 py-2 border-b" style={{ borderColor: currentTheme.colors.border }}>
                        <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                          Hello, {user.email?.split('@')[0] || 'User'}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        style={{ color: currentTheme.colors.text }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.buttonText
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                onClick={() => setIsMenuOpen(false)}
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 text-base font-medium rounded-md"
                style={{
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                }}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;