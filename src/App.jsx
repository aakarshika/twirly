// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Comparison from './pages/Comparison';
import Trending from './pages/Trending';
import Profile from './pages/Profile';
import CompanyProfile from './pages/CompanyProfile';
import Test from './pages/TestPage';
import ItemDetails from './pages/ItemDetails';
import ProductDetails from './pages/ProductDetails';
import PollResults from './pages/PollResults';

// Placeholder component for settings
const Settings = () => <div className="p-8 text-center">Settings Page</div>;

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <ComparisonProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Comparison />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/company" element={<CompanyProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test" element={<Test />} />
                <Route path="/comparison/:id" element={<ItemDetails />} />
                <Route path="/product/:itemId" element={<ProductDetails />} />
                <Route path="/pollresult/:id" element={<PollResults />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ComparisonProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;