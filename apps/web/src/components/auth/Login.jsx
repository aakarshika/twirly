import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login({ t, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, error: authError } = useAuth();

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px',
    background: t.bg,
    border: `1.5px solid ${t.ink}35`,
    borderRadius: 3,
    color: t.ink,
    fontFamily: '"Fraunces", serif',
    fontSize: 16,
    outline: 'none',
  };

  const labelStyle = {
    fontFamily: '"Caveat", cursive',
    fontSize: 16, color: t.ink, opacity: 0.65,
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : err.message || 'Sign in failed. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try { await signInWithGoogle(); }
    catch (err) { setError(err.message || 'Google sign in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, ...labelStyle }}>email</label>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={labelStyle}>password</span>
          <Link
            to="/forgot-password"
            style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.blue, textDecoration: 'none' }}
          >
            forgot?
          </Link>
        </div>
        <input
          type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      {(error || authError) && (
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.red, margin: 0 }}>
          {error || authError}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        style={{
          width: '100%', padding: 13, marginTop: 4,
          background: t.red, color: '#fff',
          border: 'none', borderRadius: 3,
          fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'logging in…' : 'log in.'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: t.ink, opacity: 0.15 }} />
        <span style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: t.ink, opacity: 0.4 }}>or</span>
        <div style={{ flex: 1, height: 1, background: t.ink, opacity: 0.15 }} />
      </div>

      <button
        type="button" onClick={handleGoogle} disabled={loading}
        style={{
          width: '100%', padding: '11px 14px',
          background: '#fff', color: '#444',
          border: `1.5px solid ${t.ink}25`, borderRadius: 3,
          fontFamily: '"Fraunces", serif', fontSize: 15,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        <GoogleLogo />
        Continue with Google
      </button>

      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.55, textAlign: 'center', margin: 0 }}>
        no account?{' '}
        <button
          type="button" onClick={onSwitch}
          style={{
            background: 'none', border: 'none', padding: 0,
            color: t.blue, fontFamily: '"Fraunces", serif', fontSize: 14,
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          sign up.
        </button>
      </p>
    </form>
  );
}
