import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  location?: string;
  actionRequired: boolean;
}

interface SystemAlertsPanelProps {
  alerts: SystemAlert[];
  onDismiss: (alertId: string) => void;
  onTakeAction: (alertId: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    variant: 'destructive' as const
  },
  warning: {
    icon: AlertCircle, 
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    variant: 'secondary' as const
  },
  info: {
    icon: Info,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10', 
    variant: 'outline' as const
  },
  success: {
    icon: CheckCircle,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    variant: 'default' as const
  }
};

export default function SystemAlertsPanel({ alerts, onDismiss, onTakeAction }: SystemAlertsPanelProps) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  const { toast } = useToast();

  const handleDismiss = (alertId: string, alertTitle: string) => {
    onDismiss(alertId);
    
    toast({
      title: "Alert Dismissed",
      description: `"${alertTitle}" has been dismissed and will no longer appear in active alerts.`,
      className: "border-muted bg-muted/10",
    });
  };

  const handleAction = (alertId: string, alertTitle: string) => {
    onTakeAction(alertId);
    
    toast({
      title: "Action Initiated",
      description: `Action taken for "${alertTitle}". System is processing the resolution.`,
      className: "border-chart-1 bg-chart-1/10 text-chart-1",
    });
  };

  return (
    <Card className="h-full" data-testid="card-system-alerts">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
        <div className="flex gap-2">
          {criticalAlerts > 0 && (
            <Badge variant="destructive" data-testid="badge-critical-count">
              {criticalAlerts} Critical
            </Badge>
          )}
          {warningAlerts > 0 && (
            <Badge variant="secondary" data-testid="badge-warning-count">
              {warningAlerts} Warning
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <CheckCircle className="h-12 w-12 text-chart-1 mb-4" />
              <h3 className="text-lg font-medium">All Systems Normal</h3>
              <p className="text-muted-foreground text-sm">No active alerts or issues detected</p>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {alerts.map((alert) => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg ${config.bg} border border-border`}
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm" data-testid={`text-alert-title-${alert.id}`}>
                              {alert.title}
                            </h4>
                            <Badge variant={config.variant} className="text-xs">
                              {alert.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/80" data-testid={`text-alert-message-${alert.id}`}>
                            {alert.message}
                          </p>
                          {alert.location && (
                            <p className="text-xs text-muted-foreground" data-testid={`text-alert-location-${alert.id}`}>
                              📍 {alert.location}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span data-testid={`text-alert-time-${alert.id}`}>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {alert.actionRequired && (
                          <Button 
                            size="sm" 
                            variant={config.variant}
                            onClick={() => handleAction(alert.id, alert.title)}
                            data-testid={`button-action-${alert.id}`}
                          >
                            Take Action
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDismiss(alert.id, alert.title)}
                          data-testid={`button-dismiss-${alert.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}