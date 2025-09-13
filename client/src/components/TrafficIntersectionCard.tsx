import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Car, 
  Settings,
  Zap
} from "lucide-react";
import { useState } from "react";

interface TrafficIntersectionCardProps {
  intersection: {
    id: string;
    name: string;
    location: string;
    status: 'optimal' | 'moderate' | 'congested';
    vehicleCount: number;
    averageWaitTime: number;
    signalTimings: {
      northSouth: number;
      eastWest: number;
    };
    aiRecommendation: {
      northSouth: number;
      eastWest: number;
    };
    emergencyMode: boolean;
  };
}

const statusConfig = {
  optimal: {
    color: 'text-chart-1',
    bg: 'bg-chart-1',
    label: 'Optimal Flow',
    variant: 'default' as const
  },
  moderate: {
    color: 'text-chart-2',
    bg: 'bg-chart-2',
    label: 'Moderate Traffic',
    variant: 'secondary' as const
  },
  congested: {
    color: 'text-chart-3',
    bg: 'bg-chart-3',
    label: 'Heavy Congestion',
    variant: 'destructive' as const
  }
};

export default function TrafficIntersectionCard({ intersection }: TrafficIntersectionCardProps) {
  const [signalTimings, setSignalTimings] = useState(intersection.signalTimings);
  const [emergencyMode, setEmergencyMode] = useState(intersection.emergencyMode);
  const [showControls, setShowControls] = useState(false);
  
  const status = statusConfig[intersection.status];

  const handleApplyAIRecommendation = () => {
    setSignalTimings(intersection.aiRecommendation);
    console.log(`Applied AI recommendation for ${intersection.name}:`, intersection.aiRecommendation);
  };

  const handleEmergencyToggle = (checked: boolean) => {
    setEmergencyMode(checked);
    console.log(`Emergency mode ${checked ? 'enabled' : 'disabled'} for ${intersection.name}`);
  };

  const handleSignalUpdate = (direction: 'northSouth' | 'eastWest', value: number[]) => {
    const newTimings = { ...signalTimings, [direction]: value[0] };
    setSignalTimings(newTimings);
    console.log(`Updated ${direction} timing to ${value[0]}s for ${intersection.name}`);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-intersection-${intersection.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.bg}`} data-testid={`status-indicator-${intersection.id}`} />
          <CardTitle className="text-base font-semibold">{intersection.name}</CardTitle>
        </div>
        <Badge variant={status.variant} data-testid={`badge-status-${intersection.id}`}>
          {status.label}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span data-testid={`text-location-${intersection.id}`}>{intersection.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Vehicles</span>
            </div>
            <p className="text-xl font-bold" data-testid={`text-vehicle-count-${intersection.id}`}>
              {intersection.vehicleCount}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Avg Wait</span>
            </div>
            <p className="text-xl font-bold" data-testid={`text-wait-time-${intersection.id}`}>
              {intersection.averageWaitTime}s
            </p>
          </div>
        </div>

        {intersection.status === 'congested' && (
          <div className="flex items-center gap-2 p-2 bg-chart-3/10 rounded-md">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            <span className="text-sm text-chart-3 font-medium">Bottleneck detected - Apply AI optimization</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowControls(!showControls)}
            data-testid={`button-controls-${intersection.id}`}
          >
            <Settings className="h-4 w-4 mr-1" />
            {showControls ? 'Hide' : 'Controls'}
          </Button>
          
          <Button 
            size="sm" 
            variant="default"
            onClick={handleApplyAIRecommendation}
            data-testid={`button-ai-optimize-${intersection.id}`}
          >
            <Zap className="h-4 w-4 mr-1" />
            AI Optimize
          </Button>
        </div>

        {showControls && (
          <div className="space-y-4 p-3 bg-muted/30 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Emergency Override</span>
              <Switch 
                checked={emergencyMode}
                onCheckedChange={handleEmergencyToggle}
                data-testid={`switch-emergency-${intersection.id}`}
              />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">North-South Signal</span>
                  <span className="text-sm font-medium">{signalTimings.northSouth}s</span>
                </div>
                <Slider
                  value={[signalTimings.northSouth]}
                  onValueChange={(value) => handleSignalUpdate('northSouth', value)}
                  max={120}
                  min={15}
                  step={5}
                  className="w-full"
                  data-testid={`slider-north-south-${intersection.id}`}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">East-West Signal</span>
                  <span className="text-sm font-medium">{signalTimings.eastWest}s</span>
                </div>
                <Slider
                  value={[signalTimings.eastWest]}
                  onValueChange={(value) => handleSignalUpdate('eastWest', value)}
                  max={120}
                  min={15}
                  step={5}
                  className="w-full"
                  data-testid={`slider-east-west-${intersection.id}`}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}