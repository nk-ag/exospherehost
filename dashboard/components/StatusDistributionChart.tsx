import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const statusData = [
  { name: 'Completed', value: 342, color: '#6EE7B7' },
  { name: 'Running', value: 28, color: '#7DD3FC' },
  { name: 'Failed', value: 15, color: '#F472B6' },
  { name: 'Queued', value: 8, color: '#FDE047' },
  { name: 'Cancelled', value: 3, color: '#1E3A8A' },
];

export function StatusDistributionChart() {
  return (
    <Card className="glass-card hover-accent">
      <CardHeader>
        <CardTitle className="text-primary">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} workflows`, name]}
              contentStyle={{
                backgroundColor: '#2D3748',
                border: '1px solid rgba(125, 211, 252, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}