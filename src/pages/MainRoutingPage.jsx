// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComparisonProvider } from '../contexts/ComparisonContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Trending from './Trending';
import PollScreen from './PollScreen';
import ProductDetails from './ProductDetails';
import UserDashboard from './UserDashboard';
import { useTheme } from '../contexts/ThemeContext';
import Settings from './Settings';

// Placeholder component for settings


/**
 * Main App component that wraps the application with necessary providers and routing
 */
const MainRoutingPage = () => {
  const { currentTheme } = useTheme();
  return (
        <ComparisonProvider>
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Trending />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/comparison/:id" element={<PollScreen />} />
                <Route path="/product/:itemId" element={<ProductDetails />} />
                <Route path="/dashboard" element={<UserDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ComparisonProvider>
  );
};

export default MainRoutingPage;