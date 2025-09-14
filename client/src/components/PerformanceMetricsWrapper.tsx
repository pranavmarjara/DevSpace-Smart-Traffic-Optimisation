import { useEffect, useRef } from 'react';

interface PerformanceMetricsWrapperProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  description: string;
  icon?: React.ReactNode;
  target?: string;
}

export default function PerformanceMetricsWrapper({
  title,
  value,
  change,
  changeLabel,
  description,
  target
}: PerformanceMetricsWrapperProps) {
  const metricsRef = useRef<any>(null);

  useEffect(() => {
    if (metricsRef.current) {
      metricsRef.current.setProps({
        title,
        value,
        change,
        changeLabel,
        description,
        target
      });
    }
  }, [title, value, change, changeLabel, description, target]);

  return (
    <performance-metrics
      ref={metricsRef}
    />
  );
}