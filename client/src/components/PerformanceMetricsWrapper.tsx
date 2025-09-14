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
    const el = metricsRef.current;
    if (!el) return;
    
    let cancelled = false;
    
    (async () => {
      await customElements.whenDefined('performance-metrics');
      if (cancelled) return;
      
      if (typeof (el as any).setProps === 'function') {
        (el as any).setProps({ title, value, change, changeLabel, description, target });
      } else {
        // Fallback to attributes
        el.setAttribute('title', title);
        el.setAttribute('value', value);
        el.setAttribute('change', String(change));
        el.setAttribute('change-label', changeLabel);
        el.setAttribute('description', description);
        if (target) el.setAttribute('target', target);
      }
    })();
    
    return () => { cancelled = true; };
  }, [title, value, change, changeLabel, description, target]);

  return (
    <performance-metrics
      ref={metricsRef}
    />
  );
}