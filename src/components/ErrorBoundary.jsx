import React from 'react';
import { Card } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Error Boundary Caught Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Send to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="font-semibold">Error Details:</p>
                <pre className="mt-2 text-sm bg-gray-100 text-gray-500 p-2 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <div className="mt-2">
                    <p className="font-semibold">Component Stack:</p>
                    <pre className="mt-2 text-sm bg-gray-100 text-gray-500 p-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
