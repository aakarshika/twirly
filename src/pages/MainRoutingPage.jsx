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
import ComparePage from './compare-page/ComparePage';
import { useLoading } from '../contexts/LoadingContext';
import { useMediaQuery } from 'react-responsive';
import { TrendingProvider, useTrending } from '../contexts/TrendingContext';
import BackgroundImage from '../components/common/BackgroundImage';
import { useBetaTesting } from '../contexts/BetaTestingContext';
import PerformanceMonitor from '../components/PerformanceMonitor';
import BetaTestingControls from '../components/beta/BetaTestingControls';
import BetaPerformance from '../pages/beta/BetaPerformance';
import BetaAnalytics from '../pages/beta/BetaAnalytics';
import ErrorTest from '../components/ErrorTest';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFoundPage from '../components/NotFoundPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const location = useLocation();
  const { setLoading, setError } = useLoading();

  useEffect(() => {
    console.log('[ProtectedRoute] Mounted with user:', !!user);
    const checkOnboardingStatus = async () => {
      if (!user) {
        console.log('[ProtectedRoute] No user, skipping onboarding check');
        return;
      }
      try {
        console.log('[ProtectedRoute] Starting onboarding check');
        setLoading('onboarding', true, 'Checking onboarding status...');
        const prefs = await userService.getUserPreferences(user.id);
        const cats = await userService.getUserCategoryPreferences(user.id);
        const notif = await userService.getUserNotificationSettings(user.id);
        const isComplete = prefs && prefs.display_name && cats.length > 0 && notif.created_at !== notif.updated_at;
        console.log('[ProtectedRoute] Onboarding check complete:', { isComplete, prefs, cats, notif });
        setIsOnboardingComplete(isComplete);
      } catch (error) {
        console.error('[ProtectedRoute] Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
        setError('onboarding', 'Failed to check onboarding status. Please try again.', () => window.location.reload());
      } finally {
        setLoading('onboarding', false);
        setCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  console.log('[ProtectedRoute] Render state:', { 
    hasUser: !!user, 
    loading, 
    checkingOnboarding, 
    isOnboardingComplete,
    currentPath: location.pathname 
  });

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to landing');
    return <Navigate to="/landing" />;
  }

  if (loading || checkingOnboarding) {
    console.log('[ProtectedRoute] Loading or checking onboarding, showing null');
    return null;
  }

  if (!isOnboardingComplete && location.pathname !== '/onboarding') {
    console.log('[ProtectedRoute] Onboarding incomplete, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('[ProtectedRoute] Rendering children');
  return children;
};

// Add this component before MainRoutingPage
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isTrendingPage = pathname === '/';

  useEffect(() => {
    if (!isTrendingPage) {
      // For non-trending pages, scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, isTrendingPage]);

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
  console.log('[MainRoutingPage] Component mounting');
  const { currentTheme } = useTheme();
  const { loading, user } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();
  const { showPerformanceMonitor } = useBetaTesting();

  useEffect(() => {
    console.log('[MainRoutingPage] Auth state changed:', { 
      loading, 
      hasUser: !!user,
      isInitialLoad,
      currentPath: location.pathname,
      isMobile
    });
  }, [loading, user, isInitialLoad, location.pathname, isMobile]);

  const shouldShowHeader = () => {
    const show = !isMobile || ['/', '/dashboard', '/settings', '/compare', '/user'].some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
    console.log('[MainRoutingPage] Header visibility check:', { show, path: location.pathname, isMobile });
    return show;
  };

  const isPublicRoute = () => {
    const isPublic = ['/login', '/landing', '/signup', '/forgot-password', '/auth/v1/callback', '/auth/callback']
      .some(path => location.pathname === path);
    console.log('[MainRoutingPage] Public route check:', { isPublic, path: location.pathname });
    return isPublic;
  };

  useEffect(() => {
    console.log('[MainRoutingPage] Setting up initial load timer');
    const timer = setTimeout(() => {
      console.log('[MainRoutingPage] Initial load timer complete');
      setIsInitialLoad(false);
    }, 500);

    return () => {
      console.log('[MainRoutingPage] Cleaning up initial load timer');
      clearTimeout(timer);
    };
  }, []);

  if (isInitialLoad) {
    console.log('[MainRoutingPage] Showing initial loading screen');
    return null;
  }

  if (loading && user) {
    console.log('[MainRoutingPage] Showing auth loading screen');
    return null;
  }

  console.log('[MainRoutingPage] Rendering main content');
  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
        <ComparisonDraftProvider>
          <TrendingProvider>
            <BackgroundImage />

            <div 
              className="relative flex flex-col min-h-screen mx-auto" 
              style={{ 
                paddingTop: shouldShowHeader() && !isPublicRoute() ? '64px' : '0px',
                marginLeft: !isMobile && user ? '16rem' : '0',
                zIndex: 10
              }}
            >
              {!isPublicRoute() && <Header />}
              <main className="flex-1 overflow-x-auto">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/v1/callback" element={<Navigate to="/" replace />} />
                  <Route path="/auth/callback" element={<Navigate to="/" replace />} />
                  
                  {/* Protected Routes */}
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>}/>
                  <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>}/>
                  <Route path="/" element={<ProtectedRoute><Trending /></ProtectedRoute>}/>
                  <Route path="/error-test" element={<ProtectedRoute><ErrorTest /></ProtectedRoute>}/>
                  
                  {/* Beta Testing Routes */}
                  <Route path="/beta/performance" element={<ProtectedRoute><BetaPerformance /></ProtectedRoute>}/>
                  <Route path="/beta/analytics" element={<ProtectedRoute><BetaAnalytics /></ProtectedRoute>}/>
                  <Route path="beta/feedback" element={<ProtectedRoute><FeedbackManagement /></ProtectedRoute>} />
                  
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

                  {/* Waiting Verification Route */}
                  <Route path="/waiting-verification" element={<WaitingVerification />} />
                  
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />

              {/* Beta Testing Components */}
              <BetaTestingControls />
              {showPerformanceMonitor && <PerformanceMonitor isVisible={true} />}
              <FeedbackModal />
            </div>
          </TrendingProvider>
        </ComparisonDraftProvider>
      </div>
    </ErrorBoundary>
  );
};

export default MainRoutingPage;