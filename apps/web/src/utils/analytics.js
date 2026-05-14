import * as Sentry from '@sentry/react';

// Performance metrics
const performanceMetrics = {
  appLaunch: null,
  screenTransitions: {},
  apiCalls: {},
  resourceUsage: {},
};

// Initialize performance tracking
export const initPerformanceTracking = () => {
  // Track app launch time
  performanceMetrics.appLaunch = performance.now();

  // Track memory usage if available
  if (performance.memory) {
    setInterval(() => {
      performanceMetrics.resourceUsage.memory = performance.memory.usedJSHeapSize;
    }, 60000); // Every minute
  }

  // Track API performance
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      const url = args[0];

      if (!performanceMetrics.apiCalls[url]) {
        performanceMetrics.apiCalls[url] = [];
      }
      performanceMetrics.apiCalls[url].push(duration);

      return response;
    } catch (error) {
      const duration = performance.now() - start;
      Sentry.captureException(error, {
        extra: {
          url: args[0],
          duration,
        },
      });
      throw error;
    }
  };
};

// Track screen transitions
export const trackScreenTransition = (from, to) => {
  const transitionTime = performance.now();
  performanceMetrics.screenTransitions[`${from}->${to}`] = transitionTime;

  // Log to analytics
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated from ${from} to ${to}`,
    level: 'info',
  });
};

// Track user actions
export const trackUserAction = (action, data = {}) => {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    data,
    level: 'info',
  });
};

// Track errors
export const trackError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Track performance metrics
export const trackPerformance = (metric, value) => {
  if (!performanceMetrics[metric]) {
    performanceMetrics[metric] = [];
  }
  performanceMetrics[metric].push(value);
};

// Get performance report
export const getPerformanceReport = () => {
  const report = {
    appLaunchTime: performanceMetrics.appLaunch,
    averageApiResponseTimes: {},
    screenTransitionTimes: {},
    resourceUsage: performanceMetrics.resourceUsage,
  };

  // Calculate average API response times
  Object.entries(performanceMetrics.apiCalls).forEach(([url, times]) => {
    report.averageApiResponseTimes[url] = times.reduce((a, b) => a + b, 0) / times.length;
  });

  // Calculate screen transition times
  Object.entries(performanceMetrics.screenTransitions).forEach(([transition, time]) => {
    report.screenTransitionTimes[transition] = time;
  });

  return report;
};

// Track feature usage
export const trackFeatureUsage = (feature, data = {}) => {
  Sentry.addBreadcrumb({
    category: 'feature-usage',
    message: `Feature used: ${feature}`,
    data,
    level: 'info',
  });
};

// Track user engagement
export const trackEngagement = (action, duration) => {
  Sentry.addBreadcrumb({
    category: 'engagement',
    message: action,
    data: { duration },
    level: 'info',
  });
};
