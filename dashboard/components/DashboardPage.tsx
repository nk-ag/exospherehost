import { MetricsCard } from "./MetricsCard";
import { WorkflowTrendsChart } from "./WorkflowTrendsChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { RecentWorkflowsTable } from "./RecentWorkflowsTable";
import { PerformanceMetricsChart } from "./PerformanceMetricsChart";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time metrics and system monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 bg-accent-green/20 text-accent-green border-accent-green/30">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            LIVE
          </Badge>
          <p className="text-sm text-muted-foreground">
            Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Workflows"
          value="1,247"
          change="+12.5% from last week"
          changeType="positive"
          description="All-time workflow executions"
        />
        <MetricsCard
          title="Success Rate"
          value="96.2%"
          change="+2.1% from yesterday"
          changeType="positive"
          description="Last 30 days"
        />
        <MetricsCard
          title="Active Workflows"
          value="28"
          change="3 more than usual"
          changeType="neutral"
          description="Currently running"
        />
        <MetricsCard
          title="Avg Execution Time"
          value="2m 15s"
          change="-15s from yesterday"
          changeType="positive"
          description="Last 24 hours"
        />
      </div>

      {/* System Health */}
      <Card className="glass-card hover-accent">
        <CardHeader>
          <CardTitle className="text-primary">System Health Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span>Orchestrator Service</span>
              <Badge variant="secondary" className="bg-accent-green/20 text-accent-green border-accent-green/30">
                OPTIMAL
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Worker Pool</span>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                8/10 ACTIVE
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Queue Depth</span>
              <Badge variant="outline" className="border-accent-pink/50 text-accent-pink">
                12 PENDING
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkflowTrendsChart />
        <StatusDistributionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceMetricsChart />
        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span className="text-primary">68%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" 
                     style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span className="text-accent-green">52%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-green to-primary h-2 rounded-full" 
                     style={{ width: '52%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Usage</span>
                <span className="text-accent-pink">34%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-pink to-primary h-2 rounded-full" 
                     style={{ width: '34%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Network I/O</span>
                <span className="text-accent-yellow">28%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-yellow to-primary h-2 rounded-full" 
                     style={{ width: '28%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workflows Table */}
      <div className="grid grid-cols-1">
        <RecentWorkflowsTable />
      </div>
    </div>
  );
}