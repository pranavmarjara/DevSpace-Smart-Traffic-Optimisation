import TrafficIntersectionCard from '../TrafficIntersectionCard';

// TODO: remove mock functionality
const mockIntersection = {
  id: '1',
  name: 'Bhubaneswar Square',
  location: 'Janpath & Sachivalaya Marg',
  status: 'congested' as const,
  vehicleCount: 127,
  averageWaitTime: 45,
  signalTimings: {
    northSouth: 60,
    eastWest: 40
  },
  aiRecommendation: {
    northSouth: 75,
    eastWest: 50
  },
  emergencyMode: false
};

export default function TrafficIntersectionCardExample() {
  return <TrafficIntersectionCard intersection={mockIntersection} />;
}