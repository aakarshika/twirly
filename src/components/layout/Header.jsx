// File: src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2 } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useHeader } from '../../contexts/HeaderContext';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import { useTheme } from '../../contexts/ThemeContext';

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