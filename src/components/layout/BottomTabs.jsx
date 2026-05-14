import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const TABS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    match: (p) => p === '/',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    path: '/search',
    match: (p) => p.startsWith('/search'),
  },
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    path: '/new-comparison?load_draft=true',
    match: (p) => p.startsWith('/new-comparison') || p.startsWith('/edit-comparison'),
    prominent: true,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Bell,
    path: '/activity',
    match: (p) => p.startsWith('/activity'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/dashboard',
    match: (p) => p.startsWith('/dashboard'),
  },
];

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-surface border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-14 items-stretch justify-around">
        {TABS.map(({ id, label, icon: Icon, path, match, prominent }) => {
          const active = match(location.pathname);
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] py-1.5 transition-colors',
                prominent && 'relative'
              )}
              style={{
                color: active
                  ? 'rgb(var(--primary))'
                  : 'rgb(var(--text-muted))',
              }}
            >
              {prominent ? (
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: active
                      ? 'rgb(var(--primary))'
                      : 'rgb(var(--surface-elevated))',
                    color: active ? 'rgb(var(--primary-fg))' : 'rgb(var(--text-muted))',
                  }}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                </span>
              ) : (
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              )}
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabs;
