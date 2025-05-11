import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Lock, Facebook, Linkedin, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { currentTheme } = useTheme();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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

                <div className="flex justify-center gap-4">
                  <button className="p-3 rounded-lg border-2 transition-all duration-300 hover:bg-gray-50"
                          style={{ borderColor: currentTheme.colors.border }}>
                    <Facebook className="w-5 h-5" style={{ color: currentTheme.colors.text }} />
                  </button>
                  <button className="p-3 rounded-lg border-2 transition-all duration-300 hover:bg-gray-50"
                          style={{ borderColor: currentTheme.colors.border }}>
                    <Linkedin className="w-5 h-5" style={{ color: currentTheme.colors.text }} />
                  </button>
                </div>
              </div>
        </div>
      </div>
    </div>
  );
} 