import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronRight, CreditCard, Globe, HelpCircle,
  Home, Lock, LogOut, Palette, PlusCircle, Search,
  Settings, User,
} from 'lucide-react';
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

const SideNav = ({ userData, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const [settingsExpanded, setSettingsExpanded] = useState(
    location.pathname.startsWith('/settings'),
  );

  const profile = userData?.profile;

  return (
    <aside
      aria-label="Site navigation"
      className="fixed left-0 top-0 bottom-0 hidden lg:flex flex-col z-40 w-64 overflow-y-auto"
      style={{
        paddingTop: 64,
        borderRight: `1px solid ${t.ink}18`,
        background: t.bg,
      }}
    >
      {/* Profile card */}
      {profile && (
        <button
          type="button"
          aria-label="Go to your profile"
          onClick={() => navigate('/dashboard')}
          className="w-full text-left px-5 py-4"
          style={{ borderBottom: `1px solid ${t.ink}12` }}
        >
          <div className="flex items-center gap-3">
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
          </div>
        </button>
      )}

      {/* Main nav */}
      <nav aria-label="Main" className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path, match }) => {
          const active = match(location.pathname);
          return (
            <motion.button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative flex items-center gap-3 px-4 py-2.5 rounded-sm w-full text-left"
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 14,
                color: active ? t.ink : `${t.ink}80`,
                background: active ? t.bgDeep : 'transparent',
              }}
            >
              {active && (
                <motion.span
                  layoutId="sidenav-active-bar"
                  className="absolute left-0 top-2 bottom-2 rounded-r-full"
                  style={{ width: 3, backgroundColor: t.red }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </motion.button>
          );
        })}

        {/* Settings — expandable */}
        <div>
          <button
            type="button"
            aria-expanded={settingsExpanded}
            aria-controls="sidenav-settings"
            onClick={() => setSettingsExpanded(v => !v)}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-sm w-full text-left"
            style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: `${t.ink}80` }}
          >
            <span className="flex items-center gap-3">
              <Settings size={17} strokeWidth={1.75} />
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
                id="sidenav-settings"
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
                      onClick={() => navigate(`/settings/${id}`)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-sm w-full text-left"
                      style={{
                        fontFamily: '"Fraunces", serif',
                        fontSize: 13,
                        color: active ? t.ink : `${t.ink}75`,
                        background: active ? t.bgDeep : 'transparent',
                      }}
                    >
                      <Icon size={14} strokeWidth={active ? 2.5 : 1.75} />
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm w-full text-left"
                  style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.red, opacity: 0.8 }}
                >
                  <LogOut size={14} strokeWidth={1.75} />
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
              onClick={() => navigate(path)}
              className="flex items-center px-4 py-2 rounded-sm w-full text-left"
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 13,
                color: active ? t.ink : `${t.ink}60`,
                background: active ? t.bgDeep : 'transparent',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SideNav;
