// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
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