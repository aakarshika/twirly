import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const ErrorBoundaryTest = () => {
  // This will trigger the error boundary
  throw new Error('Test error for error boundary');
  
  return (
    <div>
      This content will never be rendered because the error is thrown before the return statement
    </div>
  );
};

const WrappedErrorBoundaryTest = () => {
  return (
    <ErrorBoundary>
      <ErrorBoundaryTest />
    </ErrorBoundary>
  );
};

export default WrappedErrorBoundaryTest; 