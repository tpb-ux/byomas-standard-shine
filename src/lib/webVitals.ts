import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

type ReportHandler = (metric: Metric) => void;

// Save metric to Supabase database
const saveMetricToDatabase = async (metric: Metric): Promise<void> => {
  try {
    const connectionType = (navigator as any).connection?.effectiveType || 'unknown';
    
    await supabase.from('web_vitals_metrics').insert({
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent.substring(0, 500), // Limit length
      connection_type: connectionType,
    });
  } catch (error) {
    // Silently fail - don't break user experience for analytics
    if (import.meta.env.DEV) {
      console.error('[Web Vitals] Failed to save metric:', error);
    }
  }
};

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

  // Save to database
  saveMetricToDatabase(metric);

  // Send to analytics endpoint (optional)
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

// Metric thresholds for rating
export const METRIC_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

export const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = METRIC_THRESHOLDS[name as keyof typeof METRIC_THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};
