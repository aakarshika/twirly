import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import LottieAnimation from './common/LottieAnimation';
import notFoundAnimation from '../assets/animations/pagenotfound_lottie.json';

const EASE = [0.16, 1, 0.3, 1];

const NavButton = ({ onClick, style, children }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: '"Fraunces", serif',
      fontSize: 15,
      borderRadius: 4,
      padding: '12px 22px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 44,
      minWidth: 120,
      ...style,
    }}
  >
    {children}
  </button>
);

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  return (
    <div
      style={{
        background: t.bg,
        color: t.ink,
        minHeight: '100vh',
        fontFamily: '"Fraunces", serif',
      }}
      className="relative overflow-x-hidden flex items-center justify-center px-5"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-5">

        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(96px, 22vw, 152px)',
            lineHeight: 0.88,
            color: t.red,
            letterSpacing: '-0.02em',
          }}
        >
          404
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          className="w-36 h-36"
        >
          <LottieAnimation animationData={notFoundAnimation} loop autoplay />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: 22,
            color: t.ink,
            opacity: 0.72,
          }}
        >
          this page wandered off.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: t.ink,
            opacity: 0.62,
            maxWidth: 300,
            margin: 0,
          }}
        >
          We looked everywhere. Truly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2"
        >
          <NavButton
            onClick={() => navigate(-1)}
            style={{
              color: t.ink,
              border: `2px solid ${t.ink}`,
              background: 'transparent',
            }}
          >
            <ArrowLeft size={15} />
            go back
          </NavButton>

          <NavButton
            onClick={() => navigate('/')}
            style={{
              color: t.bg,
              background: t.ink,
              border: `2px solid ${t.ink}`,
            }}
          >
            <Home size={15} />
            go home
          </NavButton>

          <NavButton
            onClick={() => navigate('/search')}
            style={{
              color: t.blue,
              border: `2px solid ${t.blue}`,
              background: 'transparent',
            }}
          >
            <Search size={15} />
            search
          </NavButton>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFoundPage;
