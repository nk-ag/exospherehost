import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, Pause, Edit, Trash2, Plus, Clock, User, Calendar } from "lucide-react";
import { DataTable, Column } from "./ui/DataTable";
import { renderName, renderText, renderCapitalized } from "./ui/table-utils";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'disabled';
  trigger: 'manual' | 'scheduled' | 'event';
  lastRun: string;
  nextRun: string;
  createdBy: string;
  steps: number;
}

interface WorkflowsPageProps {
  onWorkflowSelect: (workflowId: string) => void;
}

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Data Processing Pipeline',
    description: 'Processes incoming data streams and applies transformations',
    status: 'active',
    trigger: 'scheduled',
    lastRun: '2025-01-30 14:32',
    nextRun: '2025-01-30 16:00',
    createdBy: 'admin',
    steps: 5
  },
  {
    id: 'wf-002',
    name: 'User Notification System',
    description: 'Sends notifications to users based on events',
    status: 'active',
    trigger: 'event',
    lastRun: '2025-01-30 14:45',
    nextRun: 'On demand',
    createdBy: 'dev-team',
    steps: 3
  },
  {
    id: 'wf-003',
    name: 'Report Generation',
    description: 'Generates daily performance reports',
    status: 'paused',
    trigger: 'scheduled',
    lastRun: '2025-01-29 09:00',
    nextRun: 'Paused',
    createdBy: 'analytics',
    steps: 7
  },
  {
    id: 'wf-004',
    name: 'Database Backup',
    description: 'Automated database backup and archival',
    status: 'active',
    trigger: 'scheduled',
    lastRun: '2025-01-30 02:00',
    nextRun: '2025-01-31 02:00',
    createdBy: 'ops-team',
    steps: 4
  },
  {
    id: 'wf-005',
    name: 'Email Campaign Trigger',
    description: 'Triggers email campaigns based on user behavior',
    status: 'disabled',
    trigger: 'event',
    lastRun: '2025-01-28 16:20',
    nextRun: 'Disabled',
    createdBy: 'marketing',
    steps: 6
  },
  {
    id: 'wf-006',
    name: 'Log Aggregation',
    description: 'Collects and processes system logs',
    status: 'active',
    trigger: 'scheduled',
    lastRun: '2025-01-30 14:00',
    nextRun: '2025-01-30 15:00',
    createdBy: 'monitoring',
    steps: 3
  }
];

export function WorkflowsPage({ onWorkflowSelect }: WorkflowsPageProps) {
  const getStatusBadge = (status: Workflow['status']) => {
    const variants = {
      active: { variant: 'default' as const, color: 'text-accent-green', bg: 'bg-accent-green/20', border: 'border-accent-green/30' },
      paused: { variant: 'secondary' as const, color: 'text-accent-yellow', bg: 'bg-accent-yellow/20', border: 'border-accent-yellow/30' },
      disabled: { variant: 'destructive' as const, color: 'text-accent-pink', bg: 'bg-accent-pink/20', border: 'border-accent-pink/30' }
    };
    
    const config = variants[status];
    
    return (
      <Badge 
        variant={config.variant} 
        className={`capitalize ${config.color} ${config.bg} ${config.border}`}
      >
        {status}
      </Badge>
    );
  };

  const getTriggerIcon = (trigger: Workflow['trigger']) => {
    switch (trigger) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'event': return <Play className="w-4 h-4" />;
      case 'manual': return <User className="w-4 h-4" />;
    }
  };

  const handleWorkflowClick = (workflow: Workflow) => {
    onWorkflowSelect(workflow.id);
  };

  const handleCreateWorkflow = () => {
    onWorkflowSelect('new');
  };

  const columns: Column<Workflow>[] = [
    {
      key: 'name',
      header: 'Workflow',
      render: (value, row) => (
        <div>
          <div className="font-medium text-foreground">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.description}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'trigger',
      header: 'Trigger',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getTriggerIcon(row.trigger)}
          <span className="capitalize">{row.trigger}</span>
        </div>
      )
    },
    {
      key: 'lastRun',
      header: 'Last Run',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{row.lastRun}</span>
        </div>
      )
    },
    {
      key: 'nextRun',
      header: 'Next Run',
      render: (value) => renderText(value)
    },
    {
      key: 'steps',
      header: 'Steps',
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value} steps
        </Badge>
      )
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (value) => renderText(value)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
          >
            {row.status === 'paused' ? 
              <Play className="w-3 h-3" /> : 
              <Pause className="w-3 h-3" />
            }
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
            onClick={() => onWorkflowSelect(row.id)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-accent-pink"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  const stats = {
    total: mockWorkflows.length,
    active: mockWorkflows.filter(w => w.status === 'active').length,
    paused: mockWorkflows.filter(w => w.status === 'paused').length,
    disabled: mockWorkflows.filter(w => w.status === 'disabled').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Workflow Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage and configure your workflow orchestration
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/80 text-primary-foreground subtle-glow"
          onClick={() => onWorkflowSelect('new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-green">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-yellow">{stats.paused}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-pink">{stats.disabled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <DataTable
        title="Configured Workflows"
        data={mockWorkflows}
        columns={columns}
        onRowClick={handleWorkflowClick}
        emptyStateMessage="No workflows found"
        emptyStateAction={{
          label: "Create Workflow",
          onClick: handleCreateWorkflow
        }}
      />
    </div>
  );
}