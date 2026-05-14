// src/pages/landing/LandingPage.jsx
//
// Twirly marketing landing — riso zine aesthetic.
// Mobile-first. Theme switching via src/styles/themes.js.
//
// All colour references go through the `t` (theme) object.
// SVG primitives are stateless and accept colour as props.
// To change the look: edit themes.js — zero component changes needed.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';

// ── Sample comparison shown in the hero ───────────────────────────────────
// tintKey maps to a colour token in the theme — so tiles recolour automatically.
const SAMPLE_SET = {
  title:      'which show actually stands the test of time',
  category:   'tv · trending now',
  totalVotes: 14302,
  items: [
    { name: 'The Office',   pct: 38, tintKey: 'red',    no: 1 },
    { name: 'Breaking Bad', pct: 29, tintKey: 'blue',   no: 2 },
    { name: 'Succession',   pct: 21, tintKey: 'purple', no: 3 },
    { name: 'The Wire',     pct: 12, tintKey: 'mustard',no: 4 },
  ],
};

// ── SVG primitives ────────────────────────────────────────────────────────
// Each accepts explicit colour props — no globals, fully portable.

const Halftone = ({ color, opacity = 0.85, rotate = 0, blend = 'multiply', className = '' }) => (
  <svg
    aria-hidden
    className={`absolute inset-0 w-full h-full ${className}`}
    style={{ transform: `rotate(${rotate}deg)`, opacity, mixBlendMode: blend }}
  >
    <pattern id={`ht-${color.slice(1)}-${rotate}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.3" fill={color} />
    </pattern>
    <rect width="100%" height="100%" fill={`url(#ht-${color.slice(1)}-${rotate})`} />
  </svg>
);

const HandUnderline = ({ color, className = '' }) => (
  <svg viewBox="0 0 200 12" className={className} preserveAspectRatio="none" aria-hidden>
    <path d="M3 7 C 30 2, 60 11, 90 5 S 150 9, 197 4" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const HandArrow = ({ color }) => (
  <svg viewBox="0 0 60 24" width="44" height="20" aria-hidden>
    <path
      d="M2 12 C 18 12, 36 12, 50 12 M 40 4 L 55 12 L 40 20"
      stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  </svg>
);

const Tape = ({ rotate = -12, color, className = '' }) => (
  <div
    className={`absolute pointer-events-none ${className}`}
    style={{ width: 56, height: 18, background: color, opacity: 0.78, transform: `rotate(${rotate}deg)`, mixBlendMode: 'multiply', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
  >
    <svg className="w-full h-full" aria-hidden>
      <filter id={`tape-${rotate}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#tape-${rotate})`} />
    </svg>
  </div>
);

const StarStamp = ({ color, size = 28 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden style={{ mixBlendMode: 'multiply' }}>
    <g fill={color}>
      <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" opacity="0.92" />
    </g>
  </svg>
);

// ── Hero tile ─────────────────────────────────────────────────────────────
const HeroTile = ({ item, index, t }) => {
  const tilt      = [-1.2, 1.6, -0.8, 1.2][index] ?? 0;
  const tapeRot   = [-14, 12, 16, -10];
  const tapeColor = [t.blue, t.red, t.mustard, t.blue][index];
  const tint      = t[item.tintKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-square w-full"
      style={{ filter: 'drop-shadow(2px 4px 0 rgba(26,20,16,0.10))' }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ background: t.bg, border: `1.5px solid ${t.ink}`, borderRadius: 2 }}
      >
        <div className="absolute inset-0" style={{ background: tint, opacity: 0.92, mixBlendMode: t.blend }} />
        <Halftone color={t.ink} opacity={0.18} rotate={index * 15} blend={t.blend} />

        {/* item number */}
        <div
          className="absolute"
          style={{ top: 10, left: 12, fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.bg, fontSize: 44, lineHeight: 1, textShadow: `2px 2px 0 ${t.ink}` }}
        >
          {item.no}
        </div>

        {/* item name */}
        <div
          className="absolute left-3 right-3"
          style={{ bottom: 38, fontFamily: '"Caveat", cursive', fontWeight: 700, color: t.bg, fontSize: 22, lineHeight: 1.05, textShadow: `1px 1px 0 ${t.ink}` }}
        >
          {item.name}
        </div>

        {/* vote bar */}
        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-2"
          style={{ height: 28, background: t.bg, borderTop: `1.5px solid ${t.ink}` }}
        >
          <span style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.ink, fontSize: 18, lineHeight: 1 }}>
            {item.pct}%
          </span>
          <div className="relative flex-1 mx-2 h-2 overflow-hidden" style={{ background: t.bgDeep }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ duration: 0.9, delay: 0.4 + index * 0.08, ease: 'easeOut' }}
              className="h-full"
              style={{ background: tint, mixBlendMode: t.blend }}
            />
          </div>
        </div>
      </div>

      <Tape color={tapeColor} rotate={tapeRot[index]} className={index % 2 === 0 ? '-top-2 -left-2' : '-top-2 -right-2'} />
    </motion.div>
  );
};

// ── How-it-feels step ─────────────────────────────────────────────────────
const Step = ({ n, title, body, delay, t }) => {
  const stepColor = [t.red, t.blue, t.purple][n - 1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="relative pl-12"
    >
      <div
        className="absolute left-0 top-0 flex items-center justify-center"
        style={{ width: 36, height: 36, background: stepColor, color: t.bg, fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 22, borderRadius: '50%', transform: `rotate(${n * 7 - 14}deg)` }}
      >
        {n}
      </div>
      <h4 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.ink, fontSize: 24, lineHeight: 1.05, marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ fontFamily: '"Fraunces", serif', color: t.ink, opacity: 0.78, fontSize: 16, lineHeight: 1.5 }}>
        {body}
      </p>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const isAuthed  = !!user;
  const [mode, setMode] = useState('light');
  const t = themes[mode];

  const goSignup = () => navigate('/landing');
  const goLogin  = () => navigate('/landing');
  const goFeed   = () => navigate('/');
  const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light');

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-8 max-w-screen-xl mx-auto">
        <div style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.01em', color: t.ink }}>
          twirly<span style={{ color: t.red }}>.</span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6 text-sm" style={{ fontFamily: '"Fraunces", serif' }}>
          <button
            onClick={toggleMode}
            style={{ fontFamily: '"Caveat", cursive', fontSize: 17, color: t.ink, opacity: 0.55 }}
            className="hover:opacity-100 transition-opacity"
          >
            {mode === 'light' ? '◐ dark' : '◑ light'}
          </button>

          {isAuthed ? (
            <button onClick={goFeed} style={{ color: t.ink }} className="underline decoration-dotted underline-offset-4">
              go to feed →
            </button>
          ) : (
            <>
              <button onClick={goLogin} style={{ color: t.ink }} className="opacity-70 hover:opacity-100">log in</button>
              <button
                onClick={goSignup}
                className="px-4 py-1.5 transition-transform hover:-translate-y-0.5"
                style={{ background: t.ink, color: t.bg, borderRadius: 999, fontFamily: '"Fraunces", serif', fontWeight: 500 }}
              >
                sign up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pt-8 sm:px-10 sm:pt-14 max-w-screen-xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">

        {/* Headline */}
        <div className="lg:col-span-6 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-2 mb-5"
          >
            <StarStamp color={t.red} size={22} />
            <span style={{ fontFamily: '"Caveat", cursive', fontSize: 20, color: t.ink, opacity: 0.7 }}>
              vote. argue. repeat.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.ink, fontSize: 'clamp(48px, 11vw, 92px)', lineHeight: 0.94, letterSpacing: '-0.015em', marginBottom: 18 }}
          >
            everybody&apos;s got
            <br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              an opinion.
              <HandUnderline color={t.red} className="absolute left-0 -bottom-2 w-full h-3" />
            </span>
            <br />
            <span style={{ color: t.blue }}>now prove it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            style={{ fontFamily: '"Fraunces", serif', fontSize: 18, lineHeight: 1.45, color: t.ink, opacity: 0.82, maxWidth: 520, marginBottom: 24 }}
          >
            Somewhere between a poll and a personality test —
            and twice as addictive.
          </motion.p>
        </div>

        {/* Hero tiles 2×2 */}
        <div className="lg:col-span-6 lg:order-1 mt-10 lg:mt-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="relative">
            <div className="flex items-center justify-between mb-3 px-1">
              <span style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 18, color: t.ink }}>
                &ldquo;{SAMPLE_SET.title}&rdquo;
              </span>
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: t.blue, transform: 'rotate(-2deg)', display: 'inline-block' }}>
                {SAMPLE_SET.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:max-w-none">
              {SAMPLE_SET.items.map((item, i) => (
                <HeroTile key={item.name} item={item} index={i} t={t} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: t.red, animation: 'twirlyPulse 1.6s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.7 }}>
                <strong style={{ color: t.ink }}>1,204</strong> ranking this set right now
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How it feels ─────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-10 pt-24 pb-10 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 flex items-end gap-3"
        >
          <h3 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1, color: t.ink }}>
            how it feels.
          </h3>
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.red, transform: 'rotate(-3deg)', display: 'inline-block', marginBottom: 4 }}>
            (better than doomscrolling)
          </span>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 max-w-4xl">
          <Step n={1} title="post your picks." body="Restaurants, red flags, opinions, albums. Anything the internet has feelings about. Drop them in and name it." delay={0} t={t} />
          <Step n={2} title="the crowd votes." body="One tap. No essays required. Watch the numbers tilt in real time as strangers weigh in." delay={0.1} t={t} />
          <Step n={3} title="the comments open." body="Turns out people have a lot of feelings about this. Results surprise you every time. Sometimes the underdog wins." delay={0.2} t={t} />
        </div>
      </section>

      {/* ── Closer ──────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-10 pt-14 pb-20 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="relative"
          style={{ background: t.ink, color: t.bg, padding: '32px 24px', borderRadius: 4, overflow: 'hidden' }}
        >
          <Halftone color={t.red} opacity={0.18} rotate={12} blend={t.blend} />
          <Halftone color={t.blue} opacity={0.14} rotate={-22} blend={t.blend} />
          <div className="relative">
            <p style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1.05, marginBottom: 10 }}>
              someone just posted something spicy.
            </p>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.mustard, opacity: 0.9, marginBottom: 18 }}>
              you&apos;re already late to the vote. (no algorithm. just people.)
            </p>
            <button
              onClick={isAuthed ? goFeed : goSignup}
              className="inline-flex items-center gap-3 px-6 py-3 transition-transform active:scale-[0.98] hover:-translate-y-0.5"
              style={{ background: t.bg, color: t.ink, borderRadius: 999, fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 18 }}
            >
              {isAuthed ? 'open the feed' : "see what's live"}
              <HandArrow color={t.ink} />
            </button>
          </div>
        </motion.div>

        <footer
          className="mt-10 flex flex-wrap items-center justify-between gap-4"
          style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.55 }}
        >
          <span>© {new Date().getFullYear()} twirly. printed on the internet.</span>
          <div className="flex gap-5">
            <a href="/about" style={{ color: t.ink }} className="hover:underline underline-offset-4">about</a>
            <a href="/landing" style={{ color: t.ink }} className="hover:underline underline-offset-4">log in</a>
            <a href="mailto:hello@twirlyapp.com" style={{ color: t.ink }} className="hover:underline underline-offset-4">say hi</a>
          </div>
        </footer>
      </section>

      <style>{`
        @keyframes twirlyPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50%       { transform: scale(1.6); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
