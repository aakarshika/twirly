import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Lock, Facebook, Linkedin } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
         style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-md w-full h-full">
        <div className="bg-white rounded-2xl shadow-xl p-8"
             style={{ 
               backgroundColor: currentTheme.colors.card,
               borderColor: currentTheme.colors.border,
             }}>
              <div className="flex flex-col items-center justify-center"> 
                <img src={'/public_logo_transparent.png'} alt="Twirly Logo" className="w-100 h-100" />
                <h1 className="text-2xl font-bold">Welcome to Twirly</h1>
                <p className="text-gray-500">Where your opinions matter</p>
              </div>
              <div className="flex flex-col items-center justify-center"> 
                
              <div className="items-center space-x-4 mt-10">
                <Link
                  to="/login"
                  className="text-sm font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.buttonText
                  }}
                >
                  Sign Up
                </Link>
              </div>
              </div>
        </div>
      </div>
    </div>
  );
} 