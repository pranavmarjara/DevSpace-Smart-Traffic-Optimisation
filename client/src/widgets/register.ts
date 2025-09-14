// Web Components Registration
// This file registers all custom elements for the hybrid architecture

import './analytics-chart.js';
import './traffic-map.js';
import './performance-metrics.js';
import './traffic-intersection-card.js';
import './system-alerts-panel.js';

// Export types for TypeScript support
export interface AnalyticsChartElement extends HTMLElement {
  data: any[];
  title: string;
  type: 'bar' | 'line';
  timeframe: string;
  improvement: number;
  unit: string;
}

export interface TrafficMapElement extends HTMLElement {
  intersections: any[];
  selectedIntersection: string;
}

export interface PerformanceMetricsElement extends HTMLElement {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  description: string;
  target?: string;
}

export interface TrafficIntersectionCardElement extends HTMLElement {
  intersection: any;
}

export interface SystemAlertsPanelElement extends HTMLElement {
  alerts: any[];
}

// Custom element type declarations for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'analytics-chart': any;
      'traffic-map': any;
      'performance-metrics': any;
      'traffic-intersection-card': any;
      'system-alerts-panel': any;
    }
  }
}