import SystemAlertsPanel from "@/components/SystemAlertsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const allAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    title: 'Major Traffic Congestion Detected',
    message: 'Heavy congestion at Bhubaneswar Square causing 15+ minute delays. Immediate optimization required.',
    timestamp: '2 minutes ago',
    location: 'Bhubaneswar Square Junction',
    actionRequired: true,
    category: 'Traffic',
    resolved: false
  },
  {
    id: '2', 
    type: 'warning' as const,
    title: 'Signal Timing Suboptimal',
    message: 'North-South signal at Rajmahal Square running 20% longer than AI recommendation.',
    timestamp: '8 minutes ago',
    location: 'Rajmahal Square',
    actionRequired: true,
    category: 'Signal',
    resolved: false
  },
  {
    id: '3',
    type: 'critical' as const,
    title: 'Sensor Communication Lost',
    message: 'Lost connection to traffic sensor at Patia Square. Manual monitoring required.',
    timestamp: '15 minutes ago',
    location: 'Patia Square',
    actionRequired: true,
    category: 'System',
    resolved: false
  },
  {
    id: '4',
    type: 'warning' as const,
    title: 'Peak Hour Traffic Approaching',
    message: 'Morning rush hour traffic building up. AI recommendations ready for deployment.',
    timestamp: '22 minutes ago',
    location: 'Network-wide',
    actionRequired: false,
    category: 'Traffic',
    resolved: false
  },
  {
    id: '5',
    type: 'success' as const,
    title: 'AI Optimization Applied Successfully',
    message: 'Signal timing optimization reduced average wait time by 23% at Jaydev Vihar.',
    timestamp: '1 hour ago', 
    location: 'Jaydev Vihar Junction',
    actionRequired: false,
    category: 'AI',
    resolved: true
  },
  {
    id: '6',
    type: 'success' as const,
    title: 'Congestion Resolved',
    message: 'Traffic flow normalized at Khandagiri Square after signal adjustment.',
    timestamp: '2 hours ago',
    location: 'Khandagiri Square',
    actionRequired: false,
    category: 'Traffic',
    resolved: true
  },
  {
    id: '7',
    type: 'warning' as const,
    title: 'Maintenance Schedule Reminder',
    message: 'Scheduled maintenance for signal controllers at Master Canteen intersection tomorrow 2-4 AM.',
    timestamp: '3 hours ago',
    location: 'Master Canteen',
    actionRequired: false,
    category: 'System',
    resolved: false
  }
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(allAlerts);
  const [filter, setFilter] = useState('active');
  const [category, setCategory] = useState('all');

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true }
        : alert
    ));
  };

  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setAlerts(alerts.map(a => 
        a.id === alertId 
          ? { ...a, type: 'success' as const, actionRequired: false, title: `Action taken: ${alert.title}`, resolved: true }
          : a
      ));
    }
  };

  const filterAlerts = (alertList: typeof allAlerts) => {
    let filtered = alertList;
    
    // Filter by status
    if (filter === 'active') {
      filtered = filtered.filter(alert => !alert.resolved);
    } else if (filter === 'resolved') {
      filtered = filtered.filter(alert => alert.resolved);
    } else if (filter === 'critical') {
      filtered = filtered.filter(alert => alert.type === 'critical' && !alert.resolved);
    }
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(alert => alert.category.toLowerCase() === category);
    }
    
    return filtered;
  };

  const getAlertCount = (type: string) => {
    switch (type) {
      case 'critical':
        return alerts.filter(a => a.type === 'critical' && !a.resolved).length;
      case 'warning':
        return alerts.filter(a => a.type === 'warning' && !a.resolved).length;
      case 'active':
        return alerts.filter(a => !a.resolved).length;
      case 'resolved':
        return alerts.filter(a => a.resolved).length;
      default:
        return 0;
    }
  };

  const clearAllResolved = () => {
    setAlerts(alerts.filter(alert => !alert.resolved));
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-alerts">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            System Alerts
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage traffic system alerts and notifications
          </p>
        </div>
        <Button variant="outline" onClick={clearAllResolved}>
          Clear Resolved
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-destructive">{getAlertCount('critical')}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-2">{getAlertCount('warning')}</p>
              <p className="text-sm text-muted-foreground">Warning</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-chart-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold">{getAlertCount('active')}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-3">{getAlertCount('resolved')}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <CheckCircle className="h-8 w-8 text-chart-3" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="signal">Signal</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Alerts ({getAlertCount('active')})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({getAlertCount('critical')})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({getAlertCount('resolved')})</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <SystemAlertsPanel 
            alerts={filterAlerts(alerts)}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}

          />
        </TabsContent>
        
        <TabsContent value="critical" className="space-y-4">
          <SystemAlertsPanel 
            alerts={filterAlerts(alerts)}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}

          />
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          <SystemAlertsPanel 
            alerts={filterAlerts(alerts)}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}

          />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <SystemAlertsPanel 
            alerts={filterAlerts(alerts)}
            onDismiss={handleDismissAlert}
            onTakeAction={handleTakeAction}

          />
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Activity</CardTitle>
          <CardDescription>Timeline of recent system alerts and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  alert.type === 'critical' ? 'bg-destructive' :
                  alert.type === 'warning' ? 'bg-chart-2' : 'bg-chart-3'
                }`}></div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.location}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {alert.resolved ? 'Resolved' : 'Active'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}