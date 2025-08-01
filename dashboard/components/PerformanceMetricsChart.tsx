import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const performanceData = [
  { hour: '09:00', avgExecutionTime: 120, throughput: 15 },
  { hour: '10:00', avgExecutionTime: 95, throughput: 22 },
  { hour: '11:00', avgExecutionTime: 110, throughput: 18 },
  { hour: '12:00', avgExecutionTime: 85, throughput: 25 },
  { hour: '13:00', avgExecutionTime: 92, throughput: 20 },
  { hour: '14:00', avgExecutionTime: 105, throughput: 19 },
  { hour: '15:00', avgExecutionTime: 88, throughput: 24 },
  { hour: '16:00', avgExecutionTime: 98, throughput: 21 },
];

export function PerformanceMetricsChart() {
  return (
    <Card className="col-span-2 glass-card hover-accent">
      <CardHeader>
        <CardTitle className="text-primary">Performance Analytics (Last 8 Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 211, 252, 0.1)" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis yAxisId="left" orientation="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'avgExecutionTime') return [`${value}s`, 'Avg Execution Time'];
                if (name === 'throughput') return [`${value}/hr`, 'Throughput'];
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#2D3748',
                border: '1px solid rgba(125, 211, 252, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Bar 
              yAxisId="left"
              dataKey="avgExecutionTime" 
              fill="#7DD3FC" 
              name="Avg Execution Time (s)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="throughput" 
              fill="#6EE7B7" 
              name="Throughput (workflows/hr)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}