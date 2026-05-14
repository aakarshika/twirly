// File: src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { ComparisonDraftProvider } from '../contexts/ComparisonDraftContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Trending from './trending-page/Trending';
import ProductDetails from './product-details/ProductDetails';
import UserDashboard from './user-dashboard-page/UserDashboard';
import { useTheme } from '../contexts/ThemeContext';
import Settings from './settings-page/Settings';
import Landing from '../components/auth/Landing';
import ForgotPassword from '../components/auth/ForgotPassword';
import OnboardingFlow from './onboarding/OnboardingFlow';
import { userPreferences } from '../services/userPreferences';
import SearchPage from './search/search-page/SearchPage';
import UserProfile from './user-dashboard-page/UserProfile';
import FeedbackModal from './feedback/FeedbackModal';
import FeedbackManagement from './feedback/feedback-page/FeedbackManagement';
import CreateComparison from './user-dashboard-page/dashboard/tabs/CreateComparison';
import { useLoading } from '../contexts/LoadingContext';
import { TrendingProvider } from '../contexts/TrendingContext';
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
import ActivityPage from './activity-page/ActivityPage';
import LandingPage from './landing/LandingPage';

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
          userPreferences.getUserPreferences(user.id),
          userPreferences.getUserCategoryPreferences(user.id),
          userPreferences.getUserNotificationSettings(user.id),
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
const _ScrollToTop = () => {
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

const ROOT_TABS = ['/', '/search', '/dashboard', '/activity'];

const SwipeBackWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isComparePage = location.pathname.startsWith('/compare');
  const isRootTab = ROOT_TABS.includes(location.pathname);
  const enabled = !isComparePage && !isRootTab;

  const handlers = useSwipeable({
    onSwipedRight: () => { if (enabled) navigate(-1); },
    delta: 60,
    preventScrollOnSwipe: false,
    trackMouse: false,
  });

  return (
    <div {...(enabled ? handlers : {})} className="h-full w-full">
      {children}
    </div>
  );
};

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const PUBLIC_PATHS = ['/login', '/landing', '/signup', '/forgot-password', '/auth/v1/callback', '/auth/callback'];

// At "/", logged-out visitors see the marketing landing; logged-in users go to the feed.
// We keep the Trending protected behind the onboarding check via ProtectedRoute.
const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <ProtectedRoute><Trending /></ProtectedRoute>;
};

const MainRoutingPage = () => {
  const { currentTheme } = useTheme();
  const { loading, user } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();
  const { showPerformanceMonitor } = useBetaTesting();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const isPublicRoute = PUBLIC_PATHS.some(p => location.pathname.includes(p));
  const isComparePage = location.pathname.startsWith('/compare');
  // Marketing landing renders at "/" for logged-out visitors and brings its own header.
  const isMarketingLanding = location.pathname === '/' && !user;
  const hideAppChrome = isPublicRoute || isMarketingLanding;

  // Top bar height: 56px mobile/tablet, 64px desktop (expressed via Tailwind)
  // SideNav offset: 256px (w-64) on desktop only
  const mainClassName = [
    'flex-1',
    hideAppChrome ? '' : 'lg:pl-64',
    !hideAppChrome && !isComparePage ? 'pt-14 lg:pt-16' : '',
  ].filter(Boolean).join(' ');

  if (isInitialLoad || (loading && user)) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen"
        style={{ color: currentTheme.colors.text }}
      >
        <ComparisonDraftProvider>
          <TrendingProvider>
            <BackgroundImage />

            <div className="relative flex flex-col" style={{ zIndex: 10 }}>
              {!hideAppChrome && <Header />}

              <main className={mainClassName}>
                <SwipeBackWrapper>
                  <Routes>
                    {/* Public */}
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/v1/callback" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />

                    {/* Protected */}
                    <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
                    <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/error-test" element={<ProtectedRoute><ErrorTest /></ProtectedRoute>} />

                    {/* Beta */}
                    <Route path="/beta/performance" element={<ProtectedRoute><BetaPerformance /></ProtectedRoute>} />
                    <Route path="/beta/analytics" element={<ProtectedRoute><BetaAnalytics /></ProtectedRoute>} />
                    <Route path="beta/feedback" element={<ProtectedRoute><FeedbackManagement /></ProtectedRoute>} />

                    {/* Compare (fullscreen) */}
                    <Route path="/compare/:id/*" element={<ProtectedRoute><TikTokScroll /></ProtectedRoute>} />

                    {/* Other */}
                    <Route path="/new-comparison" element={
                      <ProtectedRoute>
                        <ComparisonDraftProvider><CreateComparison /></ComparisonDraftProvider>
                      </ProtectedRoute>
                    } />
                    <Route path="/edit-comparison/:id" element={
                      <ProtectedRoute>
                        <ComparisonDraftProvider><CreateComparison /></ComparisonDraftProvider>
                      </ProtectedRoute>
                    } />
                    <Route path="/item/:itemId" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                    <Route path="/item/:itemId/:tab" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                    <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                    <Route path="/dashboard/:tab" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                    <Route path="/user/:username" element={<UserProfile />} />
                    <Route path="/user/:username/:tab" element={<UserProfile />} />

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </SwipeBackWrapper>
              </main>

              {!hideAppChrome && !isComparePage && <Footer />}

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
