import AnalyticsChart from '../AnalyticsChart';

// TODO: remove mock functionality
const trafficVolumeData = [
  { name: 'Mon', current: 1245, previous: 1389, target: 1200 },
  { name: 'Tue', current: 1356, previous: 1456, target: 1300 },
  { name: 'Wed', current: 1189, previous: 1334, target: 1150 },
  { name: 'Thu', current: 1423, previous: 1598, target: 1400 },
  { name: 'Fri', current: 1634, previous: 1789, target: 1600 },
  { name: 'Sat', current: 987, previous: 1123, target: 950 },
  { name: 'Sun', current: 856, previous: 945, target: 800 }
];

const commuteTimeData = [
  { name: '6AM', current: 12.5, previous: 15.2 },
  { name: '7AM', current: 18.7, previous: 22.1 },
  { name: '8AM', current: 24.3, previous: 28.9 },
  { name: '9AM', current: 19.1, previous: 21.8 },
  { name: '10AM', current: 14.6, previous: 16.3 },
  { name: '11AM', current: 13.2, previous: 14.7 },
  { name: '12PM', current: 15.8, previous: 17.5 }
];

export default function AnalyticsChartExample() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AnalyticsChart
        title="Weekly Traffic Volume"
        data={trafficVolumeData}
        type="bar"
        timeframe="Last 7 Days"
        improvement={-12.4}
        unit=" vehicles"
      />
      
      <AnalyticsChart
        title="Average Commute Times"
        data={commuteTimeData}
        type="line"
        timeframe="Peak Hours Today"
        improvement={-15.2}
        unit=" min"
      />
    </div>
  );
}