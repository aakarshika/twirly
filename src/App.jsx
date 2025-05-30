// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { AuthProvider } from './contexts/AuthContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { BetaTestingProvider } from './contexts/BetaTestingContext';
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
            <FeedbackProvider>
              <BetaTestingProvider>
                <MainRoutingPage />
              </BetaTestingProvider>
            </FeedbackProvider>
          </HeaderProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;