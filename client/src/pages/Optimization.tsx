import AnalyticsChart from "@/components/AnalyticsChart";
import TrafficIntersectionCard from "@/components/TrafficIntersectionCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, Brain, Target, Clock, CheckCircle, AlertCircle } from "lucide-react";
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

const optimizationData = [
  { name: 'Mon', current: 22.1, previous: 25.4, target: 20.0 },
  { name: 'Tue', current: 23.8, previous: 27.2, target: 22.0 },
  { name: 'Wed', current: 21.3, previous: 24.8, target: 19.5 },
  { name: 'Thu', current: 25.2, previous: 29.1, target: 23.0 },
  { name: 'Fri', current: 28.1, previous: 32.7, target: 26.0 },
  { name: 'Sat', current: 16.2, previous: 18.9, target: 15.0 },
  { name: 'Sun', current: 14.1, previous: 16.3, target: 13.5 }
];

const aiRecommendations = [
  {
    id: '1',
    intersection: 'Bhubaneswar Square',
    type: 'Critical',
    recommendation: 'Increase North-South timing by 25% during peak hours',
    impact: 'Reduce wait time by 18%',
    confidence: 94,
    status: 'pending' as const
  },
  {
    id: '2',
    intersection: 'Rajmahal Square',
    type: 'Optimization',
    recommendation: 'Adjust East-West signal by +5 seconds',
    impact: 'Improve flow efficiency by 12%',
    confidence: 87,
    status: 'applied' as const
  },
  {
    id: '3',
    intersection: 'Patia Square',
    type: 'Warning',
    recommendation: 'Sensor recalibration needed for accurate traffic detection',
    impact: 'Maintain optimal performance',
    confidence: 78,
    status: 'pending' as const
  }
];

export default function Optimization() {
  const [recommendations, setRecommendations] = useState(aiRecommendations);
  const [autoOptimization, setAutoOptimization] = useState(false);
  const { toast } = useToast();

  const handleApplyRecommendation = (id: string) => {
    const recommendation = recommendations.find(rec => rec.id === id);
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, status: 'applied' as const } : rec
    ));
    
    if (recommendation) {
      toast({
        title: "AI Recommendation Applied",
        description: `${recommendation.recommendation} has been implemented at ${recommendation.intersection}.`,
        className: "border-chart-1 bg-chart-1/10 text-chart-1",
      });
    }
  };

  const handleRejectRecommendation = (id: string) => {
    const recommendation = recommendations.find(rec => rec.id === id);
    setRecommendations(recommendations.filter(rec => rec.id !== id));
    
    if (recommendation) {
      toast({
        title: "Recommendation Rejected",
        description: `AI recommendation for ${recommendation.intersection} has been dismissed.`,
        variant: "destructive",
      });
    }
  };

  const handleApplyAllRecommendations = () => {
    const pendingCount = recommendations.filter(r => r.status === 'pending').length;
    setRecommendations(recommendations.map(rec => ({ ...rec, status: 'applied' as const })));
    
    toast({
      title: "All Recommendations Applied",
      description: `${pendingCount} AI recommendations have been implemented across the network.`,
      className: "border-chart-1 bg-chart-1/10 text-chart-1",
    });
  };

  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const appliedCount = recommendations.filter(r => r.status === 'applied').length;

  return (
    <div className="space-y-6 p-6" data-testid="page-optimization">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          AI Optimization
        </h1>
        <p className="text-muted-foreground">
          Machine learning-powered traffic flow optimization and recommendations
        </p>
      </div>

      {/* Optimization Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-3">{appliedCount}</p>
              <p className="text-sm text-muted-foreground">Applied Today</p>
            </div>
            <CheckCircle className="h-8 w-8 text-chart-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-2">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <Clock className="h-8 w-8 text-chart-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold">87.3%</p>
              <p className="text-sm text-muted-foreground">AI Confidence</p>
            </div>
            <Brain className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-chart-1">-14.2%</p>
              <p className="text-sm text-muted-foreground">Wait Time Reduction</p>
            </div>
            <TrendingUp className="h-8 w-8 text-chart-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>
                    Machine learning analysis and optimization suggestions
                  </CardDescription>
                </div>
                <Button onClick={handleApplyAllRecommendations} disabled={pendingCount === 0}>
                  <Zap className="h-4 w-4 mr-2" />
                  Apply All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rec.intersection}</h4>
                        <Badge variant={
                          rec.type === 'Critical' ? 'destructive' :
                          rec.type === 'Warning' ? 'secondary' : 'default'
                        }>
                          {rec.type}
                        </Badge>
                        {rec.status === 'applied' && (
                          <Badge variant="outline" className="text-chart-3">
                            Applied
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                      <p className="text-sm text-chart-1 font-medium">{rec.impact}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Confidence: {rec.confidence}%
                      </div>
                      <Progress value={rec.confidence} className="w-20" />
                    </div>
                  </div>
                  {rec.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyRecommendation(rec.id)}
                      >
                        Apply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectRecommendation(rec.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performance Impact</TabsTrigger>
              <TabsTrigger value="intersections">Intersection Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance">
              <AnalyticsChart
                title="AI Optimization Impact on Wait Times"
                data={optimizationData}
                type="line"
                timeframe="Last 7 Days"
                improvement={-14.2}
                unit=" minutes"
              />
            </TabsContent>
            
            <TabsContent value="intersections">
              <div className="grid gap-4 md:grid-cols-2">
                {mockIntersections.map((intersection) => (
                  <TrafficIntersectionCard
                    key={intersection.id}
                    intersection={intersection}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Optimization Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>Configure AI optimization parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Auto-Apply Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply high-confidence suggestions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoOptimization}
                    onChange={(e) => setAutoOptimization(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Confidence Threshold</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>85%</span>
                      <span>High Confidence</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Learning Mode</p>
                  <Badge variant="default">Active Learning</Badge>
                  <p className="text-xs text-muted-foreground">
                    AI is continuously learning from traffic patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy:</span>
                  <span className="text-chart-3">94.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Training Data:</span>
                  <span className="text-muted-foreground">10.2M samples</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated:</span>
                  <span className="text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Model Version:</span>
                  <span className="text-muted-foreground">v2.1.3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Reduce Wait Times</span>
                    <span className="text-chart-1">85% Complete</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Improve Flow Efficiency</span>
                    <span className="text-chart-2">92% Complete</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Minimize Emissions</span>
                    <span className="text-chart-3">67% Complete</span>
                  </div>
                  <Progress value={67} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}