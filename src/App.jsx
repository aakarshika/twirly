// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Comparison from './pages/Comparison';
import Trending from './pages/Trending';
import Profile from './pages/Profile';
import CompanyProfile from './pages/CompanyProfile';
import Test from './pages/TestPage';
import ItemDetails from './pages/ItemDetails';
import PollScreen from './pages/PollScreen';
import ProductDetails from './pages/ProductDetails';
import PollResults from './pages/PollResults';
import UserDashboard from './pages/UserDashboard';
// Placeholder component for settings
import MainRoutingPage from './pages/MainRoutingPage';
/**
 * Main App component that wraps the application with necessary providers and routing
 */
const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <HeaderProvider>
          <MainRoutingPage />
        </HeaderProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;