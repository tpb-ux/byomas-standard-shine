import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

const reportMetric: ReportHandler = (metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // Send to analytics endpoint (optional)
  // You can integrate with Google Analytics, custom backend, etc.
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
};

export const initWebVitals = (): void => {
  // Core Web Vitals (Google ranking factors)
  onCLS(reportMetric);   // Cumulative Layout Shift - target: < 0.1
  onLCP(reportMetric);   // Largest Contentful Paint - target: < 2.5s
  onINP(reportMetric);   // Interaction to Next Paint - target: < 200ms

  // Additional metrics
  onFCP(reportMetric);   // First Contentful Paint - target: < 1.8s
  onTTFB(reportMetric);  // Time to First Byte - target: < 800ms
};

// Get current performance metrics
export const getPerformanceMetrics = (): PerformanceEntryList => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    return performance.getEntriesByType('navigation');
  }
  return [];
};
