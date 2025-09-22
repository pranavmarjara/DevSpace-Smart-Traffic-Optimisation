import TrafficIntersectionCard from "@/components/TrafficIntersectionCard";
import PerformanceMetricsWrapper from "@/components/PerformanceMetricsWrapper";
import TrafficMapWrapper from "@/components/TrafficMapWrapper";
import SystemAlertsPanelWrapper from "@/components/SystemAlertsPanelWrapper";
import AnalyticsChartWrapper from "@/components/AnalyticsChartWrapper";
import AnimatedTrafficGrid from "@/components/AnimatedTrafficGrid";
import { Clock, Route, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

// TODO: remove mock functionality
const mockIntersections = [
  { 
    id: '1', 
    name: 'Bhubaneswar Square', 
    location: 'Janpath & Sachivalaya Marg',
    status: 'congested' as const,
    vehicleCount: 127,
    averageWaitTime: 45,
    signalTimings: { northSouth: 60, eastWest: 40 },
    aiRecommendation: { northSouth: 75, eastWest: 50 },
    emergencyMode: false
  },
  { 
    id: '2', 
    name: 'Rajmahal Square', 
    location: 'Rajmahal Rd & Station Rd',
    status: 'moderate' as const,
    vehicleCount: 89,
    averageWaitTime: 28,
    signalTimings: { northSouth: 45, eastWest: 35 },
    aiRecommendation: { northSouth: 50, eastWest: 40 },
    emergencyMode: false
  },
  { 
    id: '3', 
    name: 'Master Canteen', 
    location: 'Forest Park & Bapuji Nagar',
    status: 'optimal' as const,
    vehicleCount: 34,
    averageWaitTime: 12,
    signalTimings: { northSouth: 30, eastWest: 25 },
    aiRecommendation: { northSouth: 30, eastWest: 25 },
    emergencyMode: false
  },
  { 
    id: '4', 
    name: 'Jaydev Vihar', 
    location: 'Jaydev Vihar Rd & NH 16',
    status: 'optimal' as const,
    vehicleCount: 45,
    averageWaitTime: 15,
    signalTimings: { northSouth: 35, eastWest: 30 },
    aiRecommendation: { northSouth: 35, eastWest: 30 },
    emergencyMode: false
  }
];

const mockAnimatedIntersections = [
  { id: '1', name: 'Bhubaneswar Square', status: 'congested' as const, signalTimings: { northSouth: 60, eastWest: 40 }, x: 0, y: 0 },
  { id: '2', name: 'Rajmahal Square', status: 'moderate' as const, signalTimings: { northSouth: 45, eastWest: 35 }, x: 1, y: 0 },
  { id: '3', name: 'Master Canteen', status: 'optimal' as const, signalTimings: { northSouth: 30, eastWest: 25 }, x: 2, y: 0 },
  { id: '4', name: 'Jaydev Vihar', status: 'optimal' as const, signalTimings: { northSouth: 35, eastWest: 30 }, x: 0, y: 1 },
  { id: '5', name: 'Patia Square', status: 'congested' as const, signalTimings: { northSouth: 70, eastWest: 45 }, x: 1, y: 1 },
  { id: '6', name: 'Khandagiri Square', status: 'moderate' as const, signalTimings: { northSouth: 40, eastWest: 30 }, x: 2, y: 1 }
];

const mockMapIntersections = [
  { id: '1', name: 'Bhubaneswar Square', x: 50, y: 30, status: 'congested' as const, vehicleCount: 127 },
  { id: '2', name: 'Rajmahal Square', x: 25, y: 50, status: 'moderate' as const, vehicleCount: 89 },
  { id: '3', name: 'Master Canteen', x: 75, y: 25, status: 'optimal' as const, vehicleCount: 34 },
  { id: '4', name: 'Jaydev Vihar', x: 30, y: 70, status: 'optimal' as const, vehicleCount: 45 },
  { id: '5', name: 'Patia Square', x: 80, y: 60, status: 'congested' as const, vehicleCount: 156 },
  { id: '6', name: 'Khandagiri Square', x: 60, y: 80, status: 'moderate' as const, vehicleCount: 67 }
];

const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    title: 'Major Traffic Congestion Detected',
    message: 'Heavy congestion at Bhubaneswar Square causing 15+ minute delays. Immediate optimization required.',
    timestamp: '2 minutes ago',
    location: 'Bhubaneswar Square Junction',
    actionRequired: true
  },
  {
    id: '2', 
    type: 'warning' as const,
    title: 'Signal Timing Suboptimal',
    message: 'North-South signal at Rajmahal Square running 20% longer than AI recommendation.',
    timestamp: '8 minutes ago',
    location: 'Rajmahal Square',
    actionRequired: true
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'AI Optimization Applied Successfully',
    message: 'Signal timing optimization reduced average wait time by 23% at Jaydev Vihar.',
    timestamp: '2 hours ago', 
    location: 'Jaydev Vihar Junction',
    actionRequired: false
  }
];

const trafficVolumeData = [
  { name: 'Mon', current: 1245, previous: 1389, target: 1200 },
  { name: 'Tue', current: 1356, previous: 1456, target: 1300 },
  { name: 'Wed', current: 1189, previous: 1334, target: 1150 },
  { name: 'Thu', current: 1423, previous: 1598, target: 1400 },
  { name: 'Fri', current: 1634, previous: 1789, target: 1600 },
  { name: 'Sat', current: 987, previous: 1123, target: 950 },
  { name: 'Sun', current: 856, previous: 945, target: 800 }
];

const mockMetrics = [
  {
    title: "Average Commute Time",
    value: "18.7 min",
    change: -12.5,
    changeLabel: "vs last week",
    description: "Target reduction of 10% achieved through AI optimization",
    icon: <Clock className="h-4 w-4" />,
    target: "16.5 min"
  },
  {
    title: "Traffic Flow Efficiency", 
    value: "87.3%",
    change: 15.2,
    changeLabel: "vs last month",
    description: "Improved signal coordination across 23 intersections",
    icon: <Route className="h-4 w-4" />,
    target: "90%"
  },
  {
    title: "Congestion Incidents",
    value: "14",
    change: -31.7,
    changeLabel: "this week", 
    description: "Significant reduction in traffic bottlenecks",
    icon: <AlertCircle className="h-4 w-4" />
  }
];

export default function Dashboard() {
  const [selectedIntersection, setSelectedIntersection] = useState<string>('1');
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setAlerts(alerts.map(a => 
        a.id === alertId 
          ? { ...a, type: 'success' as const, actionRequired: false, title: `Action taken: ${alert.title}` }
          : a
      ));
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Real-time data refresh simulation');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6" data-testid="page-dashboard">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
          Traffic Network Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Real-time monitoring and AI-powered optimization for Bhubaneswar's traffic infrastructure
        </p>
      </div>

      {/* Performance Metrics - Hybrid Web Components */}
      <div className="grid gap-4 md:grid-cols-3">
        {mockMetrics.map((metric, index) => (
          <PerformanceMetricsWrapper
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeLabel={metric.changeLabel}
            description={metric.description}
            target={metric.target}
          />
        ))}
      </div>

      {/* Animated Traffic Grid - Full width with live animations */}
      <AnimatedTrafficGrid
        intersections={mockAnimatedIntersections}
        selectedIntersection={selectedIntersection}
        onIntersectionSelect={setSelectedIntersection}
      />

      {/* System Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <SystemAlertsPanelWrapper 
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}
          />
        </div>
      </div>

      {/* Analytics Chart - Hybrid Web Component */}
      <AnalyticsChartWrapper
        title="Weekly Traffic Volume Analysis"
        data={trafficVolumeData}
        type="bar"
        timeframe="Last 7 Days"
        improvement={-12.4}
        unit=" vehicles"
      />

      {/* Intersection Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" data-testid="text-intersection-title">
          Key Intersections
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockIntersections.map((intersection) => (
            <TrafficIntersectionCard
              key={intersection.id}
              intersection={intersection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}