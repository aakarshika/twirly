// File: src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ComparisonDraftProvider } from '../contexts/ComparisonDraftContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Trending from './trending-page/Trending';
import ProductDetails from './product-details/ProductDetails';
import UserDashboard from './user-dashboard-page/UserDashboard';
import { useTheme } from '../contexts/ThemeContext';
import Settings from './settings-page/Settings';
import Login from '../components/auth/Login';
import Landing from '../components/auth/Landing';
import Signup from '../components/auth/Signup';
import ForgotPassword from '../components/auth/ForgotPassword';
import OnboardingFlow from './onboarding/OnboardingFlow';
import { userService } from '../services/userService';
import SearchPage from './search/search-page/SearchPage';
import UserProfile from './user-dashboard-page/UserProfile';
import WaitingVerification from '../components/auth/WaitingVerification';
import { FeedbackProvider } from '../contexts/FeedbackContext';
import FloatingFeedbackButton from './feedback/FloatingFeedbackButton';
import FeedbackModal from './feedback/FeedbackModal';
import FeedbackManagement from './feedback/feedback-page/FeedbackManagement';
import CreateComparison from './user-dashboard-page/dashboard/tabs/CreateComparison';
import { TrendingUp } from 'lucide-react';
import ComparePage from './compare-page/ComparePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      try {
        const prefs = await userService.getUserPreferences(user.id);
        const cats = await userService.getUserCategoryPreferences(user.id);
        const notif = await userService.getUserNotificationSettings(user.id);
        const isComplete = prefs && prefs.display_name && cats.length > 0 && notif.created_at !== notif.updated_at;
        setIsOnboardingComplete(isComplete);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/public_logo_transparent.png" alt="logo" className="h-100 w-100 mx-auto rotate-45" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" />;
  }

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/public_logo_transparent.png" alt="logo" className="h-100 w-100 mx-auto rotate-45" />
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Add this component before MainRoutingPage
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// // Add this component before MainRoutingPage
// const SwipeBackWrapper = ({ children }) => {
//   const navigate = useNavigate();
  
//   const handlers = useSwipeable({
//     onSwipedRight: () => {
//       navigate(-1);
//     },
//     preventDefaultTouchmoveEvent: true,
//     trackMouse: true
//   });
//   const { currentTheme } = useTheme();

//   return (
//     <div {...handlers} className="h-full w-full" style={{ backgroundColor: currentTheme.colors.background }}>
//       {children}
//     </div>
//   );
// };

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const MainRoutingPage = () => {
  const { currentTheme } = useTheme();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading?...</p>
        </div>
      </div>
    );
  }

  return (
      <FeedbackProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text,
                paddingBottom: 'calc( var(--safe-area-inset-bottom))' }}>
          <Header />
            <main 
              className="flex-grow"
              style={{ 
                paddingBottom: '100px',
                paddingTop: 'calc( var(--safe-area-inset-top))',
              }}
            >
              <Routes>
                {/* Protected Routes */}
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>}/>
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>}/>
                <Route path="/" element={<ProtectedRoute>
                  
        <div className="flex justify-center p-4" style={{ marginTop: true ? '64px' : '0px' }}>
          <TrendingUp size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
            Trending Comparisons
          </h1>
        </div>
        <Trending /></ProtectedRoute>}/>
                
                {/* Compare routes */}
                <Route path="/compare/:id/*" element={
                  <ProtectedRoute>
                      <ComparePage />
                  </ProtectedRoute>
                }/>
                
                
                {/* Other routes */}
                <Route path="/new-comparison" element={
                  <ProtectedRoute>
                    <ComparisonDraftProvider>
                      <CreateComparison />
                    </ComparisonDraftProvider>
                  </ProtectedRoute>
                }/>
                <Route path="/edit-comparison/:id" element={
                  <ProtectedRoute>
                    <ComparisonDraftProvider>
                      <CreateComparison />
                    </ComparisonDraftProvider>
                  </ProtectedRoute>}/>
                <Route path="/item/:itemId" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>}/>
                <Route path="/item/:itemId/:tab" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>}/>
                <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}/>
                <Route path="/dashboard/:tab" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}/>
                <Route path="/user/:username" element={<UserProfile />} />
                <Route path="/user/:username/:tab" element={<UserProfile />} />
                <Route path="/feedback" element={<ProtectedRoute><FeedbackManagement /></ProtectedRoute>} />

                {/* Waiting Verification Route */}
                <Route path="/waiting-verification" element={<WaitingVerification />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </main>
          <FloatingFeedbackButton />
          <FeedbackModal />
        </div>
      </FeedbackProvider>
  );
};

export default MainRoutingPage;