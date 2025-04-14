// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComparisonProvider } from '../contexts/ComparisonContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Comparison from './Comparison';
import Trending from './Trending';
import Profile from './Profile';
import CompanyProfile from './CompanyProfile';
import Test from './TestPage';
import ItemDetails from './ItemDetails';
import PollScreen from './PollScreen';
import ProductDetails from './ProductDetails';
import PollResults from './PollResults';
import UserDashboard from './UserDashboard';
import { useTheme } from '../contexts/ThemeContext';


// Placeholder component for settings

const Settings = () => <div className="p-8 text-center">Settings Page</div>;

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const MainRoutingPage = () => {
  const { currentTheme } = useTheme();
  return (
        <ComparisonProvider>
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Comparison />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/company" element={<CompanyProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test" element={<Test />} />
                <Route path="/comparison/:id" element={<PollScreen />} />
                <Route path="/product/:itemId" element={<ProductDetails />} />
                <Route path="/pollresult/:id" element={<PollResults />} />
                <Route path="/dashboard" element={<UserDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ComparisonProvider>
  );
};

export default MainRoutingPage;