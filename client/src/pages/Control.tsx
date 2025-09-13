import TrafficIntersectionCard from "@/components/TrafficIntersectionCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Settings, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  }
];

export default function Control() {
  const [selectedIntersection, setSelectedIntersection] = useState('1');
  const [manualControl, setManualControl] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [northSouthTiming, setNorthSouthTiming] = useState([60]);
  const [eastWestTiming, setEastWestTiming] = useState([40]);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const selectedIntersectionData = mockIntersections.find(i => i.id === selectedIntersection);

  const handleApplySettings = () => {
    setIsApplying(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsApplying(false);
      
      toast({
        title: "Signal Settings Applied",
        description: `New timing configuration applied to ${selectedIntersectionData?.name}. N-S: ${northSouthTiming[0]}s, E-W: ${eastWestTiming[0]}s`,
        className: "border-chart-1 bg-chart-1/10 text-chart-1",
      });
    }, 1000);
  };

  const handleResetToAI = () => {
    if (selectedIntersectionData) {
      setNorthSouthTiming([selectedIntersectionData.aiRecommendation.northSouth]);
      setEastWestTiming([selectedIntersectionData.aiRecommendation.eastWest]);
      
      toast({
        title: "Reset to AI Recommendations",
        description: `Signal timing reset to AI-optimized values for ${selectedIntersectionData.name}.`,
        className: "border-chart-2 bg-chart-2/10 text-chart-2",
      });
    }
  };

  const handleEmergencyMode = () => {
    const newEmergencyMode = !emergencyMode;
    setEmergencyMode(newEmergencyMode);
    
    if (newEmergencyMode) {
      // Set emergency timings
      setNorthSouthTiming([90]);
      setEastWestTiming([30]);
    } else {
      // Reset to AI recommendations
      if (selectedIntersectionData) {
        setNorthSouthTiming([selectedIntersectionData.aiRecommendation.northSouth]);
        setEastWestTiming([selectedIntersectionData.aiRecommendation.eastWest]);
      }
    }
    
    toast({
      title: newEmergencyMode ? "Emergency Mode Activated" : "Emergency Mode Deactivated",
      description: newEmergencyMode 
        ? "All intersections now prioritize emergency vehicle access with extended N-S timing."
        : "Normal traffic optimization restored.",
      variant: newEmergencyMode ? "destructive" : "default",
    });
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-control">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Signal Control
        </h1>
        <p className="text-muted-foreground">
          Manual and automated control of traffic signal timing
        </p>
      </div>

      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">Emergency Mode Active</h3>
              <p className="text-sm text-destructive/80">
                All signals are operating in emergency mode with extended north-south timing
              </p>
            </div>
            <Button variant="destructive" onClick={handleEmergencyMode}>
              Deactivate
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intersection Control</CardTitle>
              <CardDescription>
                Select an intersection and adjust signal timing parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Intersection Selection */}
              <div className="space-y-2">
                <Label>Select Intersection</Label>
                <Select value={selectedIntersection} onValueChange={setSelectedIntersection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose intersection" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIntersections.map((intersection) => (
                      <SelectItem key={intersection.id} value={intersection.id}>
                        {intersection.name} - {intersection.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIntersectionData && (
                <>
                  {/* Current Status */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge variant={
                        selectedIntersectionData.status === 'optimal' ? 'default' :
                        selectedIntersectionData.status === 'moderate' ? 'secondary' : 'destructive'
                      }>
                        {selectedIntersectionData.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Vehicle Count</Label>
                      <p className="text-lg font-semibold">{selectedIntersectionData.vehicleCount}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Avg Wait Time</Label>
                      <p className="text-lg font-semibold">{selectedIntersectionData.averageWaitTime}s</p>
                    </div>
                  </div>

                  <Tabs defaultValue="timing" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="timing">Signal Timing</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="timing" className="space-y-6">
                      {/* Control Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Control Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            {manualControl ? 'Manual control enabled' : 'AI-assisted control'}
                          </p>
                        </div>
                        <Switch
                          checked={manualControl}
                          onCheckedChange={setManualControl}
                        />
                      </div>

                      {/* Signal Timing Controls */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>North-South Signal ({northSouthTiming[0]}s)</Label>
                            <div className="text-sm text-muted-foreground">
                              Current: {selectedIntersectionData.signalTimings.northSouth}s |
                              AI Rec: {selectedIntersectionData.aiRecommendation.northSouth}s
                            </div>
                          </div>
                          <Slider
                            value={northSouthTiming}
                            onValueChange={setNorthSouthTiming}
                            max={120}
                            min={20}
                            step={5}
                            disabled={!manualControl && !emergencyMode}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>East-West Signal ({eastWestTiming[0]}s)</Label>
                            <div className="text-sm text-muted-foreground">
                              Current: {selectedIntersectionData.signalTimings.eastWest}s |
                              AI Rec: {selectedIntersectionData.aiRecommendation.eastWest}s
                            </div>
                          </div>
                          <Slider
                            value={eastWestTiming}
                            onValueChange={setEastWestTiming}
                            max={120}
                            min={20}
                            step={5}
                            disabled={!manualControl && !emergencyMode}
                          />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleApplySettings} 
                          disabled={(!manualControl && !emergencyMode) || isApplying}
                        >
                          <Play className={`h-4 w-4 mr-2 ${isApplying ? 'animate-spin' : ''}`} />
                          {isApplying ? 'Applying...' : 'Apply Settings'}
                        </Button>
                        <Button variant="outline" onClick={handleResetToAI}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to AI
                        </Button>
                        <Button 
                          variant={emergencyMode ? "destructive" : "secondary"}
                          onClick={handleEmergencyMode}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {emergencyMode ? 'Exit' : 'Emergency'} Mode
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="pedestrian">Pedestrian Crossing Time</Label>
                          <Input id="pedestrian" placeholder="15" type="number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yellow">Yellow Light Duration</Label>
                          <Input id="yellow" placeholder="3" type="number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clearance">All-Red Clearance</Label>
                          <Input id="clearance" placeholder="2" type="number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sensitivity">Sensor Sensitivity</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Medium" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Intersection Preview */}
        <div className="space-y-6">
          {selectedIntersectionData && (
            <TrafficIntersectionCard intersection={selectedIntersectionData} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Control Mode:</span>
                <span className={manualControl ? 'text-chart-2' : 'text-chart-3'}>
                  {manualControl ? 'Manual' : 'AI-Assisted'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emergency Mode:</span>
                <span className={emergencyMode ? 'text-destructive' : 'text-chart-3'}>
                  {emergencyMode ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Connected Signals:</span>
                <span className="text-chart-3">24/24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Update:</span>
                <span className="text-muted-foreground">2 minutes ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Network-wide Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Pause className="h-4 w-4 mr-2" />
                Pause All Signals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}