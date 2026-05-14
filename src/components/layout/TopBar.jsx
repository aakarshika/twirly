import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Menu, Plus } from 'lucide-react';
import SearchBar from './search-bar/SearchBar';
import { useAuth } from '../../contexts/AuthContext';

// Pages that are root tab destinations — no back button shown
const ROOT_TAB_PATHS = ['/', '/search', '/dashboard', '/activity'];

function getPageTitle(pathname) {
  if (pathname === '/') return 'Twirly';
  if (pathname.startsWith('/search')) return 'Search';
  if (pathname.startsWith('/dashboard')) return 'Profile';
  if (pathname.startsWith('/activity')) return 'Activity';
  if (pathname.startsWith('/new-comparison')) return 'New Comparison';
  if (pathname.startsWith('/edit-comparison')) return 'Edit Comparison';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/item')) return 'Product';
  if (pathname.startsWith('/user')) return 'Profile';
  return 'Twirly';
}

const TopBar = ({ onMenuClick, isDrawerOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fullscreen pages — hide top bar entirely
  if (location.pathname.startsWith('/compare')) return null;

  const isRootTab = ROOT_TAB_PATHS.includes(location.pathname);
  const title = getPageTitle(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Mobile / Tablet bar (<1024) */}
      <div
        className="lg:hidden flex items-center justify-between px-2"
        style={{
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: 'rgb(var(--surface) / 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgb(var(--border))',
        }}
      >
        {/* Left: back button or spacer */}
        {!isRootTab ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px]"
            style={{ color: 'rgb(var(--text))' }}
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-11" />
        )}

        {/* Center: page title */}
        <span
          className="text-base font-semibold tracking-tight truncate"
          style={{ color: 'rgb(var(--text))' }}
        >
          {title}
        </span>

        {/* Right: drawer trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex items-center justify-center min-w-[44px] min-h-[44px]"
          style={{ color: isDrawerOpen ? 'rgb(var(--primary))' : 'rgb(var(--text))' }}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop bar (≥1024) */}
      <div
        className="hidden lg:flex items-center justify-between px-6"
        style={{
          height: '64px',
          backgroundColor: 'rgb(var(--surface))',
          borderBottom: '1px solid rgb(var(--border))',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <img src="/public_logo_transparent.png" alt="Twirly" className="w-8 h-8" />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: 'rgb(var(--text))' }}
          >
            Twirly
          </span>
        </Link>

        {/* Search */}
        {user && (
          <div className="flex-1 max-w-xl mx-8">
            <SearchBar searchComplete={() => {}} />
          </div>
        )}

        {/* Create CTA */}
        {user ? (
          <button
            type="button"
            onClick={() => navigate('/new-comparison?load_draft=true')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: 'rgb(var(--primary))',
              color: 'rgb(var(--primary-fg))',
            }}
          >
            <Plus size={16} />
            Create
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/landing"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'rgb(var(--text))' }}
            >
              Login
            </Link>
            <Link
              to="/landing"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'rgb(var(--primary))',
                color: 'rgb(var(--primary-fg))',
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
