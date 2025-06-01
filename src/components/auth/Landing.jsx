import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { config } from '../../config';
import Login from './Login';
import Signup from './Signup';
import TwirlingTwirlyLogo from './TwirlingTwirlyLogo';
// Mobile Landing Component
const MobileLanding = ({ currentTheme, handleSocialAuth, loading, modalType, setModalType }) => {

  const openModal = (type) => {
    setModalType(type);
  };
  if (modalType === 'login') {
    return <Login source="MOBILE" onGoToSignup={() => setModalType('signup')} onGoHome={() => setModalType(null)} />
  } else if (modalType === 'signup') {
    return <Signup source="MOBILE" onGoToLogin={() => setModalType('login')} onGoHome={() => setModalType(null)} />
  }
  return (
    <div className="flex flex-col  mt-24">
      {/* Environment Indicator */}
      <div
        className="absolute top-0 right-0 mt-12 mr-4 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: config.environment === 'development' ? '#4CAF50' :
            config.environment === 'staging' ? '#FFA726' : '#F44336',
          color: 'white'
        }}
      >
        {config.environment.toUpperCase()}
      </div>

      <div className="flex flex-col px-6  items-center justify-between">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-6 mb-12">
          <TwirlingTwirlyLogo />
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
              Welcome to Twirly
            </h1>
            <p className="text-lg mt-2" style={{ color: currentTheme.colors.text }}>
              Your opinions matter here.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row w-full mt-24">
          <button
            onClick={() => openModal('login')}
            className="w-full p-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2"
            style={{
              color: currentTheme.colors.text,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <User className="w-4 h-4" />
            Login
          </button>
          <button
            onClick={() => openModal('signup')}
            className="w-full p-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2"
            style={{
              color: currentTheme.colors.text,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <User className="w-4 h-4" />
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

// Web Landing Component
const WebLanding = ({ currentTheme, handleSocialAuth, loading, modalType, setModalType }) => {
  return (
    <div className="flex items-center justify-center">
      {/* Environment Indicator */}
      <div
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: config.environment === 'development' ? '#4CAF50' :
            config.environment === 'staging' ? '#FFA726' : '#F44336',
          color: 'white'
        }}
      >
        {config.environment.toUpperCase()}
      </div>

      {/* Background decorative elements */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}>
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(205, 170, 240, 0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1.2, x: 100, y: 100 }}
          transition={{ duration: 4, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}></motion.div>
        <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(158, 158, 253, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1.2, x: 100, y: 100 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}></motion.div>
      </motion.div>

      <div className="max-w-4xl w-full mx-auto px-8 flex items-center justify-between">
        {/* Left side - Logo and Text */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col space-y-6">
            <div className="w-full items-center justify-center">
              <TwirlingTwirlyLogo />
            </div>
            <div className="w-full items-center justify-center">
              <h1 className="text-5xl text-center font-bold" style={{ color: currentTheme.colors.text }}>
                Welcome to Twirly
              </h1>
              <p className="text-xl mt-4 text-center" style={{ color: currentTheme.colors.text }}>
                Your opinions matter here.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex-1 space-y-6 pl-12">
          {modalType !== 'signup' ?
            (<Login source="WEB" onGoToSignup={() => setModalType('signup')} onGoHome={() => setModalType(null)} />)
            : (<Signup source="WEB" onGoToLogin={() => setModalType('login')} onGoHome={() => setModalType(null)} />)}
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const [modalType, setModalType] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, error: authError } = useAuth();
  const { currentTheme } = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();


  // Get verification message from navigation state or URL parameters
  const verificationMessage = location.state?.message;
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    // Check if we're coming back from email verification
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    if (type === 'signup' && token) {
      setVerificationStatus('success');
      // Clear the URL parameters without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);

      // If we're in native app and have the email from state, try to auto-login
      if (isNativePlatform() && location.state?.email) {
        handleAutoLogin(location.state.email);
        console.log("handleAutoLogin", "location.state.email", location.state.email);
      }
    }
  });

  const handleAutoLogin = async (email) => {
    console.log("handleAutoLogin", "email", email, "handleeeeeee");
    setLoading(true);
    try {
      // Try to sign in with the email from signup
      await signIn(email, location.state?.password || '');
      navigate('/dashboard');
    } catch (error) {
      console.error('Auto-login failed:', error);
      // If auto-login fails, we'll just show the success message and let user login manually
      setError('Please log in with your credentials');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSocialAuth = async (provider) => {
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

  return (
    <div className="">
      {verificationStatus === 'success' && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 text-sm text-center">
          Your email has been verified successfully! You can now log in.
        </div>
      )}
      {verificationMessage && !verificationStatus && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm text-center">
          {verificationMessage}
        </div>
      )}
      {isMobile ? (
        <MobileLanding
          currentTheme={currentTheme}
          handleSocialAuth={handleSocialAuth}
          loading={loading}
          modalType={modalType}
          setModalType={setModalType}
        />
      ) : (
        <WebLanding
          currentTheme={currentTheme}
          handleSocialAuth={handleSocialAuth}
          loading={loading}
          modalType={modalType}
          setModalType={setModalType}
        />
      )}
      {(error || authError) && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-sm text-white bg-red-500">
          {error || authError}
        </div>
      )}
    </div>
  );
} 