import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const STORAGE_KEY = 'twirly.privacy';

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const DEFAULTS = {
  profileVisibility: 'public',
  showActivity:      true,
  allowMentions:     true,
};

const Toggle = ({ checked, onChange, label, description, t }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <div className="flex-1 min-w-0">
      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.3 }}>
        {label}
      </p>
      {description && (
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}50`, marginTop: 1 }}>
          {description}
        </p>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative shrink-0 flex items-center"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? t.blue : `${t.ink}22`,
        transition: 'background 0.2s',
        minWidth: 44,
        minHeight: 44,
      }}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
          display: 'block',
          flexShrink: 0,
        }}
      />
    </button>
  </div>
);

const Section = ({ title, eyebrow, children, t }) => (
  <div
    className="rounded-sm p-5 sm:p-6 flex flex-col gap-4"
    style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
  >
    <div>
      {eyebrow && (
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
        {title}
      </h2>
    </div>
    <div
      className="flex flex-col gap-3"
      style={{ borderTop: `1px solid ${t.ink}0e`, paddingTop: 12 }}
    >
      {children}
    </div>
  </div>
);

const PrivacySettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const [prefs, setPrefs] = useState(() => ({ ...DEFAULTS, ...loadPrefs() }));

  const save = next => {
    setPrefs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const toggle = key => save({ ...prefs, [key]: !prefs[key] });
  const setVisibility = v => save({ ...prefs, profileVisibility: v });

  const isPublic = prefs.profileVisibility === 'public';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      {/* Profile visibility */}
      <Section title="who sees you." eyebrow="visibility" t={t}>
        <div className="flex gap-3">
          {[
            { value: 'public',  Icon: Globe, label: 'Public'  },
            { value: 'private', Icon: Lock,  label: 'Private' },
          ].map(({ value, Icon, label }) => {
            const active = prefs.profileVisibility === value;
            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-sm"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 14,
                  color: active ? t.ink : `${t.ink}60`,
                  background: active ? t.bg : 'transparent',
                  border: `1px solid ${active ? t.blue : `${t.ink}18`}`,
                  minHeight: 44,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 1.75} />
                {label}
              </motion.button>
            );
          })}
        </div>
        {!isPublic && (
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}50` }}>
            only you can see your profile and comparisons
          </p>
        )}
      </Section>

      {/* Activity */}
      <Section title="activity." eyebrow="what others see" t={t}>
        <Toggle
          checked={prefs.showActivity}
          onChange={() => toggle('showActivity')}
          label="Show activity status"
          description="let others see when you&apos;re active"
          t={t}
        />
        <Toggle
          checked={prefs.allowMentions}
          onChange={() => toggle('allowMentions')}
          label="Allow mentions"
          description="let others @mention you in comments"
          t={t}
        />
      </Section>

      {/* Honest footer */}
      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}42`, lineHeight: 1.5, paddingLeft: 2 }}>
        privacy preferences are saved locally for now — they&apos;ll sync to your account in a future release.
      </p>
    </motion.div>
  );
};

export default PrivacySettings;
