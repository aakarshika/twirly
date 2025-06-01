import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Lock } from 'lucide-react';
import { isNativePlatform } from '../../config/auth';
import { changeColorAlpha } from '../../lib/utils';
import TwirlingTwirlyLogo from './TwirlingTwirlyLogo';
export default function Login({ onGoToSignup, onGoHome, source }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, error: authError } = useAuth();
  const { currentTheme } = useTheme();


  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        throw new Error('Invalid provider');
      }
    } catch (error) {
      setError(error.message || `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-12">
      <div className="">
        <div className=""
             style={{ 
             }}>
              {source === 'MOBILE' && (<div className="flex flex-col items-center justify-center" onClick={onGoHome}>   
                <TwirlingTwirlyLogo />
              </div>)}
          <div className="">
            <h2 className="text-lg font-bold text-center m-2"
                style={{ color: currentTheme.colors.text }}>
              LOGIN
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2"
                       style={{ color: currentTheme.colors.text }}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2"
                       style={{ color: currentTheme.colors.text }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    }}
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm"
                       style={{ color: currentTheme.colors.text }}>
                  Remember me?
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium hover:underline"
                style={{ color: currentTheme.colors.primary }}
              >
                Forgot Password?
              </Link>
            </div>

            {(error || authError) && (
              <div className="text-red-500 text-sm text-center">
                {error || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
                marginTop: '66px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <div className="flex flex-row items-center justify-center my-2">
            <div className="flex w-full">
              <div className="w-full border-t" style={{ borderColor: currentTheme.colors.border }}></div>
            </div>
            <div className="flex justify-center text-sm">
              <span className="px-2" style={{color: currentTheme.colors.textSecondary }}>
                OR
              </span>
            </div>
            <div className="flex w-full">
              <div className="w-full border-t" style={{ borderColor: currentTheme.colors.border }}></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              style={{
                backgroundColor: '#fff',
                color: '#757575',
                borderColor: currentTheme.colors.border,
              }}
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: '#4285F4' }}
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: '#34A853' }}
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  style={{ fill: '#FBBC05' }}
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  style={{ fill: '#EA4335' }}
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            Need an account?{' '}
            <button
              onClick={onGoToSignup}
              className="font-medium hover:underline"
              style={{ color: currentTheme.colors.primary }}
            >
              SIGN UP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 