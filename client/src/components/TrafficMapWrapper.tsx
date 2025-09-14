import { useEffect, useRef } from 'react';

interface TrafficMapWrapperProps {
  intersections: any[];
  selectedIntersection: string;
  onIntersectionSelect: (id: string) => void;
}

export default function TrafficMapWrapper({
  intersections,
  selectedIntersection,
  onIntersectionSelect
}: TrafficMapWrapperProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    
    let cancelled = false;
    
    (async () => {
      await customElements.whenDefined('traffic-map');
      if (cancelled) return;
      
      if (typeof (el as any).setIntersections === 'function') {
        (el as any).setIntersections(intersections);
      } else {
        el.setAttribute('intersections', JSON.stringify(intersections));
      }
      
      if (typeof (el as any).setSelectedIntersection === 'function') {
        (el as any).setSelectedIntersection(selectedIntersection);
      } else {
        el.setAttribute('selected-intersection', selectedIntersection);
      }
    })();
    
    return () => { cancelled = true; };
  }, [intersections, selectedIntersection]);

  useEffect(() => {
    const handleIntersectionSelect = (event: any) => {
      onIntersectionSelect(event.detail.intersectionId);
    };

    const element = mapRef.current;
    if (element) {
      element.addEventListener('intersection-select', handleIntersectionSelect);
      return () => {
        element.removeEventListener('intersection-select', handleIntersectionSelect);
      };
    }
  }, [onIntersectionSelect]);

  return (
    <traffic-map ref={mapRef} />
  );
}