import * as Sentry from '@sentry/react';

// Performance monitoring
export const trackPerformance = (name, fn) => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'performance',
  });

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        transaction.finish();
      });
    }
    transaction.finish();
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    throw error;
  }
};

// Error tracking
export const trackError = (error, context = {}) => {
  Sentry.withScope(scope => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
};

// User action tracking
export const trackUserAction = (action, data = {}) => {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data,
  });
};

// API performance monitoring
export const trackApiCall = async (name, apiCall) => {
  const span = Sentry.startSpan({
    op: 'http.request',
    description: name,
  });

  try {
    const result = await apiCall();
    span.setStatus('ok');
    return result;
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.finish();
  }
};

// Page load performance
export const trackPageLoad = () => {
  if (window.performance) {
    const timing = window.performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

    Sentry.addBreadcrumb({
      category: 'performance',
      message: 'Page Load',
      level: 'info',
      data: {
        pageLoadTime,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
      },
    });
  }
};
