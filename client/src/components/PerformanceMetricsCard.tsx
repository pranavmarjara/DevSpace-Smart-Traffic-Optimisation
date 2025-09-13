import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Route, AlertCircle } from "lucide-react";

interface PerformanceMetricsCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

export default function PerformanceMetricsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  description, 
  icon,
  target 
}: PerformanceMetricsCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = title.includes('Commute Time') 
    ? (change < 0 ? 'text-chart-1' : 'text-chart-3')  // For commute time, decrease is good
    : (isPositive ? 'text-chart-1' : 'text-chart-3'); // For other metrics, increase is usually good

  return (
    <Card className="hover-elevate" data-testid={`card-metrics-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {target && (
          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-target-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            Target: {target}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`} data-testid={`text-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <Badge variant="outline" className="text-xs" data-testid={`badge-change-label-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {changeLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2" data-testid={`text-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export { Clock, Route, AlertCircle };