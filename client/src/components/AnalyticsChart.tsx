import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { Calendar, Download, TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  current: number;
  previous: number;
  target?: number;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'line';
  timeframe: string;
  improvement: number;
  unit?: string;
}

export default function AnalyticsChart({ title, data, type, timeframe, improvement, unit = '' }: AnalyticsChartProps) {
  const isPositiveImprovement = improvement > 0;
  const improvementColor = title.includes('Commute') || title.includes('Delays')
    ? (improvement < 0 ? 'text-chart-1' : 'text-chart-3') // For time-based metrics, decrease is good
    : (isPositiveImprovement ? 'text-chart-1' : 'text-chart-3'); // For other metrics, increase is usually good

  const handleExport = () => {
    console.log(`Exporting ${title} analytics data`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-md p-3 shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: pld.color }}
              />
              <span>{pld.dataKey === 'current' ? 'Current' : pld.dataKey === 'previous' ? 'Previous' : 'Target'}: {pld.value}{unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover-elevate" data-testid={`card-analytics-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid={`text-timeframe-${title.toLowerCase().replace(/\s+/g, '-')}`}>{timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrendingUp className={`h-4 w-4 ${improvementColor}`} />
            <span className={`text-sm font-medium ${improvementColor}`} data-testid={`text-improvement-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {improvement > 0 ? '+' : ''}{improvement}%
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            vs Previous
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleExport}
            data-testid={`button-export-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="previous" fill="hsl(var(--muted))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                {data.some(d => d.target !== undefined) && (
                  <Bar dataKey="target" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                )}
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                />
                {data.some(d => d.target !== undefined) && (
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    strokeDasharray="10 5"
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted"></div>
            <span>Previous Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary"></div>
            <span>Current Period</span>
          </div>
          {data.some(d => d.target !== undefined) && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-chart-1"></div>
              <span>Target</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}