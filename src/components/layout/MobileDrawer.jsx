import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Home, Search, PlusCircle, Bell, User, Settings, ChevronRight, ChevronUp } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { getPublicUrl } from '../../lib/utils';
import { formatDate } from 'date-fns';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/', match: (p) => p === '/' },
  { id: 'search', label: 'Search', icon: Search, path: '/search', match: (p) => p.startsWith('/search') },
  { id: 'create', label: 'Create Comparison', icon: PlusCircle, path: '/new-comparison?load_draft=true', match: (p) => p.startsWith('/new-comparison') },
  { id: 'activity', label: 'Activity', icon: Bell, path: '/activity', match: (p) => p.startsWith('/activity') },
  { id: 'profile', label: 'Profile', icon: User, path: '/dashboard', match: (p) => p.startsWith('/dashboard') },
];

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'billing', label: 'Billing', icon: '💳' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'language', label: 'Language', icon: '🌐' },
  { id: 'help', label: 'Help', icon: '❓' },
];

const BETA_TABS = [
  { id: 'feedback', label: 'Beta Feedback', icon: '💬' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
];

const MobileDrawer = ({ isOpen, onClose, userData, onLogout, settingsExpanded, setSettingsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = userData?.profile;

  // Android hardware back button closes drawer
  useEffect(() => {
    if (!isOpen) return;

    let listenerHandle;
    CapacitorApp.addListener('backButton', () => {
      onClose();
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      listenerHandle?.remove();
    };
  }, [isOpen, onClose]);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!isOpen) return null;

  const navItemStyle = (active) => ({
    color: active ? 'rgb(var(--primary-fg))' : 'rgb(var(--text))',
    backgroundColor: active ? 'rgb(var(--primary))' : 'transparent',
  });

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[100] w-80 max-w-[85vw] flex flex-col overflow-y-auto scrollbar-hide"
        style={{
          backgroundColor: 'rgb(var(--surface))',
          borderLeft: '1px solid rgb(var(--border))',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <span className="font-semibold text-sm" style={{ color: 'rgb(var(--text))' }}>Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center min-w-[44px] min-h-[44px]"
            style={{ color: 'rgb(var(--text))' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Profile */}
        {profile && (
          <button
            type="button"
            onClick={() => go('/dashboard')}
            className="flex items-center gap-3 px-4 py-4 border-b w-full text-left hover:bg-surface-elevated transition-colors"
            style={{ borderColor: 'rgb(var(--border))' }}
          >
            <div
              className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              {profile.profile_image_url ? (
                <img
                  src={getPublicUrl(profile.profile_image_url)}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl font-bold" style={{ color: 'rgb(var(--primary-fg))' }}>
                    {(profile.display_name || profile.username || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'rgb(var(--text))' }}>
                @{profile.display_name || profile.username || 'You'}
              </p>
              {profile.created_at && (
                <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
                  Since {formatDate(profile.created_at, 'MMM yyyy')}
                </p>
              )}
            </div>
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, path, match }) => {
            const active = match(location.pathname);
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(path)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium w-full text-left transition-colors"
                style={navItemStyle(active)}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                {label}
              </button>
            );
          })}

          {/* Settings */}
          <div>
            <button
              type="button"
              onClick={() => setSettingsExpanded((v) => !v)}
              className="flex items-center justify-between gap-3 px-3 py-3 rounded-md text-sm font-medium w-full text-left transition-colors"
              style={{ color: 'rgb(var(--text))' }}
            >
              <span className="flex items-center gap-3">
                <Settings size={18} strokeWidth={1.75} />
                Account
              </span>
              {settingsExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
            </button>

            {settingsExpanded && (
              <div className="ml-7 flex flex-col gap-0.5">
                {SETTINGS_TABS.map(({ id, label, icon }) => {
                  const active = location.pathname === `/settings/${id}`;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => go(`/settings/${id}`)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm w-full text-left transition-colors"
                      style={navItemStyle(active)}
                    >
                      <span>{icon}</span>
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm w-full text-left transition-colors"
                  style={{ color: 'rgb(var(--text))' }}
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Beta */}
        <div className="px-3 py-3 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
          <p
            className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'rgb(var(--text-muted))' }}
          >
            Beta
          </p>
          {BETA_TABS.map(({ id, label, icon }) => {
            const active = location.pathname === `/beta/${id}`;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(`/beta/${id}`)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm w-full text-left transition-colors"
                style={navItemStyle(active)}
              >
                <span>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
