import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, ChevronDown, CreditCard, Globe, HelpCircle,
  Lock, Mail, Palette, Shield, User, X,
} from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { PaperGrain } from '@components/riso';
import ProfileSettings from './tabs/ProfileSettings';
import AccountSettings from './tabs/AccountSettings';
import SecuritySettings from './tabs/SecuritySettings';
import AppearanceSettings from './tabs/AppearanceSettings';
import NotificationsSettings from './tabs/NotificationsSettings';
import PrivacySettings from './tabs/PrivacySettings';
import BillingSettings from './tabs/BillingSettings';
import LanguageSettings from './tabs/LanguageSettings';
import HelpSettings from './tabs/HelpSettings';

const SETTINGS_ITEMS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'account',       label: 'Account',       icon: Mail },
  { id: 'security',      label: 'Security',      icon: Lock },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy',       label: 'Privacy',       icon: Shield },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'language',      label: 'Language',      icon: Globe },
  { id: 'help',          label: 'Help',          icon: HelpCircle },
];

const SPRING = { type: 'spring', stiffness: 320, damping: 30 };

const activeIdFromPath = pathname => {
  const segments = pathname.split('/');
  const idx = segments.indexOf('settings');
  return idx !== -1 ? segments[idx + 1] : null;
};

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeId = activeIdFromPath(location.pathname);
  const activeItem = SETTINGS_ITEMS.find(({ id }) => id === activeId);

  const goTo = useCallback(
    id => {
      navigate(`/settings/${id}`);
      setDrawerOpen(false);
    },
    [navigate],
  );

  return (
    <div className="relative min-h-screen" style={{ background: t.bg, color: t.ink }}>
      <PaperGrain blend={t.blend} />

      {/* Page header */}
      <div
        className="relative z-10 px-5 sm:px-8 pt-6 pb-4"
        style={{ borderBottom: `1px solid ${t.ink}12` }}
      >
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: t.ink, opacity: 0.52 }}>
          account
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 6vw, 40px)',
            color: t.ink,
            lineHeight: 1.05,
          }}
        >
          settings.
        </h1>
      </div>

      {/* Two-column body */}
      <div className="relative z-10 flex max-w-screen-xl mx-auto">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col w-52 shrink-0"
          style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto' }}
        >
          <nav className="px-3 py-5 flex flex-col gap-0.5" aria-label="Settings sections">
            {SETTINGS_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = id === activeId;
              return (
                <motion.button
                  key={id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => goTo(id)}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-sm"
                  style={{
                    fontFamily: '"Fraunces", serif',
                    fontSize: 14,
                    color: active ? t.ink : `${t.ink}70`,
                    background: active ? t.bgDeep : 'transparent',
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="settings-active-bar"
                      className="absolute left-0 top-2 bottom-2 rounded-r-full"
                      style={{ width: 3, backgroundColor: t.red }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
                  {label}
                </motion.button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-5 sm:px-8 py-6">

          {/* Mobile section header */}
          <div
            className="flex items-center justify-between mb-5 lg:hidden"
            style={{ borderBottom: `1px solid ${t.ink}0f`, paddingBottom: 12 }}
          >
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink }}>
              {activeItem?.label ?? 'Settings'}
            </span>
            <button
              type="button"
              aria-label="Open settings sections"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1"
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: 15,
                color: t.red,
                minHeight: 44,
                minWidth: 44,
                justifyContent: 'flex-end',
              }}
            >
              sections
              <ChevronDown size={15} />
            </button>
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="notifications" element={<NotificationsSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="billing" element={<BillingSettings />} />
            <Route path="language" element={<LanguageSettings />} />
            <Route path="help" element={<HelpSettings />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="settings-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] lg:hidden"
              style={{ background: `${t.ink}55` }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="settings-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Settings sections"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={SPRING}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.25 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) setDrawerOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden rounded-t-2xl overflow-hidden"
              style={{
                background: t.bg,
                borderTop: `1px solid ${t.ink}18`,
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <span
                  className="rounded-full"
                  style={{ width: 36, height: 4, background: `${t.ink}25` }}
                />
              </div>

              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${t.ink}12` }}
              >
                <span
                  style={{ fontFamily: '"Caveat", cursive', fontSize: 20, color: t.ink, opacity: 0.65 }}
                >
                  settings
                </span>
                <button
                  type="button"
                  aria-label="Close settings sections"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center"
                  style={{ minWidth: 44, minHeight: 44, color: t.ink, opacity: 0.55 }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer grid */}
              <nav className="px-3 py-3 grid grid-cols-2 gap-1" aria-label="Settings sections">
                {SETTINGS_ITEMS.map(({ id, label, icon: Icon }) => {
                  const active = id === activeId;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => goTo(id)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-sm text-left"
                      style={{
                        fontFamily: '"Fraunces", serif',
                        fontSize: 14,
                        color: active ? t.ink : `${t.ink}70`,
                        background: active ? t.bgDeep : 'transparent',
                      }}
                    >
                      <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
                      {label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
