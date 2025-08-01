import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { date: '2025-01-23', successful: 45, failed: 5, total: 50 },
  { date: '2025-01-24', successful: 52, failed: 3, total: 55 },
  { date: '2025-01-25', successful: 48, failed: 7, total: 55 },
  { date: '2025-01-26', successful: 61, failed: 4, total: 65 },
  { date: '2025-01-27', successful: 58, failed: 2, total: 60 },
  { date: '2025-01-28', successful: 67, failed: 3, total: 70 },
  { date: '2025-01-29', successful: 72, failed: 8, total: 80 },
  { date: '2025-01-30', successful: 69, failed: 6, total: 75 },
];

export function WorkflowTrendsChart() {
  return (
    <Card className="col-span-2 glass-card hover-accent">
      <CardHeader>
        <CardTitle className="text-primary">Execution Trends Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 211, 252, 0.1)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#9ca3af"
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{
                backgroundColor: '#2D3748',
                border: '1px solid rgba(125, 211, 252, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#7DD3FC" 
              strokeWidth={2}
              name="Total Workflows"
              dot={{ fill: '#7DD3FC', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="successful" 
              stroke="#6EE7B7" 
              strokeWidth={2}
              name="Successful"
              dot={{ fill: '#6EE7B7', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="#F472B6" 
              strokeWidth={2}
              name="Failed"
              dot={{ fill: '#F472B6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}