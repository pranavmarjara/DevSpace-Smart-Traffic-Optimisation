import PerformanceMetricsCard, { Clock, Route, AlertCircle } from '../PerformanceMetricsCard';

// TODO: remove mock functionality
const mockMetrics = [
  {
    title: "Average Commute Time",
    value: "18.7 min",
    change: -12.5,
    changeLabel: "vs last week",
    description: "Target reduction of 10% achieved through AI optimization",
    icon: <Clock className="h-4 w-4" />,
    target: "16.5 min"
  },
  {
    title: "Traffic Flow Efficiency", 
    value: "87.3%",
    change: 15.2,
    changeLabel: "vs last month",
    description: "Improved signal coordination across 23 intersections",
    icon: <Route className="h-4 w-4" />,
    target: "90%"
  },
  {
    title: "Congestion Incidents",
    value: "14",
    change: -31.7,
    changeLabel: "this week", 
    description: "Significant reduction in traffic bottlenecks",
    icon: <AlertCircle className="h-4 w-4" />
  }
];

export default function PerformanceMetricsCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {mockMetrics.map((metric, index) => (
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
  );
}