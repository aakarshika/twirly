// File: src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { BetaTestingProvider } from './contexts/BetaTestingContext';
import { LoadingProvider } from './contexts/LoadingContext';
import MainRoutingPage from './pages/MainRoutingPage';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const NativeStatusBar = () => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform || Capacitor.getPlatform() === 'web') return;
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    const style = currentTheme.statusBar === 'light' ? Style.Light : Style.Dark;
    StatusBar.setStyle({ style }).catch(() => {});
  }, [currentTheme.statusBar]);

  return null;
};

const App = () => {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <NativeStatusBar />
            <HeaderProvider>
              <FeedbackProvider>
                <BetaTestingProvider>
                  <MotionConfig reducedMotion="user">
                    <MainRoutingPage />
                  </MotionConfig>
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
