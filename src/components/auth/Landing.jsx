import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { config } from '../../config';
import Login from './Login';
import Signup from './Signup';

export default function Landing() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [mode, setMode] = useState('light');
  const t = themes[mode];

  if (user) return <Navigate to="/dashboard" replace />;

  const verificationMessage = location.state?.message;

  const envColor = {
    production: null,
    staging: t.mustard,
    development: t.blue,
  }[config.environment] ?? t.blue;

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      {/* Env badge — hidden in production */}
      {config.environment !== 'production' && (
        <div
          className="absolute top-4 left-4 z-20 px-2 py-0.5 rounded-full"
          style={{
            background: envColor, color: '#fff',
            fontFamily: '"Caveat", cursive', fontSize: 13,
          }}
        >
          {config.environment}
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
        className="absolute top-4 right-5 z-20"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: '"Caveat", cursive', fontSize: 15,
          color: t.ink, opacity: 0.5,
        }}
      >
        {mode === 'light' ? '◐ dark' : '◑ light'}
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-14">

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"DM Serif Display", serif', fontStyle: 'italic',
              fontSize: 'clamp(36px, 8vw, 52px)', color: t.ink, lineHeight: 1,
              padding: 0,
            }}
          >
            twirly.
          </button>
          <p
            style={{
              fontFamily: '"Caveat", cursive', fontSize: 17,
              color: t.ink, opacity: 0.5, margin: '4px 0 0',
            }}
          >
            vote. argue. repeat.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '100%', maxWidth: 400,
            background: t.bgDeep,
            border: `1.5px solid ${t.ink}18`,
            borderRadius: 6,
            padding: '28px 24px',
          }}
        >
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${t.ink}15`, marginBottom: 26 }}>
            {[
              { key: 'login', label: 'log in.' },
              { key: 'signup', label: 'sign up.' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  flex: 1, padding: '8px 0',
                  background: 'none', border: 'none',
                  borderBottom: view === key ? `2px solid ${t.red}` : '2px solid transparent',
                  marginBottom: -1.5,
                  fontFamily: '"DM Serif Display", serif', fontStyle: 'italic',
                  fontSize: 18,
                  color: view === key ? t.ink : `${t.ink}50`,
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {view === 'login'
            ? <Login t={t} onSwitch={() => setView('signup')} />
            : <Signup t={t} onSwitch={() => setView('login')} />
          }
        </motion.div>

        {/* Verification message from email signup flow */}
        {verificationMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 20, fontFamily: '"Fraunces", serif', fontSize: 14,
              color: t.blue, textAlign: 'center', maxWidth: 360,
            }}
          >
            {verificationMessage}
          </motion.p>
        )}
      </div>
    </div>
  );
}
