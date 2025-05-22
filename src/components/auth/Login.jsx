import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Lock, Facebook, Linkedin } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
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
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      switch (provider) {
        case 'google':
          await authService.signInWithGoogle();
          break;
        case 'apple':
          await authService.signInWithApple();
          break;
        case 'facebook':
          await authService.signInWithFacebook();
          break;
        default:
          throw new Error('Invalid provider');
      }
    } catch (error) {
      setError(error.message || `Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
         style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8"
             style={{ 
               backgroundColor: currentTheme.colors.card,
               borderColor: currentTheme.colors.border,
             }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-2"
                style={{ color: currentTheme.colors.text }}>
              LOGIN
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#fff',
                color: '#757575',
                borderColor: currentTheme.colors.border,
              }}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#000',
                color: '#fff',
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.22 6.41-.65 1.29-1.43 2.58-2.25 4.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#1877F2',
                color: '#fff',
              }}
            >
              <Facebook className="w-5 h-5 mr-2" />
              Continue with Facebook
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: currentTheme.colors.border }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2" style={{ backgroundColor: currentTheme.colors.card, color: currentTheme.colors.textSecondary }}>
                Or continue with email
              </span>
            </div>
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

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            Need an account?{' '}
            <Link
              to="/signup"
              className="font-medium hover:underline"
              style={{ color: currentTheme.colors.primary }}
            >
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 