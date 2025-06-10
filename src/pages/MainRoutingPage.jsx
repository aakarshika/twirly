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
import { FeedbackProvider } from '../contexts/FeedbackContext';
import FloatingFeedbackButton from './feedback/FloatingFeedbackButton';
import FeedbackModal from './feedback/FeedbackModal';
import FeedbackManagement from './feedback/feedback-page/FeedbackManagement';
import CreateComparison from './user-dashboard-page/dashboard/tabs/CreateComparison';
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
import { App } from '@capacitor/app';
import { authService } from '../services/authService';
import TikTokScroll from '../components/TikTokScroll';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const location = useLocation();
  const { setLoading, setError } = useLoading();

  useEffect(() => {
    let mounted = true;

    const checkOnboardingStatus = async () => {
      if (!user) {
        if (mounted) {
          setCheckingOnboarding(false);
        }
        return;
      }

      try {
        setLoading('onboarding', true, 'Checking onboarding status...');
        const [prefs, cats, notif] = await Promise.all([
          userService.getUserPreferences(user.id),
          userService.getUserCategoryPreferences(user.id),
          userService.getUserNotificationSettings(user.id)
        ]);
        
        if (mounted) {
          const isComplete = prefs && prefs.display_name && cats.length > 0 && notif.created_at !== notif.updated_at;
          setIsOnboardingComplete(isComplete);
          setCheckingOnboarding(false);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error checking onboarding status:', error);
        if (mounted) {
          setIsOnboardingComplete(false);
          setCheckingOnboarding(false);
          setError('onboarding', 'Failed to check onboarding status. Please try again.', () => window.location.reload());
        }
      } finally {
        if (mounted) {
          setLoading('onboarding', false);
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object

  if (loading || checkingOnboarding) {
    return null;
  }

  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  if (!isOnboardingComplete) {
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    // If already on /onboarding, render children
  }

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
  const { currentTheme } = useTheme();
  const { loading, user } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();
  const { showPerformanceMonitor } = useBetaTesting();

  useEffect(() => {
    // Set up app URL open listener for handling auth callbacks
    const setupAppUrlListener = async () => {
      App.addListener('appUrlOpen', async ({ url }) => {
        if (url.includes('auth/callback')) {
          try {
            await authService.handleAuthCallback(url);
            window.location.reload();
          } catch (error) {
            console.error('Error handling auth callback:', error);
          }
        }
      });
    };

    setupAppUrlListener();
  }, []);
  const shouldShowHeader = () => {
    const show = !isMobile || ['/', '/dashboard', '/settings', '/compare', '/user'].some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
    return show;
  };

  const isPublicRoute = () => {
    const isPublic = ['/login', '/landing', '/signup', '/forgot-password', '/auth/v1/callback', '/auth/callback']
      .some(path => location.pathname.includes(path));
    return isPublic;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoad || (loading && user)) {
    return null;
  }
  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen"  
        style={{ 
          color: currentTheme.colors.text
        }}
      >
        <ComparisonDraftProvider>
          <TrendingProvider>
            <BackgroundImage />

            <div 
              className="relative flex flex-col " 
              style={{ 
                zIndex: 10
              }}
            >
              {!isPublicRoute() && <Header />}
              <main className="flex-1 md:pl-60 lg:pl-60" style={{ paddingTop: isPublicRoute() ? '0' : '64px' }}>
                <Routes>
                  {/* Public Routes */}
                  {/* <Route path="/login" element={<Login />} /> */}
                  <Route path="/landing" element={<Landing />} />
                  {/* <Route path="/signup" element={<Signup />} /> */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/v1/callback" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
                  
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
                      <TikTokScroll />
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
                  
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              {!isPublicRoute() && <Footer />}

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