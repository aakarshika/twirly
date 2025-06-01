import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  console.log('[Signup] Component rendering');
  
  const { user, signUp, signInWithGoogle, error: authError } = useAuth();
  console.log('[Signup] Auth state:', { hasUser: !!user, authError });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Signup] Component mounted');
    return () => {
      console.log('[Signup] Component unmounted');
    };
  }, []);

  // Redirect if user is already logged in
  if (user) {
    console.log('[Signup] User exists, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    console.log('[Signup] Validating form');
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    console.log('[Signup] Form validation passed');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('[Signup] Form field changed:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Signup] Form submitted');
    setError('');

    if (!validateForm()) {
      console.log('[Signup] Form validation failed');
      return;
    }

    setLoading(true);
    console.log('[Signup] Starting signup process');

    try {
      console.log('[Signup] Calling signUp with email:', formData.email);
      await signUp(formData.email, formData.password);
      console.log('[Signup] Signup successful');
      // Navigate to login page with verification message and credentials for auto-login
      navigate('/login', { 
        state: { 
          message: 'Please check your email to verify your account. You can now log in once verified.',
          email: formData.email,
          password: formData.password
        } 
      });
    } catch (error) {
      console.error('[Signup] Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
      console.log('[Signup] Signup process completed');
    }
  };

  const handleSocialSignup = async (provider) => {
    console.log('[Signup] Social signup initiated:', provider);
    setError('');
    setLoading(true);

    try {
      if (provider === 'google') {
        console.log('[Signup] Starting Google signup');
        await signInWithGoogle();
        console.log('[Signup] Google signup successful');
      } else {
        throw new Error('Invalid provider');
      }
    } catch (error) {
      console.error('[Signup] Social signup error:', error);
      setError(error.message || `Failed to sign up with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
      console.log('[Signup] Social signup process completed');
    }
  };

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
              SIGN UP
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleSocialSignup('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
              {loading ? 'Signing up...' : 'Continue with Google'}
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    }}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2"
                       style={{ color: currentTheme.colors.text }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    }}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            {(error || authError) && (
              <div className="text-red-500 text-sm text-center">
                {error || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
              }}
            >
              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: currentTheme.colors.primary }}
            >
              LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 