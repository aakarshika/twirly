// File: src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2, ArrowLeft, ChevronDown, ChevronUp, ChevronRight, Settings2, Plus, File, Search } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useHeader } from '../../contexts/HeaderContext';
import Button from '../common/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../search/SearchBar';
import './Header.css';
import { formatDate, getPublicUrl } from '../../lib/utils';
import { getUserProfile } from '../../services/users';
/**
 * Header component with app title, navigation, and main actions
 */
const Header = () => {
  const {
    customMode,
    setCustomMode,
    resetToDefault
  } = useComparison();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isHeaderVisible, setIsHeaderVisible } = useHeader();
  const { currentTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsSectionExpanded, setSettingsSectionExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [addSectionExpanded, setAddSectionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          userProfile
        ] = await Promise.all([
          getUserProfile(user.id),
        ]);
        console.log(userProfile);
        setUserData(userProfile);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data in header');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);


  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsSectionExpanded(true);
    } else {
      setSettingsSectionExpanded(false);
    }
    if (location.pathname.startsWith('/dashboard/products/add')) {
      setAddSectionExpanded(true);
    } else {
      setAddSectionExpanded(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Add a threshold to prevent header from hiding on small scrolls
      const scrollThreshold = 10;

      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        setIsHeaderVisible(false);
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

  const handleDrawerClick = (e) => {
    e.stopPropagation();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleClickOutside = (e) => {
    if (isDrawerOpen && !e.target.closest('.settings-drawer') && !e.target.closest('.drawer-button')) {
      setIsDrawerOpen(false);
    }
    if (isSearchExpanded && !e.target.closest('.search-bar')) {
      setIsSearchExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDrawerOpen]);

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'language', label: 'Language', icon: '🌐' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];

  const addTabs = [
    { id: 'product', label: 'Product', icon: <PlusCircle size={20} />, path: '/dashboard/products/add' },
    { id: 'comparison', label: 'Comparison', icon: <PlusCircle size={20} />, path: '/new-comparison/' },
  ];

  const mainNavItems = [
    { name: 'Trending Comparisons', icon: <Home size={20} />, path: '/' },
    { name: 'Dashboard', icon: <User size={20} />, path: '/dashboard' },
  ];


  const pageName = 'TWIRLY';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/landing');
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div>hello</div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <header
      className={`fixed container mx-auto top-0 left-0 right-0 z-40 w-full border-b transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      style={{
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.card,
      }}
    >
      <div className="px-4 header-content">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Title */}
          <div className="flex flex-row items-center">
            <Link to="/" className="flex items-center">
              <div className="flex flex-col items-center">
                <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2" />
              </div>
              {!isSearchExpanded && (<h1 className="ml-2 text-lg font-bold" style={{ color: currentTheme.colors.text }}>{pageName}</h1>) }
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          {user && (<div className="hidden md:block flex-1 max-w-xl mx-8 mr-4">
            <SearchBar searchComplete={() => setIsDrawerOpen(false)} />
          </div>)}


          {user && (
            <div >
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {mainNavItems.map((item) => (
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
          </div>)}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
              <div className="flex flex-row items-center space-x-4">

                {location.pathname !== '/search' && (
                  <div className="" >
                    {/* animate the search bar expanding and collapsing */}
                  <div className="flex flex-row items-center md:hidden" 
                  style={{ transition: 'all 0.3s ease-in-out' }}
                  >
                    {isSearchExpanded && (
                      <SearchBar 
                        searchComplete={() => {
                          setIsDrawerOpen(false);
                          setIsSearchExpanded(false);
                        }} />
                    )}
                    {!isSearchExpanded ? (
                      <Search size={24} onClick={() => setIsSearchExpanded(true)} />
                    ) : (
                      <X size={24} onClick={() => setIsSearchExpanded(false)} />
                    )}
                  </div>
                  </div>
                )}
                <button
                  onClick={handleDrawerClick}
                  className="p-2 rounded-md drawer-button"
                  style={{ color: currentTheme.colors.text }}
                  aria-label="Open settings"
                >
                  <Menu size={24} />
                </button>
              </div>

      {/* Settings Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed z-50 settings-drawer "
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <div
            className="fixed right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out "
            
          >
            <div className="" style={{ borderColor: currentTheme.colors.border, backgroundColor: currentTheme.colors.background, padding: '10px' }}>
              <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex flex-row justify-center">
                  <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2" />
                  <h2 className="text-xl mt-2 font-semibold" style={{ color: currentTheme.colors.text }}>Welcome to Twirly</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-md hover:bg-opacity-10"
                  style={{ color: currentTheme.colors.text }}
                >
                  <X size={24} />
                </button>
              </div>

              </div>
              </div>

            <div className="" style={{  border: `1px solid ${currentTheme.colors.border}` , backgroundColor: currentTheme.colors.background, padding: '10px' }}>
              <div className="flex flex-col">

              <div className="flex justify-center" >
              <h4 className="text-sm items-center" style={{ color: currentTheme.colors.textSecondary, borderBottom: `1px solid ${currentTheme.colors.border}` }}>Your opinion matters here!</h4>
              </div>
                <div className="flex flex-row">

                  <div
                    className="flex items-start space-x-4 mb-6 cursor-pointer mt-4"
                    onClick={() => {
                      navigate('/dashboard')
                      setIsDrawerOpen(false)
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0 border-2"
                      style={{
                        backgroundImage: userData?.profile?.profile_image_url ? `url(${getPublicUrl(userData.profile.profile_image_url)})` : 'none',
                      }}
                    >
                      {!userData?.profile?.profile_image_url && (
                        <div
                          className="w-full h-full flex items-center justify-center rounded-full"
                          style={{ backgroundColor: currentTheme.colors.primary }}
                        >
                          <span className="text-white text-2xl">
                            {userData?.profile?.display_name?.[0] || userData?.profile?.email?.[0] || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: currentTheme.colors.text }}
                      >
                        @{userData?.profile?.display_name || 'Some Person'}
                      </h3>
                      <div
                        className="text-sm mb-1"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Member since {userData?.profile?.created_at ? formatDate(userData.profile.created_at) : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Main Navigation */}
              <div className="mb-6" >
                {mainNavItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                    style={{
                      color: location.pathname === item.path ? 'white' : currentTheme.colors.text,
                      backgroundColor: location.pathname === item.path ? currentTheme.colors.primary : 'transparent'
                    }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}

              <div className="flex flex-row">
                  <button
                    key={'Add-Expand'}
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setAddSectionExpanded(!addSectionExpanded);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                    style={{
                      color: currentTheme.colors.text,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <File size={24} />
                    <span>Add New</span>
                  </button>
                  <div className="flex flex-row items-center">
                    {addSectionExpanded ? (<ChevronUp size={24} />) : (<ChevronRight size={24} />)}
                  </div>
                </div>
                {addSectionExpanded && (
                  <div className="ml-8">
                    {addTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          navigate(tab.path);
                          setIsDrawerOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                        style={{
                          color: location.pathname === tab.path ? 'white' : currentTheme.colors.text,
                          backgroundColor: location.pathname === tab.path ? currentTheme.colors.primary : 'transparent'
                        }}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-row">
                  <button
                    key={'Account-Expand'}
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setSettingsSectionExpanded(!settingsSectionExpanded);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                    style={{
                      color: currentTheme.colors.text,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Settings size={24} />
                    <span>Account</span>
                  </button>
                  <div className="flex flex-row items-center">
                    {settingsSectionExpanded ? (<ChevronUp size={24} />) : (<ChevronRight size={24} />)}
                  </div>
                </div>

              {/* Settings Tabs */}
              {settingsSectionExpanded && (
                <div className="ml-8">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigate(`/settings/${tab.id}`);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                    style={{
                      color: location.pathname === `/settings/${tab.id}` ? 'white' : currentTheme.colors.text,
                      backgroundColor: location.pathname === `/settings/${tab.id}` ? currentTheme.colors.primary : 'transparent'
                    }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mt-4"
                  style={{
                    color: currentTheme.colors.text,
                    backgroundColor: 'transparent'
                  }}
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>)}

              </div>
              </div>
          </div>
        </div>
      )}
              </>
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
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;