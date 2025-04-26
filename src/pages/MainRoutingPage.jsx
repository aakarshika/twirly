// File: src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ComparisonProvider } from '../contexts/ComparisonContext';
import { ComparisonDraftProvider } from '../contexts/ComparisonDraftContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Trending from './Trending';
import PollScreen from './PollScreen';
import ProductDetails from './ProductDetails';
import ItemPage from './ItemPage';
import UserDashboard from './UserDashboard';
import { useTheme } from '../contexts/ThemeContext';
import Settings from './Settings';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ForgotPassword from '../components/auth/ForgotPassword';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { userService } from '../services/userService';
import PollScreenAspect from './PollScreenAspect';
import ProductDetailsPage from './ProductDetailsPage';
import CreateComparison from '../components/dashboard/tabs/CreateComparison';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Onboarding Route wrapper
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        const preferences = await userService.getUserPreferences(user.id);
        setIsOnboardingComplete(preferences && preferences.username);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isOnboardingComplete) {
    return <Navigate to="/dashboard" />;
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ComparisonProvider>
      <ComparisonDraftProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Trending />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparison-aspect/:id"
                element={
                  <ProtectedRoute>
                    <PollScreenAspect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparison/:id"
                element={
                  <ProtectedRoute>
                    <PollScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-comparison"
                element={
                  <ProtectedRoute>
                    <CreateComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:itemId"
                element={
                  <ProtectedRoute>
                    <ProductDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/item/:itemId"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />

              {/* Onboarding Route */}
              <Route
                path="/onboarding"
                element={
                  <OnboardingRoute>
                    <OnboardingFlow />
                  </OnboardingRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </ComparisonDraftProvider>
    </ComparisonProvider>
  );
};

export default MainRoutingPage;