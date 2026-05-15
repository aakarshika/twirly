import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Menu, Moon, Plus, Sun } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { useHeader } from '@contexts/HeaderContext';
import { themes as risoThemes } from '@styles/themes';
import SearchBar from './search-bar/SearchBar';

const ROOT_TAB_PATHS = new Set(['/', '/search', '/dashboard', '/activity']);

function getPageTitle(pathname) {
  if (pathname.startsWith('/new-comparison')) return 'New Comparison';
  if (pathname.startsWith('/edit-comparison')) return 'Edit Comparison';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/item')) return 'Product';
  if (pathname.startsWith('/user')) return 'Profile';
  return null;
}

const TopBar = ({ onMenuClick, isDrawerOpen, userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeId, changeTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const t = risoThemes[themeId] ?? risoThemes.light;

  if (location.pathname.startsWith('/compare')) return null;

  const isRootTab = ROOT_TAB_PATHS.has(location.pathname);
  const isHome = location.pathname === '/';
  const isDark = themeId === 'dark';
  const title = getPageTitle(location.pathname);

  const avatarUrl = userData?.profile?.profile_image_url;
  const avatarInitial = userData?.profile?.display_name?.[0]?.toUpperCase() ?? '?';

  const toggleTheme = () => changeTheme(isDark ? 'light' : 'dark');

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      animate={{ y: isHeaderVisible ? 0 : '-100%' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Mobile bar — hidden on large screens */}
      <div
        className="lg:hidden flex items-center justify-between"
        style={{
          height: 56,
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 'env(safe-area-inset-top)',
          background: t.bg,
          borderBottom: `1px solid ${t.ink}1a`,
        }}
      >
        {!isRootTab ? (
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center"
            style={{ minWidth: 44, minHeight: 44, color: t.ink }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        ) : (
          <div style={{ width: 44 }} />
        )}

        {isHome ? (
          <span
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 26,
              color: t.red,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            twirly
          </span>
        ) : (
          <span
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 17,
              color: t.ink,
            }}
          >
            {title ?? 'twirly'}
          </span>
        )}

        <button
          type="button"
          aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isDrawerOpen}
          aria-controls="mobile-drawer"
          onClick={onMenuClick}
          className="flex items-center justify-center"
          style={{ minWidth: 44, minHeight: 44, color: isDrawerOpen ? t.red : t.ink }}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop bar — hidden on small screens */}
      <div
        className="hidden lg:flex items-center justify-between px-8"
        style={{
          height: 64,
          background: t.bg,
          borderBottom: `1px solid ${t.ink}1a`,
        }}
      >
        <Link
          to="/"
          aria-label="Twirly home"
          className="flex items-center gap-2.5 shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <img src="/public_logo_transparent.png" alt="" aria-hidden className="w-8 h-8" />
          <span
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 28,
              color: t.red,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            twirly
          </span>
        </Link>

        {user && (
          <div className="flex-1 max-w-md mx-10">
            <SearchBar searchComplete={() => {}} />
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, color: t.ink, opacity: 0.55, cursor: 'pointer' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <button
                type="button"
                aria-label="My profile"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center overflow-hidden"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: `2px solid ${t.ink}26`,
                  background: avatarUrl ? 'transparent' : t.bgDeep,
                  color: t.ink,
                  fontFamily: '"DM Serif Display", serif',
                  fontStyle: 'italic',
                  fontSize: 13,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  avatarInitial
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/new-comparison?load_draft=true')}
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontStyle: 'italic',
                  fontSize: 15,
                  background: t.red,
                  color: t.bg,
                  padding: '7px 16px',
                  borderRadius: 2,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Create
              </button>
            </>
          ) : (
            <>
              <Link
                to="/landing"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 14,
                  color: t.ink,
                  opacity: 0.7,
                  textDecoration: 'none',
                }}
              >
                Log in
              </Link>
              <Link
                to="/landing"
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontStyle: 'italic',
                  fontSize: 15,
                  background: t.red,
                  color: t.bg,
                  padding: '7px 18px',
                  borderRadius: 2,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
