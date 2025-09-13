import TrafficMapVisualization from '../TrafficMapVisualization';
import { useState } from 'react';

// TODO: remove mock functionality
const mockIntersections = [
  { id: '1', name: 'Bhubaneswar Square', x: 50, y: 30, status: 'congested' as const, vehicleCount: 127 },
  { id: '2', name: 'Rajmahal Square', x: 25, y: 50, status: 'moderate' as const, vehicleCount: 89 },
  { id: '3', name: 'Master Canteen', x: 75, y: 25, status: 'optimal' as const, vehicleCount: 34 },
  { id: '4', name: 'Jaydev Vihar', x: 30, y: 70, status: 'optimal' as const, vehicleCount: 45 },
  { id: '5', name: 'Patia Square', x: 80, y: 60, status: 'congested' as const, vehicleCount: 156 },
  { id: '6', name: 'Khandagiri Square', x: 60, y: 80, status: 'moderate' as const, vehicleCount: 67 }
];

export default function TrafficMapVisualizationExample() {
  const [selectedIntersection, setSelectedIntersection] = useState<string>('1');

  return (
    <TrafficMapVisualization 
      intersections={mockIntersections}
      selectedIntersection={selectedIntersection}
      onIntersectionSelect={setSelectedIntersection}
    />
  );
}