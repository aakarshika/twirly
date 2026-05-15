import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const TABS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    match: p => p === '/',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    path: '/search',
    match: p => p.startsWith('/search'),
  },
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    path: '/new-comparison?load_draft=true',
    match: p => p.startsWith('/new-comparison') || p.startsWith('/edit-comparison'),
    prominent: true,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Bell,
    path: '/activity',
    match: p => p.startsWith('/activity'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/dashboard',
    match: p => p.startsWith('/dashboard'),
  },
];

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 lg:hidden z-50"
      style={{
        background: t.bg,
        borderTop: `1px solid ${t.ink}26`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        fontFamily: '"Fraunces", serif',
      }}
    >
      <div className="flex h-14 items-stretch justify-around max-w-screen-xl mx-auto">
        {TABS.map(({ id, label, icon: Icon, path, match, prominent }) => {
          const active = match(location.pathname);

          return (
            <motion.button
              key={id}
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] py-1.5 cursor-pointer"
              style={{ color: active ? t.red : t.ink, opacity: active ? 1 : 0.45 }}
            >
              {active && !prominent && (
                <motion.span
                  layoutId="bottom-tab-indicator"
                  className="absolute top-0 rounded-full"
                  style={{
                    left: '25%',
                    right: '25%',
                    height: 2,
                    backgroundColor: t.red,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {prominent ? (
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: active ? t.ink : `${t.ink}18`,
                    color: active ? t.bg : t.ink,
                  }}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                </span>
              ) : (
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              )}

              <span className="text-[10px] font-medium leading-none tracking-wide">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabs;
