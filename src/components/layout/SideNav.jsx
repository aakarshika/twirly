import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User, Settings, ChevronRight, ChevronUp } from 'lucide-react';
import Avatar from '../common/Avatar';
import { getPublicUrl } from '../../lib/utils';
import { formatDate } from 'date-fns';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/', match: p => p === '/' },
  { id: 'search', label: 'Search', icon: Search, path: '/search', match: p => p.startsWith('/search') },
  { id: 'create', label: 'Create Comparison', icon: PlusCircle, path: '/new-comparison?load_draft=true', match: p => p.startsWith('/new-comparison') },
  { id: 'activity', label: 'Activity', icon: Bell, path: '/activity', match: p => p.startsWith('/activity') },
  { id: 'profile', label: 'Profile', icon: User, path: '/dashboard', match: p => p.startsWith('/dashboard') },
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

const SideNav = ({ userData, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsExpanded, setSettingsExpanded] = useState(
    location.pathname.startsWith('/settings'),
  );

  const profile = userData?.profile;

  const navItemStyle = active => ({
    color: active ? 'rgb(var(--primary-fg))' : 'rgb(var(--text))',
    backgroundColor: active ? 'rgb(var(--primary))' : 'transparent',
  });

  return (
    <aside
      aria-label="Site navigation"
      className="fixed left-0 top-0 bottom-0 hidden lg:flex flex-col z-40 w-64 overflow-y-auto scrollbar-hide"
      style={{
        paddingTop: '64px',
        borderRight: '1px solid rgb(var(--border))',
        backgroundColor: 'rgb(var(--surface))',
      }}
    >
      {/* Profile card */}
      {profile && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Go to your profile"
          className="px-4 py-5 border-b cursor-pointer"
          style={{ borderColor: 'rgb(var(--border))' }}
          onClick={() => navigate('/dashboard')}
          onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? navigate('/dashboard') : undefined}
        >
          <div className="flex items-center gap-3">
            <Avatar
              profileImageUrl={getPublicUrl(profile.profile_image_url)}
              displayName={profile.display_name}
              username={profile.username}
              size="sm"
              onAvatarChange={() => {}}
            />
            <div className="min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: 'rgb(var(--text))' }}
              >
                @{profile.display_name || profile.username || 'You'}
              </p>
              {profile.created_at && (
                <p
                  className="text-xs truncate"
                  style={{ color: 'rgb(var(--text-muted))' }}
                >
                  Since {formatDate(profile.created_at, 'MMM yyyy')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav aria-label="Main" className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path, match }) => {
          const active = match(location.pathname);
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full text-left transition-colors hover:bg-surface-elevated"
              style={navItemStyle(active)}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </button>
          );
        })}

        {/* Settings expandable */}
        <div>
          <button
            type="button"
            aria-expanded={settingsExpanded}
            aria-controls="sidenav-settings-submenu"
            onClick={() => setSettingsExpanded(v => !v)}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full text-left transition-colors hover:bg-surface-elevated"
            style={{ color: 'rgb(var(--text))' }}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} strokeWidth={1.75} />
              Account
            </span>
            {settingsExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
          </button>

          {settingsExpanded && (
            <div id="sidenav-settings-submenu" className="ml-7 mt-0.5 flex flex-col gap-0.5">
              {SETTINGS_TABS.map(({ id, label, icon }) => {
                const active = location.pathname === `/settings/${id}`;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(`/settings/${id}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-left transition-colors hover:bg-surface-elevated"
                    style={navItemStyle(active)}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-left transition-colors hover:bg-surface-elevated"
                style={{ color: 'rgb(var(--text))' }}
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Beta section */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: 'rgb(var(--border))' }}
      >
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
              onClick={() => navigate(`/beta/${id}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-left transition-colors hover:bg-surface-elevated"
              style={navItemStyle(active)}
            >
              <span>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SideNav;
