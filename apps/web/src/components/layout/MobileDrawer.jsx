import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronRight, CreditCard, Globe, HelpCircle,
  Home, Lock, LogOut, Palette, PlusCircle, Search,
  Settings, User, X,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { format } from 'date-fns';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Avatar from '@components/common/Avatar';
import { getPublicUrl } from '@utils/utils';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     icon: Home,       path: '/',                              match: p => p === '/' },
  { id: 'search',   label: 'Search',   icon: Search,     path: '/search',                        match: p => p.startsWith('/search') },
  { id: 'create',   label: 'Create',   icon: PlusCircle, path: '/new-comparison?load_draft=true', match: p => p.startsWith('/new-comparison') || p.startsWith('/edit-comparison') },
  { id: 'activity', label: 'Activity', icon: Bell,       path: '/activity',                      match: p => p.startsWith('/activity') },
  { id: 'profile',  label: 'Profile',  icon: User,       path: '/dashboard',                     match: p => p.startsWith('/dashboard') },
];

const SETTINGS_ITEMS = [
  { id: 'profile',    label: 'Profile',    icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing',    label: 'Billing',    icon: CreditCard },
  { id: 'security',   label: 'Security',   icon: Lock },
  { id: 'language',   label: 'Language',   icon: Globe },
  { id: 'help',       label: 'Help',       icon: HelpCircle },
];

const BETA_ITEMS = [
  { id: 'feedback',    label: 'Beta Feedback', path: '/beta/feedback' },
  { id: 'analytics',   label: 'Analytics',     path: '/beta/analytics' },
  { id: 'performance', label: 'Performance',   path: '/beta/performance' },
];

const SPRING = { type: 'spring', stiffness: 300, damping: 30 };

const MobileDrawer = ({ isOpen, onClose, userData, onLogout, settingsExpanded, setSettingsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const profile = userData?.profile;

  // Android hardware back button closes the drawer first
  useEffect(() => {
    if (!isOpen || !Capacitor.isNativePlatform()) return undefined;
    let handle;
    CapacitorApp.addListener('backButton', onClose).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, [isOpen, onClose]);

  // Escape key closes the drawer
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  const go = path => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90]"
            style={{ background: `${t.ink}66` }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 400) onClose();
            }}
            className="fixed right-0 top-0 bottom-0 z-[100] w-80 max-w-[85vw] flex flex-col overflow-y-auto"
            style={{
              background: t.bg,
              borderLeft: `1px solid ${t.ink}18`,
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Close row */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${t.ink}12` }}
            >
              <span
                style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.red, letterSpacing: '-0.02em' }}
              >
                twirly
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="flex items-center justify-center"
                style={{ minWidth: 44, minHeight: 44, color: t.ink, opacity: 0.6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile */}
            {profile && (
              <button
                type="button"
                onClick={() => go('/dashboard')}
                className="flex items-center gap-3 px-5 py-4 w-full text-left"
                style={{ borderBottom: `1px solid ${t.ink}0f` }}
              >
                <Avatar
                  profileImageUrl={getPublicUrl(profile.profile_image_url)}
                  displayName={profile.display_name}
                  username={profile.username}
                  size="sm"
                />
                <div className="min-w-0">
                  <p
                    className="truncate"
                    style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 15, color: t.ink }}
                  >
                    {profile.display_name || profile.username || 'You'}
                  </p>
                  {profile.created_at && (
                    <p
                      className="truncate"
                      style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.ink, opacity: 0.45 }}
                    >
                      since {format(new Date(profile.created_at), 'MMM yyyy')}
                    </p>
                  )}
                </div>
              </button>
            )}

            {/* Main nav */}
            <nav aria-label="Main" className="flex-1 px-3 py-3 flex flex-col gap-0.5">
              {NAV_ITEMS.map(({ id, label, icon: Icon, path, match }) => {
                const active = match(location.pathname);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => go(path)}
                    className="relative flex items-center gap-3 px-4 py-3 rounded-sm w-full text-left"
                    style={{
                      fontFamily: '"Fraunces", serif',
                      fontSize: 15,
                      color: active ? t.ink : `${t.ink}80`,
                      background: active ? t.bgDeep : 'transparent',
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-2 bottom-2 rounded-r-full"
                        style={{ width: 3, backgroundColor: t.red }}
                      />
                    )}
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                    {label}
                  </button>
                );
              })}

              {/* Settings — expandable */}
              <div>
                <button
                  type="button"
                  aria-expanded={settingsExpanded}
                  onClick={() => setSettingsExpanded(v => !v)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-sm w-full text-left"
                  style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: `${t.ink}80` }}
                >
                  <span className="flex items-center gap-3">
                    <Settings size={18} strokeWidth={1.75} />
                    Account
                  </span>
                  <motion.span
                    animate={{ rotate: settingsExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                  >
                    <ChevronRight size={13} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {settingsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden ml-6 mt-0.5 flex flex-col gap-0.5"
                    >
                      {SETTINGS_ITEMS.map(({ id, label, icon: Icon }) => {
                        const active = location.pathname === `/settings/${id}`;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => go(`/settings/${id}`)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm w-full text-left"
                            style={{
                              fontFamily: '"Fraunces", serif',
                              fontSize: 14,
                              color: active ? t.ink : `${t.ink}75`,
                              background: active ? t.bgDeep : 'transparent',
                            }}
                          >
                            <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
                            {label}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => { onLogout(); onClose(); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm w-full text-left"
                        style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.red, opacity: 0.8 }}
                      >
                        <LogOut size={15} strokeWidth={1.75} />
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Beta section */}
            <div
              className="px-3 py-4"
              style={{ borderTop: `1px solid ${t.ink}12` }}
            >
              <p
                className="px-4 mb-2"
                style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.ink, opacity: 0.38, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Beta
              </p>
              {BETA_ITEMS.map(({ id, label, path }) => {
                const active = location.pathname.startsWith(path);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(path)}
                    className="flex items-center px-4 py-2.5 rounded-sm w-full text-left"
                    style={{
                      fontFamily: '"Fraunces", serif',
                      fontSize: 14,
                      color: active ? t.ink : `${t.ink}60`,
                      background: active ? t.bgDeep : 'transparent',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
