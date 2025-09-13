import SystemAlertsPanel from '../SystemAlertsPanel';
import { useState } from 'react';

// TODO: remove mock functionality
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
    type: 'info' as const,
    title: 'Traffic Camera Maintenance Scheduled',
    message: 'Routine maintenance scheduled for Camera Unit #47 tomorrow at 2:00 AM.',
    timestamp: '1 hour ago',
    location: 'Master Canteen Junction',
    actionRequired: false
  },
  {
    id: '4',
    type: 'success' as const,
    title: 'AI Optimization Applied Successfully',
    message: 'Signal timing optimization reduced average wait time by 23% at Jaydev Vihar.',
    timestamp: '2 hours ago', 
    location: 'Jaydev Vihar Junction',
    actionRequired: false
  }
];

export default function SystemAlertsPanelExample() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      // Convert to success type after action
      setAlerts(alerts.map(a => 
        a.id === alertId 
          ? { ...a, type: 'success' as const, actionRequired: false, title: `Action taken: ${alert.title}` }
          : a
      ));
    }
  };

  return (
    <SystemAlertsPanel 
      alerts={alerts}
      onDismiss={handleDismiss}
      onTakeAction={handleAction}
    />
  );
}