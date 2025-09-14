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
    if (chartRef.current) {
      chartRef.current.setProps({
        title,
        data,
        type,
        timeframe,
        improvement,
        unit
      });
    }
  }, [title, data, type, timeframe, improvement, unit]);

  return (
    <analytics-chart
      ref={chartRef}
      id={`chart-${Math.random().toString(36).substr(2, 9)}`}
    />
  );
}