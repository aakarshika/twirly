import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useHeader } from '@contexts/HeaderContext';
import { getUserProfile } from '@services/users';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';
import SideNav from './SideNav';
import MobileDrawer from './MobileDrawer';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsHeaderVisible } = useHeader();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setSettingsExpanded(location.pathname.startsWith('/settings'));
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.id)
      .then(setUserData)
      .catch(err => console.error('Header: failed to load profile', err));
  }, [user?.id]);

  // Detect scroll direction; show bar when scrolling up or near the top.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (Math.abs(currentScrollY - lastScrollY) > 10 && !isDrawerOpen) {
          setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 10);
          lastScrollY = currentScrollY;
        }
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setIsHeaderVisible, isDrawerOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <TopBar
        onMenuClick={() => setIsDrawerOpen(v => !v)}
        isDrawerOpen={isDrawerOpen}
        userData={userData}
      />
      <BottomTabs />
      {user && (
        <SideNav
          userData={userData}
          onLogout={handleLogout}
        />
      )}
      {user && (
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          userData={userData}
          onLogout={handleLogout}
          settingsExpanded={settingsExpanded}
          setSettingsExpanded={setSettingsExpanded}
        />
      )}
    </>
  );
};

export default Header;
