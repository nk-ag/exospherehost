import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Clock, Play, Pause, AlertCircle, CheckCircle, XCircle, Activity, Calendar, User, Settings, ArrowLeft } from "lucide-react";
import { DataTable, Column } from "./ui/DataTable";
import { getStatusBadge, renderId, renderText, renderCapitalized, renderSteps, renderError } from "./ui/table-utils";

interface WorkflowRun {
  id: string;
  status: 'completed' | 'running' | 'failed' | 'queued' | 'paused';
  startTime: string;
  endTime?: string;
  duration: string;
  triggeredBy: string;
  steps: {
    total: number;
    completed: number;
    failed: number;
  };
  error?: string;
}

interface WorkflowDetails {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  lastModified: string;
  createdBy: string;
  triggerType: 'schedule' | 'webhook' | 'manual';
  schedule?: string;
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  lastRun?: WorkflowRun;
}

interface WorkflowPageProps {
  workflowId?: string;
  onBack?: () => void;
}

const mockWorkflowDetails: WorkflowDetails = {
  id: 'wf-data-processing-001',
  name: 'Data Processing Pipeline',
  description: 'Automated data processing workflow that transforms raw data, applies business logic, and generates reports for analytics.',
  status: 'active',
  createdAt: '2024-12-15 09:30:00',
  lastModified: '2025-01-28 16:45:00',
  createdBy: 'john.doe@company.com',
  triggerType: 'schedule',
  schedule: '0 */6 * * *', // Every 6 hours
  totalRuns: 1247,
  successRate: 96.2,
  avgDuration: '2m 15s',
  lastRun: {
    id: 'run-2025-01-30-14-32',
    status: 'completed',
    startTime: '2025-01-30 14:32:00',
    endTime: '2025-01-30 14:34:15',
    duration: '2m 15s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  }
};

const mockRecentRuns: WorkflowRun[] = [
  {
    id: 'run-2025-01-30-14-32',
    status: 'completed',
    startTime: '2025-01-30 14:32:00',
    endTime: '2025-01-30 14:34:15',
    duration: '2m 15s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-30-08-32',
    status: 'completed',
    startTime: '2025-01-30 08:32:00',
    endTime: '2025-01-30 08:34:22',
    duration: '2m 22s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-30-02-32',
    status: 'failed',
    startTime: '2025-01-30 02:32:00',
    endTime: '2025-01-30 02:33:45',
    duration: '1m 45s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 5,
      failed: 3
    },
    error: 'Database connection timeout at step 6'
  },
  {
    id: 'run-2025-01-29-20-32',
    status: 'completed',
    startTime: '2025-01-29 20:32:00',
    endTime: '2025-01-29 20:34:18',
    duration: '2m 18s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-29-14-32',
    status: 'completed',
    startTime: '2025-01-29 14:32:00',
    endTime: '2025-01-29 14:34:12',
    duration: '2m 12s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-29-08-32',
    status: 'completed',
    startTime: '2025-01-29 08:32:00',
    endTime: '2025-01-29 08:34:25',
    duration: '2m 25s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-29-02-32',
    status: 'completed',
    startTime: '2025-01-29 02:32:00',
    endTime: '2025-01-29 02:34:20',
    duration: '2m 20s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  },
  {
    id: 'run-2025-01-28-20-32',
    status: 'completed',
    startTime: '2025-01-28 20:32:00',
    endTime: '2025-01-28 20:34:15',
    duration: '2m 15s',
    triggeredBy: 'scheduler',
    steps: {
      total: 8,
      completed: 8,
      failed: 0
    }
  }
];

export function WorkflowPage({ workflowId, onBack }: WorkflowPageProps) {

  const getWorkflowStatusBadge = (status: WorkflowDetails['status']) => {
    const variants = {
      active: { variant: 'default' as const, className: 'bg-accent-green/20 text-accent-green border-accent-green/30' },
      inactive: { variant: 'outline' as const, className: 'border-muted-foreground/50 text-muted-foreground' },
      draft: { variant: 'secondary' as const, className: 'bg-muted/20 text-muted-foreground border-muted/30' }
    } as const;
    
    const config = variants[status];
    
    return (
      <Badge variant={config.variant} className={`capitalize ${config.className}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">          
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {mockWorkflowDetails.name}
            </h1>
            <p className="text-muted-foreground">{mockWorkflowDetails.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run Now
          </Button>
        </div>
      </div>

      {/* Workflow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Workflow Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getWorkflowStatusBadge(mockWorkflowDetails.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trigger Type</span>
              <span className="capitalize text-sm">{mockWorkflowDetails.triggerType}</span>
            </div>
            {mockWorkflowDetails.schedule && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Schedule</span>
                <span className="text-sm font-mono">{mockWorkflowDetails.schedule}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created By</span>
              <span className="text-sm">{mockWorkflowDetails.createdBy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{mockWorkflowDetails.createdAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Modified</span>
              <span className="text-sm">{mockWorkflowDetails.lastModified}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Runs</span>
                <span className="text-lg font-semibold">{mockWorkflowDetails.totalRuns.toLocaleString()}</span>
              </div>
              <Progress value={mockWorkflowDetails.successRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-lg font-semibold text-accent-green">{mockWorkflowDetails.successRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Duration</span>
                <span className="text-lg font-semibold">{mockWorkflowDetails.avgDuration}</span>
              </div>
            </div>
            {mockWorkflowDetails.lastRun && (
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Run</span>
                  <span className="text-sm">{mockWorkflowDetails.lastRun.startTime}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm">{mockWorkflowDetails.lastRun.duration}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              <div className="flex-1">
                <p className="text-sm font-medium">Workflow completed successfully</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent-pink/10 rounded-lg border border-accent-pink/20">
              <XCircle className="w-4 h-4 text-accent-pink" />
              <div className="flex-1">
                <p className="text-sm font-medium">Workflow failed - Database timeout</p>
                <p className="text-xs text-muted-foreground">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Activity className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Workflow configuration updated</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs Table */}
      <DataTable
        title="Recent Workflow Runs"
        data={mockRecentRuns}
        columns={[
          {
            key: 'id',
            header: 'Run ID',
            render: (value) => renderId(value)
          },
          {
            key: 'status',
            header: 'Status',
            render: (value) => getStatusBadge(value)
          },
          {
            key: 'startTime',
            header: 'Start Time',
            render: (value) => renderText(value)
          },
          {
            key: 'duration',
            header: 'Duration',
            render: (value) => renderText(value)
          },
          {
            key: 'steps',
            header: 'Steps',
            render: (value) => renderSteps(value)
          },
          {
            key: 'triggeredBy',
            header: 'Triggered By',
            render: (value) => renderCapitalized(value)
          },
          {
            key: 'error',
            header: 'Error',
            render: (value) => renderError(value)
          }
        ]}
        onRowClick={(run) => {
          // Navigate to the specific run page
          window.location.href = `/workflows/${workflowId}/runs/${run.id}`;
        }}
      />
    </div>
  );
}
