import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Landing() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSocialAuth = async (provider) => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await authService.signInWithGoogle();
      } else {
        throw new Error('Invalid provider');
      }
    } catch (error) {
      setError(error.message || `Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
         style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
             style={{ backgroundColor: currentTheme.colors.primary }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
             style={{ backgroundColor: currentTheme.colors.primary }}></div>
      </div>

      <div className="max-w-md w-full h-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.02]"
             style={{ 
               backgroundColor: currentTheme.colors.card,
               borderColor: currentTheme.colors.border,
             }}>
              <div className="flex flex-col items-center justify-center space-y-6"> 
                <div className="relative group">
                  <img src={'/public_logo_transparent.png'} alt="Twirly Logo" 
                       className="w-100 h-100 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                animate-shimmer opacity-0 group-hover:opacity-100"></div>
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 
                               bg-clip-text text-transparent">
                    Welcome to Twirly
                  </h1>
                  <p className="text-gray-500 text-lg">Your opinions matter here.</p>
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-lg border-2 
                             transition-all duration-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                    style={{ 
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.border
                    }}
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-lg 
                             transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: currentTheme.colors.primary,
                      color: currentTheme.colors.buttonText
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: currentTheme.colors.border }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2" style={{ backgroundColor: currentTheme.colors.card, color: currentTheme.colors.text }}>
                      Or continue with
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleSocialAuth('google')}
                  className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                  style={{ 
                    borderColor: currentTheme.colors.border,
                    backgroundColor: '#fff',
                    color: '#757575'
                  }}
                  disabled={loading}
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

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
        </div>
      </div>
    </div>
  );
} 