import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = themes['light'];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px',
    background: t.bgDeep,
    border: `1.5px solid ${t.ink}35`,
    borderRadius: 3,
    color: t.ink,
    fontFamily: '"Fraunces", serif',
    fontSize: 16,
    outline: 'none',
  };

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Link
            to="/landing"
            style={{
              fontFamily: '"Caveat", cursive', fontSize: 16,
              color: t.blue, textDecoration: 'none', opacity: 0.7,
              display: 'inline-block', marginBottom: 20,
            }}
          >
            ← back to login
          </Link>

          <h1
            style={{
              fontFamily: '"DM Serif Display", serif', fontStyle: 'italic',
              fontSize: 'clamp(28px, 6vw, 38px)', color: t.ink,
              lineHeight: 1.05, marginBottom: 10,
            }}
          >
            forgot your password?
          </h1>
          <p
            style={{
              fontFamily: '"Fraunces", serif', fontSize: 16,
              color: t.ink, opacity: 0.6, marginBottom: 28,
            }}
          >
            enter your email and we&apos;ll send a reset link.
          </p>

          {success ? (
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 16, color: t.blue }}>
              check your inbox — reset link sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />

              {error && (
                <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.red, margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: 13,
                  background: t.red, color: '#fff',
                  border: 'none', borderRadius: 3,
                  fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'sending…' : 'send reset link.'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
