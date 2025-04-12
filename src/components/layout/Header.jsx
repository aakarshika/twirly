// File: src/components/layout/Header.jsx

import React, { useState } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2 } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

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
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Add theme switching logic here
  };

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'Trending', icon: <BarChart2 size={20} />, path: '/trending' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Company', icon: <Building2 size={20} />, path: '/company' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <header className="sticky top-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Sparkles className="text-amber-400" size={24} />
              <h1 className="ml-2 text-2xl font-bold text-white">TWIRLY</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-300 hover:text-white flex items-center space-x-1"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!customMode && (
              <>
                <Button
                  variant="primary"
                  onClick={() => setCustomMode(true)}
                  leftIcon={<PlusCircle size={16} />}
                  className="hidden md:flex"
                >
                  Create Custom
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetToDefault}
                  leftIcon={<RefreshCw size={16} />}
                  className="hidden md:flex"
                >
                  Reset
                </Button>
              </>
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
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            {!customMode && (
              <div className="px-3 py-2 space-y-2">
                <Button
                  variant="primary"
                  onClick={() => setCustomMode(true)}
                  leftIcon={<PlusCircle size={16} />}
                  className="w-full"
                >
                  Create Custom
                </Button>
                <Button
                  variant="outline"
                  onClick={resetToDefault}
                  leftIcon={<RefreshCw size={16} />}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;