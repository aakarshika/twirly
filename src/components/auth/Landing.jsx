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
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8"
             style={{ 
               backgroundColor: currentTheme.colors.card,
               borderColor: currentTheme.colors.border,
             }}>hey 
        </div>
      </div>
    </div>
  );
} 