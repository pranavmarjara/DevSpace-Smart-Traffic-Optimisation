import { useEffect, useRef } from 'react';

interface AnalyticsChartWrapperProps {
  title: string;
  data: any[];
  type: 'bar' | 'line';
  timeframe: string;
  improvement: number;
  unit: string;
}

export default function AnalyticsChartWrapper({
  title,
  data,
  type,
  timeframe,
  improvement,
  unit
}: AnalyticsChartWrapperProps) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    
    let cancelled = false;
    
    (async () => {
      await customElements.whenDefined('analytics-chart');
      if (cancelled) return;
      
      if (typeof (el as any).setProps === 'function') {
        (el as any).setProps({ title, data, type, timeframe, improvement, unit });
      } else {
        // Fallback to attributes
        el.setAttribute('title', title);
        el.setAttribute('type', type);
        el.setAttribute('timeframe', timeframe);
        el.setAttribute('improvement', String(improvement));
        el.setAttribute('unit', unit);
        el.setAttribute('data', JSON.stringify(data));
      }
    })();
    
    return () => { cancelled = true; };
  }, [title, data, type, timeframe, improvement, unit]);

  return (
    <analytics-chart
      ref={chartRef}
      id={`chart-${Math.random().toString(36).substr(2, 9)}`}
    />
  );
}