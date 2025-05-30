// File: src/App.jsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { BetaTestingProvider } from './contexts/BetaTestingContext';
import { LoadingProvider } from './contexts/LoadingContext';
import MainRoutingPage from './pages/MainRoutingPage';

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const App = () => {
  return (
    <LoadingProvider>
    <BrowserRouter>
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
      </BrowserRouter>
    </LoadingProvider>
  );
};

export default App;