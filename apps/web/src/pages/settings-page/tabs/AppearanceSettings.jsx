import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const ThemeCard = ({ themeKey, theme, active, t, onSelect }) => {
  const cardBg     = `rgb(${theme.tokens.bg})`;
  const cardInk    = `rgb(${theme.tokens.text})`;
  const cardSurface = `rgb(${theme.tokens.surface})`;
  const cardPrimary = `rgb(${theme.tokens.primary})`;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(themeKey)}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 p-1 focus:outline-none"
      style={{ minHeight: 44 }}
    >
      {/* Mini-page preview */}
      <div
        className="w-[88px] h-[72px] rounded-sm overflow-hidden"
        style={{
          background: cardBg,
          border: active ? `2px solid ${t.red}` : `1px solid ${cardInk}22`,
          boxShadow: active ? `0 0 0 3px ${t.red}28` : 'none',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
      >
        {/* Simulated header */}
        <div
          className="flex items-center gap-1 px-2"
          style={{ height: 13, background: cardSurface, borderBottom: `1px solid ${cardInk}14` }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cardPrimary, opacity: 0.7, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ flex: 1, height: 2, background: cardInk, opacity: 0.12, borderRadius: 1, display: 'inline-block' }} />
        </div>

        {/* Simulated content */}
        <div className="p-2 flex flex-col gap-1.5">
          <span style={{ display: 'block', height: 4, width: '72%', background: cardInk, opacity: 0.65, borderRadius: 1 }} />
          <span style={{ display: 'block', height: 3, width: '90%', background: cardInk, opacity: 0.22, borderRadius: 1 }} />
          <span style={{ display: 'block', height: 3, width: '62%', background: cardInk, opacity: 0.16, borderRadius: 1 }} />
          <span style={{ display: 'block', height: 3, width: '40%', background: cardPrimary, opacity: 0.75, borderRadius: 1, marginTop: 2 }} />
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5">
        {active && (
          <motion.span
            layoutId="theme-active-dot"
            style={{ width: 6, height: 6, borderRadius: '50%', background: t.red, flexShrink: 0, display: 'inline-block' }}
          />
        )}
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: active ? t.ink : `${t.ink}60` }}>
          {theme.name}
        </span>
      </div>
    </motion.button>
  );
};

const AppearanceSettings = () => {
  const { themeId, changeTheme, themes } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const handleSelect = key => {
    if (key === themeId) return;
    changeTheme(key);
    toast.success(`${themes[key].name} theme applied`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      <div
        className="rounded-sm p-5 sm:p-6 flex flex-col gap-5"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <div>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
            theme
          </p>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
            pick your paper.
          </h2>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}45`, marginTop: 4 }}>
            changes everywhere, instantly
          </p>
        </div>

        <div className="flex gap-6 flex-wrap">
          {Object.entries(themes).map(([key, theme]) => (
            <ThemeCard
              key={key}
              themeKey={key}
              theme={theme}
              active={themeId === key}
              t={t}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;
