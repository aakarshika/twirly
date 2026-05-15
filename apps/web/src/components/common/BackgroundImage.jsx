import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Sparkles, Moon, Sun, Circle } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

// [Icon, left%, top%, rotateDeg, delayS]
const ICONS = [
  [Star,     5,  8,  15, 0.0],
  [Heart,   18, 22,  -8, 0.3],
  [Sparkles,32,  5,  20, 0.6],
  [Circle,  50, 12, -15, 0.2],
  [Moon,    68,  6,  10, 0.5],
  [Sun,     82, 18,  -5, 0.1],
  [Star,    92,  9,  12, 0.4],
  [Heart,    8, 55, -12, 0.7],
  [Sparkles,25, 72,  18, 0.2],
  [Circle,  44, 60,  -8, 0.8],
  [Moon,    60, 78,  14, 0.3],
  [Sun,     78, 65,  -3, 0.6],
  [Star,    90, 55,  16, 0.1],
  [Heart,   15, 88,  -6, 0.5],
  [Sparkles,55, 90,  22, 0.9],
  [Circle,  38, 38,  -4, 0.4],
  [Moon,    72, 42,   8, 0.7],
];

const BackgroundImage = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${t.bg} 0%, ${t.bgDeep} 100%)` }}
      />
      {ICONS.map(([Icon, left, top, rotate, delay], i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${left}%`, top: `${top}%`, transform: `rotate(${rotate}deg)`, color: t.ink }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={28} />
        </motion.div>
      ))}
    </div>
  );
};

export default BackgroundImage;
