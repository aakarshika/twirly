import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'twirly.theme';

const palettes = {
  light: {
    name: 'Light',
    statusBar: 'dark',
    tokens: {
      bg: '255 255 255',
      surface: '247 248 250',
      'surface-elevated': '255 255 255',
      text: '15 23 42',
      'text-muted': '71 85 105',
      'text-inverse': '255 255 255',
      border: '226 232 240',
      'border-strong': '203 213 225',
      primary: '37 99 235',
      'primary-fg': '255 255 255',
      success: '22 163 74',
      warning: '202 138 4',
      danger: '220 38 38',
      overlay: '15 23 42',
    },
    overlayAlpha: 0.5,
  },
  dark: {
    name: 'Dark',
    statusBar: 'light',
    tokens: {
      bg: '11 15 23',
      surface: '17 22 31',
      'surface-elevated': '26 32 48',
      text: '248 250 252',
      'text-muted': '148 163 184',
      'text-inverse': '11 15 23',
      border: '31 41 55',
      'border-strong': '51 65 85',
      primary: '96 165 250',
      'primary-fg': '11 15 23',
      success: '74 222 128',
      warning: '250 204 21',
      danger: '248 113 113',
      overlay: '0 0 0',
    },
    overlayAlpha: 0.6,
  },
  ocean: {
    name: 'Ocean',
    statusBar: 'dark',
    tokens: {
      bg: '240 249 255',
      surface: '224 242 254',
      'surface-elevated': '255 255 255',
      text: '12 74 110',
      'text-muted': '3 105 161',
      'text-inverse': '255 255 255',
      border: '186 230 253',
      'border-strong': '125 211 252',
      primary: '6 182 212',
      'primary-fg': '255 255 255',
      success: '5 150 105',
      warning: '202 138 4',
      danger: '225 29 72',
      overlay: '12 74 110',
    },
    overlayAlpha: 0.5,
  },
};

const themeIds = Object.keys(palettes);

const rgbToHex = (rgbString) => {
  const [r, g, b] = rgbString.split(' ').map((n) => parseInt(n, 10));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
};

const buildLegacyColors = (palette) => {
  const t = palette.tokens;
  const overlayRgb = t.overlay;
  return {
    primary: rgbToHex(t.primary),
    secondary: rgbToHex(t['border-strong']),
    background: rgbToHex(t.bg),
    text: rgbToHex(t.text),
    'text-secondary': rgbToHex(t['text-muted']),
    card: rgbToHex(t.surface),
    'surface-elevated': rgbToHex(t['surface-elevated']),
    border: rgbToHex(t.border),
    'border-strong': rgbToHex(t['border-strong']),
    accent: rgbToHex(t.primary),
    muted: rgbToHex(t.surface),
    hover: rgbToHex(t['surface-elevated']),
    focus: rgbToHex(t['border-strong']),
    disabled: rgbToHex(t['text-muted']),
    shadow: `rgba(${overlayRgb.split(' ').join(', ')}, ${palette.overlayAlpha})`,
  };
};

const applyTokens = (palette) => {
  const root = document.documentElement;
  Object.entries(palette.tokens).forEach(([name, value]) => {
    root.style.setProperty(`--${name}`, value);
  });

  const legacy = buildLegacyColors(palette);
  root.style.setProperty('--color-primary', legacy.primary);
  root.style.setProperty('--color-secondary', legacy.secondary);
  root.style.setProperty('--color-background', legacy.background);
  root.style.setProperty('--color-text', legacy.text);
  root.style.setProperty('--color-text-secondary', legacy['text-secondary']);
  root.style.setProperty('--color-card', legacy.card);
  root.style.setProperty('--color-border', legacy.border);

  root.style.setProperty('color-scheme', palette.statusBar === 'light' ? 'dark' : 'light');
};

const detectSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const loadStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  if (palettes[raw]) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string' && palettes[parsed]) return parsed;
    if (parsed?.name && palettes[parsed.name.toLowerCase()]) return parsed.name.toLowerCase();
  } catch {
    // legacy junk — ignore
  }
  return null;
};

const buildPublicTheme = (id) => {
  const palette = palettes[id];
  return {
    id,
    name: palette.name,
    statusBar: palette.statusBar,
    tokens: palette.tokens,
    colors: buildLegacyColors(palette),
  };
};

export const themes = themeIds.reduce((acc, id) => {
  acc[id] = buildPublicTheme(id);
  return acc;
}, {});

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => loadStoredTheme() || detectSystemTheme());
  const [userOverride, setUserOverride] = useState(() => Boolean(loadStoredTheme()));

  useEffect(() => {
    applyTokens(palettes[themeId]);
  }, [themeId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    if (userOverride) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setThemeId(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [userOverride]);

  const changeTheme = (next) => {
    const nextId = typeof next === 'string' ? next : next?.id || next?.name?.toLowerCase();
    if (!nextId || !palettes[nextId]) return;
    setThemeId(nextId);
    setUserOverride(true);
    localStorage.setItem(STORAGE_KEY, nextId);
  };

  const resetToSystem = () => {
    setUserOverride(false);
    localStorage.removeItem(STORAGE_KEY);
    setThemeId(detectSystemTheme());
  };

  const value = useMemo(
    () => ({
      currentTheme: buildPublicTheme(themeId),
      themeId,
      changeTheme,
      resetToSystem,
      themes,
      isSystemTheme: !userOverride,
    }),
    [themeId, userOverride]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
