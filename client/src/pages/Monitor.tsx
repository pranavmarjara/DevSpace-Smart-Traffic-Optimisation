import TrafficIntersectionCard from "@/components/TrafficIntersectionCard";
import SystemAlertsPanel from "@/components/SystemAlertsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

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
  },
  { 
    id: '5', 
    name: 'Patia Square', 
    location: 'Patia Main Rd & College Rd',
    status: 'congested' as const,
    vehicleCount: 156,
    averageWaitTime: 52,
    signalTimings: { northSouth: 70, eastWest: 45 },
    aiRecommendation: { northSouth: 85, eastWest: 55 },
    emergencyMode: false
  },
  { 
    id: '6', 
    name: 'Khandagiri Square', 
    location: 'Khandagiri Rd & Ring Rd',
    status: 'moderate' as const,
    vehicleCount: 67,
    averageWaitTime: 22,
    signalTimings: { northSouth: 40, eastWest: 30 },
    aiRecommendation: { northSouth: 45, eastWest: 35 },
    emergencyMode: false
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    title: 'Major Traffic Congestion Detected',
    message: 'Heavy congestion at Bhubaneswar Square causing 15+ minute delays.',
    timestamp: '2 minutes ago',
    location: 'Bhubaneswar Square Junction',
    actionRequired: true
  },
  {
    id: '2', 
    type: 'warning' as const,
    title: 'Signal Timing Suboptimal',
    message: 'North-South signal at Rajmahal Square running longer than recommended.',
    timestamp: '8 minutes ago',
    location: 'Rajmahal Square',
    actionRequired: true
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'AI Optimization Applied Successfully',
    message: 'Signal timing optimization reduced wait time by 23% at Jaydev Vihar.',
    timestamp: '15 minutes ago', 
    location: 'Jaydev Vihar Junction',
    actionRequired: false
  }
];

export default function Monitor() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update timestamp every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // In a real app, this would trigger a data refresh
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-chart-3';
      case 'moderate': return 'text-chart-2';
      case 'congested': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusCount = (status: string) => {
    return mockIntersections.filter(i => i.status === status).length;
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-monitor">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Real-time Monitor
          </h1>
          <p className="text-muted-foreground">
            Live monitoring of traffic intersections and system status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-chart-3' : 'bg-muted-foreground'} animate-pulse`}></div>
            <Badge variant={isLive ? "default" : "secondary"}>
              {isLive ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-3">{getStatusCount('optimal')}</p>
              <p className="text-sm text-muted-foreground">Optimal</p>
            </div>
            <CheckCircle className="h-8 w-8 text-chart-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-2">{getStatusCount('moderate')}</p>
              <p className="text-sm text-muted-foreground">Moderate</p>
            </div>
            <Activity className="h-8 w-8 text-chart-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-destructive">{getStatusCount('congested')}</p>
              <p className="text-sm text-muted-foreground">Congested</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold">{alerts.filter(a => a.actionRequired).length}</p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Intersection Grid - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Intersection Status</CardTitle>
              <CardDescription>
                Real-time monitoring of all traffic intersections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockIntersections.map((intersection) => (
                  <TrafficIntersectionCard
                    key={intersection.id}
                    intersection={intersection}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts - Takes 1 column */}
        <div className="space-y-4">
          <SystemAlertsPanel 
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Update:</span>
                  <span className="text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Update Interval:</span>
                  <span className="text-muted-foreground">30 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connected Sensors:</span>
                  <span className="text-chart-3">24/24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>AI Processing:</span>
                  <span className="text-chart-3">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}