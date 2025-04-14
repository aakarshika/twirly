// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { AuthProvider } from './contexts/AuthContext';
import MainRoutingPage from './pages/MainRoutingPage';

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <HeaderProvider>
            <MainRoutingPage />
          </HeaderProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;