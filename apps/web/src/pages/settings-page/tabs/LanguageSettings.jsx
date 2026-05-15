import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const STORAGE_KEY = 'twirly.locale';

const LANGUAGES = [
  { code: 'en', name: 'English',    available: true  },
  { code: 'es', name: 'Español',    available: false },
  { code: 'fr', name: 'Français',   available: false },
  { code: 'de', name: 'Deutsch',    available: false },
  { code: 'ja', name: '日本語',     available: false },
  { code: 'zh', name: '中文',       available: false },
];

const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern (ET)'   },
  { value: 'America/Chicago',     label: 'Central (CT)'   },
  { value: 'America/Denver',      label: 'Mountain (MT)'  },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)'   },
  { value: 'Europe/London',       label: 'London (GMT)'   },
  { value: 'Europe/Paris',        label: 'Paris (CET)'    },
  { value: 'Asia/Tokyo',          label: 'Tokyo (JST)'    },
  { value: 'Asia/Kolkata',        label: 'India (IST)'    },
  { value: 'Australia/Sydney',    label: 'Sydney (AEDT)'  },
];

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const browserTimezone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'America/New_York'; }
};

const DEFAULTS = {
  language: 'en',
  timezone: browserTimezone(),
};

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
    {children}
  </div>
);

const LanguageSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const [prefs, setPrefs] = useState(() => ({ ...DEFAULTS, ...loadPrefs() }));

  const save = next => {
    setPrefs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const selectLanguage = code => {
    if (!LANGUAGES.find(l => l.code === code)?.available) return;
    save({ ...prefs, language: code });
  };

  const selectTimezone = e => save({ ...prefs, timezone: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      <Section title="language." eyebrow="display" t={t}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(({ code, name, available }) => {
            const active = prefs.language === code;
            return (
              <motion.button
                key={code}
                type="button"
                onClick={() => selectLanguage(code)}
                disabled={!available}
                whileTap={available ? { scale: 0.96 } : {}}
                className="flex flex-col items-start px-4 py-3 rounded-sm text-left"
                style={{
                  fontFamily: '"Fraunces", serif',
                  background: active ? t.bg : 'transparent',
                  border: `1px solid ${active ? t.blue : `${t.ink}14`}`,
                  opacity: available ? 1 : 0.38,
                  cursor: available ? 'pointer' : 'not-allowed',
                  transition: 'border-color 0.15s, background 0.15s',
                  minHeight: 44,
                }}
              >
                <span style={{ fontSize: 14, color: active ? t.ink : `${t.ink}70`, lineHeight: 1.2 }}>
                  {name}
                </span>
                {!available && (
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 11, color: `${t.ink}40`, marginTop: 1 }}>
                    soon
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title="timezone." eyebrow="time display" t={t}>
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}60`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Your timezone
          </label>
          <select
            value={prefs.timezone}
            onChange={selectTimezone}
            className="w-full bg-transparent outline-none appearance-none"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 15,
              color: t.ink,
              borderBottom: `1px solid ${t.ink}35`,
              paddingBottom: 6,
              paddingTop: 2,
              cursor: 'pointer',
            }}
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value} style={{ background: t.bg, color: t.ink }}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}42` }}>
          saved locally — used for date display throughout the app
        </p>
      </Section>
    </motion.div>
  );
};

export default LanguageSettings;
