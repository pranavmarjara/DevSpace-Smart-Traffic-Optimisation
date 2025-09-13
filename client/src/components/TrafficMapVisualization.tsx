import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useState } from "react";

interface MapIntersection {
  id: string;
  name: string;
  x: number; // Position percentage
  y: number; // Position percentage
  status: 'optimal' | 'moderate' | 'congested';
  vehicleCount: number;
}

interface TrafficMapVisualizationProps {
  intersections: MapIntersection[];
  selectedIntersection?: string;
  onIntersectionSelect: (id: string) => void;
}

const statusConfig = {
  optimal: {
    color: 'bg-chart-1',
    borderColor: 'border-chart-1',
    icon: CheckCircle,
    pulse: ''
  },
  moderate: {
    color: 'bg-chart-2',
    borderColor: 'border-chart-2', 
    icon: Clock,
    pulse: 'animate-pulse'
  },
  congested: {
    color: 'bg-chart-3',
    borderColor: 'border-chart-3',
    icon: AlertTriangle,
    pulse: 'animate-pulse'
  }
};

export default function TrafficMapVisualization({ 
  intersections, 
  selectedIntersection,
  onIntersectionSelect 
}: TrafficMapVisualizationProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  
  const congestedCount = intersections.filter(i => i.status === 'congested').length;
  const moderateCount = intersections.filter(i => i.status === 'moderate').length;
  const optimalCount = intersections.filter(i => i.status === 'optimal').length;

  const handleIntersectionClick = (intersection: MapIntersection) => {
    onIntersectionSelect(intersection.id);
    console.log(`Selected intersection: ${intersection.name} (${intersection.status})`);
  };

  const handleOptimizeAll = () => {
    console.log('Optimizing all congested intersections with AI recommendations');
  };

  return (
    <Card className="col-span-2" data-testid="card-traffic-map">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Traffic Network Overview</CardTitle>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
            data-testid="button-view-overview"
          >
            Overview
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewMode('detailed')}
            data-testid="button-view-detailed"
          >
            Detailed
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span data-testid="text-optimal-count">Optimal: {optimalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span data-testid="text-moderate-count">Moderate: {moderateCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <span data-testid="text-congested-count">Congested: {congestedCount}</span>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="relative w-full h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
          {/* City Grid Background */}
          <div className="absolute inset-4">
            {/* Horizontal Roads */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-muted/50"></div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted/50"></div>
            <div className="absolute top-3/4 left-0 right-0 h-1 bg-muted/50"></div>
            
            {/* Vertical Roads */}
            <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-muted/50"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-muted/50"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-muted/50"></div>
          </div>

          {/* Intersection Markers */}
          {intersections.map((intersection) => {
            const config = statusConfig[intersection.status];
            const isSelected = selectedIntersection === intersection.id;
            
            return (
              <div
                key={intersection.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ 
                  left: `${intersection.x}%`, 
                  top: `${intersection.y}%` 
                }}
                onClick={() => handleIntersectionClick(intersection)}
                data-testid={`marker-intersection-${intersection.id}`}
              >
                <div className={`
                  w-4 h-4 rounded-full ${config.color} ${config.pulse} border-2 
                  ${isSelected ? 'border-primary scale-125' : 'border-background'}
                  transition-all duration-200 group-hover:scale-110
                `} />
                
                {(viewMode === 'detailed' || isSelected) && (
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-popover border border-popover-border rounded-md px-2 py-1 shadow-md min-w-max">
                    <div className="text-xs font-medium">{intersection.name}</div>
                    <div className="text-xs text-muted-foreground">{intersection.vehicleCount} vehicles</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-card border rounded-md p-3 shadow-sm">
            <h4 className="text-sm font-medium mb-2">Traffic Status</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1" />
                <span>Optimal Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-2" />
                <span>Moderate Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3" />
                <span>Heavy Congestion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {congestedCount > 0 && (
          <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium">
                {congestedCount} intersection{congestedCount > 1 ? 's' : ''} require{congestedCount === 1 ? 's' : ''} immediate attention
              </span>
            </div>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleOptimizeAll}
              data-testid="button-optimize-all"
            >
              <Zap className="h-4 w-4 mr-1" />
              Optimize All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}