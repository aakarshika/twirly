// File: src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2, ArrowLeft } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useHeader } from '../../contexts/HeaderContext';
import Button from '../common/Button';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../search/SearchBar';
import './Header.css';
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
      
      // Add a threshold to prevent header from hiding on small scrolls
      const scrollThreshold = 10;
      
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Use passive event listener for better performance
    window.addEventListener('scroll', controlHeader, { passive: true });

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY, setIsHeaderVisible]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (e) => {
    if (isMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-button')) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

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
      className={`fixed top-0 left-0 right-0 z-40 w-full border-b transition-transform duration-300 header-safe-area ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.border,
      }}
    >
        <div className="container mx-auto px-4 header-content">
          <div className="flex items-center justify-between h-full">
          {/* Logo and Title */}
          <div className="flex flex-row items-center">
            <Link to="/" className="flex items-center">
            <div className="flex flex-col items-center">
              <img src="/public_logo.png" alt="Twirly Logo" className="w-10 h-10 mr-2" />
            </div>
            <h1 className="ml-2 text-lg font-bold" style={{ color: currentTheme.colors.text }}>{pageName}</h1>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar setMenuOpen={() => setIsMenuOpen(false)} />
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
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
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
              onClick={handleMenuClick}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 z-10"
              style={{ color: currentTheme.colors.text }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div 
          className="md:hidden z-50 mobile-menu"        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-4" 
          // style={{ backgroundColor: currentTheme.colors.background }}
          >
            {/* Mobile Search Bar */}
            <div className="px-3 py-2">
              <SearchBar setMenuOpen={() => setIsMenuOpen(false)} />
            </div>
            {navItems.map((item) => (
              <Link
                onClick={() => setIsMenuOpen(false)}
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-3 text-base font-medium rounded-md"
                style={{
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                }}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 rounded-lg"
                  style={{ color: currentTheme.colors.text }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.buttonText
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;