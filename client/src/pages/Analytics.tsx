import AnalyticsChart from "@/components/AnalyticsChart";
import PerformanceMetricsCard from "@/components/PerformanceMetricsCard";
import { TrendingUp, Clock, Route, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const trafficVolumeData = [
  { name: 'Mon', current: 1245, previous: 1389, target: 1200 },
  { name: 'Tue', current: 1356, previous: 1456, target: 1300 },
  { name: 'Wed', current: 1189, previous: 1334, target: 1150 },
  { name: 'Thu', current: 1423, previous: 1598, target: 1400 },
  { name: 'Fri', current: 1634, previous: 1789, target: 1600 },
  { name: 'Sat', current: 987, previous: 1123, target: 950 },
  { name: 'Sun', current: 856, previous: 945, target: 800 }
];

const waitTimeData = [
  { name: 'Mon', current: 18.5, previous: 21.2, target: 17.0 },
  { name: 'Tue', current: 19.3, previous: 22.1, target: 18.0 },
  { name: 'Wed', current: 17.8, previous: 20.5, target: 16.5 },
  { name: 'Thu', current: 20.1, previous: 23.8, target: 19.0 },
  { name: 'Fri', current: 22.4, previous: 26.7, target: 21.0 },
  { name: 'Sat', current: 15.2, previous: 17.9, target: 14.0 },
  { name: 'Sun', current: 13.7, previous: 15.8, target: 12.5 }
];

const efficiencyData = [
  { name: 'Mon', current: 85.2, previous: 78.9, target: 87.0 },
  { name: 'Tue', current: 87.1, previous: 81.2, target: 88.0 },
  { name: 'Wed', current: 89.5, previous: 83.7, target: 90.0 },
  { name: 'Thu', current: 86.8, previous: 79.5, target: 87.5 },
  { name: 'Fri', current: 84.3, previous: 77.1, target: 85.0 },
  { name: 'Sat', current: 91.2, previous: 85.8, target: 92.0 },
  { name: 'Sun', current: 93.7, previous: 88.4, target: 94.0 }
];

const metrics = [
  {
    title: "Average Wait Time",
    value: "18.7 min",
    change: -12.5,
    changeLabel: "vs last week",
    description: "Significant improvement in traffic flow",
    icon: <Clock className="h-4 w-4" />,
    target: "16.5 min"
  },
  {
    title: "Traffic Flow Efficiency", 
    value: "87.3%",
    change: 15.2,
    changeLabel: "vs last month",
    description: "Optimized signal coordination",
    icon: <Route className="h-4 w-4" />,
    target: "90%"
  },
  {
    title: "Peak Hour Performance",
    value: "78.9%",
    change: 8.4,
    changeLabel: "vs last month",
    description: "Better handling of rush hour traffic",
    icon: <TrendingUp className="h-4 w-4" />,
    target: "82%"
  },
  {
    title: "Congestion Incidents",
    value: "14",
    change: -31.7,
    changeLabel: "this week", 
    description: "Fewer traffic bottlenecks",
    icon: <AlertCircle className="h-4 w-4" />
  }
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("7d");

  return (
    <div className="space-y-6 p-6" data-testid="page-analytics">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Traffic Analytics
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of traffic patterns and system performance
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <PerformanceMetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeLabel={metric.changeLabel}
            description={metric.description}
            icon={metric.icon}
            target={metric.target}
          />
        ))}
      </div>

      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList>
          <TabsTrigger value="volume">Traffic Volume</TabsTrigger>
          <TabsTrigger value="waittime">Wait Times</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>
        
        <TabsContent value="volume" className="space-y-4">
          <AnalyticsChart
            title="Daily Traffic Volume Analysis"
            data={trafficVolumeData}
            type="bar"
            timeframe="Last 7 Days"
            improvement={-11.2}
            unit=" vehicles"
          />
        </TabsContent>
        
        <TabsContent value="waittime" className="space-y-4">
          <AnalyticsChart
            title="Average Wait Time Trends"
            data={waitTimeData}
            type="line"
            timeframe="Last 7 Days"
            improvement={-12.5}
            unit=" minutes"
          />
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-4">
          <AnalyticsChart
            title="Traffic Flow Efficiency"
            data={efficiencyData}
            type="line"
            timeframe="Last 7 Days"
            improvement={8.7}
            unit="%"
          />
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated traffic analysis highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-chart-1">Traffic Flow Improvement</h4>
              <p className="text-sm text-muted-foreground">
                AI optimization has reduced average commute times by 12.5% across all monitored intersections. 
                The most significant improvements were seen during peak hours (7-9 AM and 5-7 PM).
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-chart-2">Congestion Reduction</h4>
              <p className="text-sm text-muted-foreground">
                Smart signal timing adjustments have decreased congestion incidents by 31.7% this week, 
                particularly at Bhubaneswar Square and Rajmahal Square.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-chart-3">Efficiency Gains</h4>
              <p className="text-sm text-muted-foreground">
                Network-wide traffic flow efficiency improved to 87.3%, approaching the target of 90%. 
                Weekend performance consistently exceeds targets.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Targets</CardTitle>
            <CardDescription>Progress towards quarterly objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Commute Time Reduction</span>
                <span className="text-sm text-chart-1">85% Complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-1 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Efficiency Target</span>
                <span className="text-sm text-chart-2">97% Complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-2 h-2 rounded-full" style={{ width: '97%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Incident Reduction</span>
                <span className="text-sm text-chart-3">132% Complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-3 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}