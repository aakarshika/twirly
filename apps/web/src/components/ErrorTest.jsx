import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import * as Sentry from '@sentry/react';
import ErrorBoundaryTest from './ErrorBoundaryTest';

const ErrorTest = () => {
  const navigate = useNavigate();
  const [showErrorBoundaryTest, setShowErrorBoundaryTest] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleApiError = async () => {
    console.log('🔄 Initiating API Error Test...');
    try {
      console.log('📡 Making request to non-existent endpoint...');
      const response = await fetch('/api/nonexistent-endpoint');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ API Error Details:', {
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
      Sentry.captureException(error);
      console.log('📤 Error sent to Sentry');
      setError('API error has been triggered');
      setErrorDetails({
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
    }
  };

  const handleErrorBoundary = () => {
    console.log('🔄 Initiating Error Boundary Test...');
    console.log('📝 Setting up error boundary test component...');
    setShowErrorBoundaryTest(true);
  };

  const handleSentryError = () => {
    console.log('🔄 Initiating Sentry Error Test...');
    try {
      console.log('💥 Throwing test error for Sentry...');
      throw new Error('Sentry Test Error');
    } catch (error) {
      console.error('❌ Sentry Error Details:', {
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
      Sentry.captureException(error);
      console.log('📤 Error sent to Sentry');
      setError('Sentry error has been triggered');
      setErrorDetails({
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
    }
  };

  const handleNavigationError = () => {
    console.log('🔄 Initiating Navigation Error Test...');
    try {
      console.log('🧭 Attempting navigation to non-existent route...');
      navigate('/nonexistent-route');
    } catch (error) {
      console.error('❌ Navigation Error Details:', {
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
      setError('Navigation error has been triggered');
      setErrorDetails({
        message: error.message,
        stack: error.stack,
        type: error.name,
      });
    }
  };

  const handleUnhandledPromise = () => {
    console.log('🔄 Initiating Unhandled Promise Test...');
    console.log('⏳ Creating unhandled promise rejection...');
    Promise.reject(new Error('Unhandled Promise Rejection'));
    console.log('⚠️ Unhandled promise created - check console for rejection');
    setError('Unhandled Promise error has been triggered');
  };

  const handleMemoryLeak = () => {
    console.log('🔄 Initiating Memory Leak Test...');
    console.log('💾 Starting memory allocation...');
    setInterval(() => {
      new Array(1000000).fill('x');
      console.log('📊 Current Memory Usage:', {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      });
    }, 100);
    console.log('⚠️ Memory leak test running - check console for memory usage');
    setError('Memory Leak error has been triggered');
  };

  return (
    <div className="container mx-auto p-4 text-gray-500">
      <h1 className="text-2xl font-bold mb-4">Error Testing Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Error Tests</h2>
          <div className="space-y-2">
            <Button onClick={handleApiError} className="w-full">
              Trigger API Error
            </Button>
            <Button onClick={handleErrorBoundary} className="w-full">
              Trigger Error Boundary
            </Button>
            <Button onClick={handleSentryError} className="w-full">
              Trigger Sentry Error
            </Button>
            <Button onClick={handleNavigationError} className="w-full">
              Trigger Navigation Error
            </Button>
            <Button onClick={handleUnhandledPromise} className="w-full">
              Trigger Unhandled Promise
            </Button>
            <Button onClick={handleMemoryLeak} className="w-full">
              Trigger Memory Leak
            </Button>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Error Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-[300px] overflow-y-auto">
            <pre className="text-sm">
              {error ? (
                <div>
                  <div className="text-red-600 font-semibold mb-2">{error}</div>
                  {errorDetails && (
                    <div className="mt-2">
                      <div className="font-semibold">Error Details:</div>
                      <div className="mt-1">
                        <div><span className="font-medium">Type:</span> {errorDetails.type}</div>
                        <div><span className="font-medium">Message:</span> {errorDetails.message}</div>
                        {errorDetails.stack && (
                          <div className="mt-2">
                            <div className="font-medium">Stack Trace:</div>
                            <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto">
                              {errorDetails.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No errors triggered yet</div>
              )}
            </pre>
          </div>
        </Card>
      </div>
      {showErrorBoundaryTest && <ErrorBoundaryTest />}
    </div>
  );
};

export default ErrorTest;
