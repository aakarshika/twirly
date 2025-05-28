// File: src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, PlusCircle, Menu, X, Sun, Moon, Home, BarChart2, Settings, User, Building2, ArrowLeft, ChevronDown, ChevronUp, ChevronRight, Settings2, Plus, File, Search, ChevronLeft, PencilIcon, ThumbsUp } from 'lucide-react';
import { useHeader } from '../../contexts/HeaderContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from './search-bar/SearchBar';
import './Header.css';
import { formatDate, getPublicUrl } from '../../lib/utils';
import { getUserProfile } from '../../services/users';
/**
 * Header component with app title, navigation, and main actions
 */
const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  const { isHeaderVisible, setIsHeaderVisible } = useHeader();

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

  const isComparePage = location.pathname.includes('/compare/');
  const isNewComparisonPage = location.pathname.includes('/new-comparison');
  const showTinyHeader = isComparePage || isNewComparisonPage;

  const pageName = 'TWIRLY';

  // Add scroll to top effect for compare page
  useEffect(() => {
    if (isComparePage) {
      window.scrollTo(0, 0);
    }
  }, [isComparePage]);

  const handleLogout = async () => {
    console.log('Logging out');
    try {
      await signOut();
      // Use window.location for more reliable navigation across platforms
      window.location.href = '/landing';
      setIsDrawerOpen(false);
      console.log('Logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Add scroll event listener for header visibility
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;
          
          // Only update if we've scrolled more than 10 pixels and not during tab navigation
          // AND the drawer is not open
          if (Math.abs(scrollDelta) > 10 && !document.querySelector('.tab-scrolling') && !isDrawerOpen) {
            // Show header when scrolling up or at the top of the page
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
              setIsHeaderVisible(true);
            } 
            // Hide header when scrolling down and not at the top
            else if (currentScrollY > lastScrollY && currentScrollY > 10) {
              setIsHeaderVisible(false);
            }
            
            lastScrollY = currentScrollY;
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsHeaderVisible, isDrawerOpen]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-transform duration-300" 
               style={{ borderColor: 'var(--color-primary)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <header
      className={`fixed container mx-auto top-0 left-0 right-0 z-50 w-full transition-all duration-200 ease-in-out ${!isHeaderVisible ? 'hidden' : ''}`}
      style={{
        backgroundColor: 'var(--color-background)',
        paddingTop: 'calc(var(--safe-area-inset-top))',
        color: 'var(--color-text)',
        height: showTinyHeader ? '40px' : 'auto'
      }}
    >
      {showTinyHeader ? (
        <>
          {/* Mobile compact header */}
          <div className="md:hidden px-2 header-content max-w-7xl mx-auto h-full flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center transition-transform duration-200 hover:scale-105"
            >
              <div className="flex flex-col items-center">
                <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
              </div>
            </button>
          </div>
          {/* Desktop full header */}
          <div className="hidden md:block px-4 md:px-6 lg:px-8 header-content max-w-7xl mx-auto">
            <div className="flex items-center justify-between h-full">
              {/* Logo and Title */}
              <div className="flex flex-row items-center">
                <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center transition-transform duration-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center">
                    <ChevronLeft size={24} style={{ color: 'var(--color-text)' }} />
                  </div>
                </button>
                <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
                  <div className="flex flex-col items-center">
                    <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2 transition-transform duration-200" />
                  </div>
                  {!isSearchExpanded && (
                    <h1 className="ml-2 text-lg font-bold transition-colors duration-200" style={{ color: 'var(--color-text)' }}>{pageName}</h1>
                  )}
                </Link>
              </div>

              {/* Search Bar - Hidden on mobile */}
              {user && (
                <div className="hidden md:block flex-1 max-w-xl mx-8 mr-4">
                  <div className="flex items-center space-x-4">
                    <SearchBar searchComplete={() => setIsDrawerOpen(false)} />
                    <button 
                      onClick={() => navigate('/new-comparison/')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <Plus size={20} />
                      <span>Create</span>
                    </button>
                  </div>
                </div>
              )}

              {user && (
                <div>
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center space-x-8">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center space-x-1 transition-all duration-200 hover:scale-105"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex flex-row items-center space-x-4 transition-colors duration-200"
                         style={{ color: 'var(--color-text)' }}>
                      {location.pathname !== '/search' && (
                        <div>
                          <div className="flex flex-row items-center md:hidden transition-all duration-300 ease-in-out">
                            {isSearchExpanded && (
                              <SearchBar 
                                searchComplete={() => {
                                  setIsDrawerOpen(false);
                                  setIsSearchExpanded(false);
                                }} 
                              />
                            )}
                            {!isSearchExpanded ? (
                              <>
                                <Search size={24} onClick={() => setIsSearchExpanded(true)} />
                                <button 
                                  onClick={() => navigate('/new-comparison/')}
                                  className="ml-2 p-1 rounded-md hover:bg-opacity-10"
                                >
                                  <Plus size={24} />
                                </button>
                              </>
                            ) : (
                              <X size={24} onClick={() => setIsSearchExpanded(false)} />
                            )}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleDrawerClick}
                        className="p-2 rounded-md drawer-button transition-transform duration-200 hover:scale-105"
                        style={{ color: 'var(--color-text)' }}
                        aria-label="Open settings"
                      >
                        <Menu size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text)'
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Drawer */}
          {isDrawerOpen && (
            <div
              className="fixed z-[60] settings-drawer transition-all duration-200 ease-in-out"
              style={{ 
                backgroundColor: 'var(--color-background)',
                right: '0',
                paddingTop: 'calc(var(--safe-area-inset-top) + 40px)',
                height: '100vh',
                width: '100%',
                maxWidth: '320px'
              }}
            >
              <div
                className="h-full w-full transform transition-transform duration-300 ease-in-out"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  borderLeft: '1px solid var(--color-border)'
                }}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex flex-row justify-center">
                      <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2" />
                      <h2 className="text-xl mt-2 font-semibold" style={{ color: 'var(--color-text)' }}>Welcome to Twirly</h2>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-2 rounded-md hover:bg-opacity-10"
                      style={{ color: 'var(--color-text)' }}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                      <div className="flex flex-col">
                        <div className="flex justify-center">
                          <h4 className="text-sm items-center" style={{ color: 'var(--color-text-secondary)', borderBottom: `1px solid var(--color-border)` }}>Your opinion matters here!</h4>
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
                                  style={{ backgroundColor: 'var(--color-primary)' }}
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
                                style={{ color: 'var(--color-text)' }}
                              >
                                @{userData?.profile?.display_name || 'Some Person'}
                              </h3>
                              <div
                                className="text-sm mb-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Member since {userData?.profile?.created_at ? formatDate(userData.profile.created_at) : 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                      <div className="flex flex-col">
                        {/* Main Navigation */}
                        <div className="mb-6">
                          {mainNavItems.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => {
                                navigate(item.path);
                                setIsDrawerOpen(false);
                              }}
                              className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                              style={{
                                color: location.pathname === item.path ? 'white' : 'var(--color-text)',
                                backgroundColor: location.pathname === item.path ? 'var(--color-primary)' : 'transparent'
                              }}
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </button>
                          ))}

                          <button
                            onClick={() => {
                              navigate('/new-comparison?load_draft=true');
                              setIsDrawerOpen(false);
                            }}
                            className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                            style={{
                              color: 'var(--color-text)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <PencilIcon size={24} />
                            <span className="text-sm bg-amber-500 rounded-md px-2 py-1">Your Comparison</span>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/dashboard/votes');
                              setIsDrawerOpen(false);
                            }}
                            className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                            style={{
                              color: 'var(--color-text)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <ThumbsUp size={24} />
                            <span>Your Votes</span>
                          </button>

                          <div className="flex flex-row">
                            <button
                              key={'Account-Expand'}
                              onClick={() => {
                                setIsDrawerOpen(true);
                                setSettingsSectionExpanded(!settingsSectionExpanded);
                              }}
                              className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                              style={{
                                color: 'var(--color-text)',
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
                                    color: location.pathname === `/settings/${tab.id}` ? 'white' : 'var(--color-text)',
                                    backgroundColor: location.pathname === `/settings/${tab.id}` ? 'var(--color-primary)' : 'transparent'
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
                                  color: 'var(--color-text)',
                                  backgroundColor: 'transparent'
                                }}
                              >
                                <span className="text-lg">🚪</span>
                                <span>Logout</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="px-4 md:px-6 lg:px-8 header-content max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Title */}
            <div className="flex flex-row items-center">
              {location.pathname !== '/' && (
                <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center transition-transform duration-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center">
                    <ChevronLeft size={24} style={{ color: 'var(--color-text)' }} />
                  </div>
                </button>
              )}
              <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
                <div className="flex flex-col items-center">
                  <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2 transition-transform duration-200" />
                </div>
                {!isSearchExpanded && (
                  <h1 className="ml-2 text-lg font-bold transition-colors duration-200" style={{ color: 'var(--color-text)' }}>{pageName}</h1>
                )}
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile */}
            {user && (
              <div className="hidden md:block flex-1 max-w-xl mx-8 mr-4">
                <div className="flex items-center space-x-4">
                  <SearchBar searchComplete={() => setIsDrawerOpen(false)} />
                  <button 
                    onClick={() => navigate('/new-comparison/')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <Plus size={20} />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            )}

            {user && (
              <div>
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center space-x-1 transition-all duration-200 hover:scale-105"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex flex-row items-center space-x-4 transition-colors duration-200"
                       style={{ color: 'var(--color-text)' }}>
                    {location.pathname !== '/search' && (
                      <div>
                        <div className="flex flex-row items-center md:hidden transition-all duration-300 ease-in-out">
                          {isSearchExpanded && (
                            <SearchBar 
                              searchComplete={() => {
                                setIsDrawerOpen(false);
                                setIsSearchExpanded(false);
                              }} 
                            />
                          )}
                          {!isSearchExpanded ? (
                            <>
                              <Search size={24} onClick={() => setIsSearchExpanded(true)} />
                              <button 
                                onClick={() => navigate('/new-comparison/')}
                                className="ml-2 p-1 rounded-md hover:bg-opacity-10"
                              >
                                <Plus size={24} />
                              </button>
                            </>
                          ) : (
                            <X size={24} onClick={() => setIsSearchExpanded(false)} />
                          )}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleDrawerClick}
                      className="p-2 rounded-md drawer-button transition-transform duration-200 hover:scale-105"
                      style={{ color: 'var(--color-text)' }}
                      aria-label="Open settings"
                    >
                      <Menu size={24} />
                    </button>
                  </div>

                  {/* Settings Drawer */}
                  {isDrawerOpen && (
                    <div
                      className="fixed z-[60] settings-drawer transition-all duration-200 ease-in-out"
                      style={{ 
                        backgroundColor: 'var(--color-background)',
                        top: '0',
                        right: '0',
                        paddingTop: 'calc(var(--safe-area-inset-top))',
                        height: '100vh',
                        width: '100%',
                        maxWidth: '320px'
                      }}
                    >
                      <div
                        className="h-full w-full transform transition-transform duration-300 ease-in-out"
                        style={{ 
                          backgroundColor: 'var(--color-background)',
                          borderLeft: '1px solid var(--color-border)'
                        }}
                      >
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex flex-row justify-center">
                              <img src="/public_logo_transparent.png" alt="Twirly Logo" className="w-10 h-10 mr-2" />
                              <h2 className="text-xl mt-2 font-semibold" style={{ color: 'var(--color-text)' }}>Welcome to Twirly</h2>
                            </div>
                            <button
                              onClick={() => setIsDrawerOpen(false)}
                              className="p-2 rounded-md hover:bg-opacity-10"
                              style={{ color: 'var(--color-text)' }}
                            >
                              <X size={24} />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto">
                            <div className="p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                              <div className="flex flex-col">
                                <div className="flex justify-center">
                                  <h4 className="text-sm items-center" style={{ color: 'var(--color-text-secondary)', borderBottom: `1px solid var(--color-border)` }}>Your opinion matters here!</h4>
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
                                          style={{ backgroundColor: 'var(--color-primary)' }}
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
                                        style={{ color: 'var(--color-text)' }}
                                      >
                                        @{userData?.profile?.display_name || 'Some Person'}
                                      </h3>
                                      <div
                                        className="text-sm mb-1"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                      >
                                        Member since {userData?.profile?.created_at ? formatDate(userData.profile.created_at) : 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                              <div className="flex flex-col">
                                {/* Main Navigation */}
                                <div className="mb-6">
                                  {mainNavItems.map((item) => (
                                    <button
                                      key={item.name}
                                      onClick={() => {
                                        navigate(item.path);
                                        setIsDrawerOpen(false);
                                      }}
                                      className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                                      style={{
                                        color: location.pathname === item.path ? 'white' : 'var(--color-text)',
                                        backgroundColor: location.pathname === item.path ? 'var(--color-primary)' : 'transparent'
                                      }}
                                    >
                                      {item.icon}
                                      <span>{item.name}</span>
                                    </button>
                                  ))}

                                  <button
                                    onClick={() => {
                                      navigate('/new-comparison?load_draft=true');
                                      setIsDrawerOpen(false);
                                    }}
                                    className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                                    style={{
                                      color: 'var(--color-text)',
                                      backgroundColor: 'transparent'
                                    }}
                                  >
                                    <PencilIcon size={24} />
                                    <span className="text-sm bg-amber-500 rounded-md px-2 py-1">Your Comparison</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      navigate('/dashboard/votes');
                                      setIsDrawerOpen(false);
                                    }}
                                    className="w-full border-b px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                                    style={{
                                      color: 'var(--color-text)',
                                      backgroundColor: 'transparent'
                                    }}
                                  >
                                    <ThumbsUp size={24} />
                                    <span>Your Votes</span>
                                  </button>

                                  <div className="flex flex-row">
                                    <button
                                      key={'Account-Expand'}
                                      onClick={() => {
                                        setIsDrawerOpen(true);
                                        setSettingsSectionExpanded(!settingsSectionExpanded);
                                      }}
                                      className="w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors hover:bg-opacity-5 rounded-lg mb-2"
                                      style={{
                                        color: 'var(--color-text)',
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
                                            color: location.pathname === `/settings/${tab.id}` ? 'white' : 'var(--color-text)',
                                            backgroundColor: location.pathname === `/settings/${tab.id}` ? 'var(--color-primary)' : 'transparent'
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
                                          color: 'var(--color-text)',
                                          backgroundColor: 'transparent'
                                        }}
                                      >
                                        <span className="text-lg">🚪</span>
                                        <span>Logout</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
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
                    className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-text)'
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;