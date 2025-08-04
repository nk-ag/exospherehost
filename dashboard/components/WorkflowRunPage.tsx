'use client'

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Clock, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Calendar, 
  User, 
  Settings, 
  ArrowLeft,
  Timer,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Share2
} from "lucide-react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { WorkflowNode } from "./types/workflow";

interface WorkflowRunNode extends WorkflowNode {
  executionStatus: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: string;
  error?: string;
  output?: any;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'completed' | 'running' | 'failed' | 'queued' | 'paused';
  startTime: string;
  endTime?: string;
  duration: string;
  triggeredBy: string;
  triggeredByUser?: string;
  steps: {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
  };
  error?: string;
  nodes: WorkflowRunNode[];
}

interface WorkflowRunPageProps {
  runId: string;
  onBack: () => void;
}

// Mock data for demonstration
const mockWorkflowRun: WorkflowRun = {
  id: 'run-2025-01-30-14-32',
  workflowId: 'workflow-001',
  status: 'running',
  startTime: '2025-01-30 14:32:00',
  duration: '1m 45s',
  triggeredBy: 'scheduler',
  steps: {
    total: 6,
    completed: 3,
    failed: 0,
    skipped: 0
  },
  nodes: [
    {
      id: 'node-1',
      type: 'trigger-schedule',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Daily Trigger',
        config: { schedule: '0 8 * * *' }
      },
      executionStatus: 'completed',
      startTime: '2025-01-30 14:32:00',
      endTime: '2025-01-30 14:32:05',
      duration: '5s'
    },
    {
      id: 'node-2',
      type: 'action-http',
      position: { x: 350, y: 100 },
      data: { 
        label: 'Fetch Data',
        config: { url: 'https://api.example.com/data', method: 'GET' }
      },
      executionStatus: 'completed',
      startTime: '2025-01-30 14:32:05',
      endTime: '2025-01-30 14:32:15',
      duration: '10s'
    },
    {
      id: 'node-3',
      type: 'action-transform',
      position: { x: 600, y: 100 },
      data: { 
        label: 'Process Data',
        config: { transformation: 'filter_and_sort' }
      },
      executionStatus: 'running',
      startTime: '2025-01-30 14:32:15',
      duration: '1m 30s'
    },
    {
      id: 'node-4',
      type: 'condition-if',
      position: { x: 850, y: 100 },
      data: { 
        label: 'Check Quality',
        config: { condition: 'data_quality > 0.8' }
      },
      executionStatus: 'pending'
    },
    {
      id: 'node-5',
      type: 'action-database',
      position: { x: 1200, y: 50 },
      data: { 
        label: 'Save Results',
        config: { table: 'results', operation: 'insert' }
      },
      executionStatus: 'pending'
    },
    {
      id: 'node-6',
      type: 'action-email',
      position: { x: 1200, y: 150 },
      data: { 
        label: 'Send Notification',
        config: { to: 'admin@example.com', subject: 'Workflow Complete' }
      },
      executionStatus: 'pending'
    }
  ]
};

const connections = [
  { id: 'conn-1', from: 'node-1', to: 'node-2' },
  { id: 'conn-2', from: 'node-2', to: 'node-3' },
  { id: 'conn-3', from: 'node-3', to: 'node-4' },
  { id: 'conn-4', from: 'node-4', to: 'node-5' },
  { id: 'conn-5', from: 'node-4', to: 'node-6' }
];

export function WorkflowRunPage({ runId, onBack }: WorkflowRunPageProps) {
  const [run, setRun] = useState<WorkflowRun>(mockWorkflowRun);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive || run.status !== 'running') return;

    const interval = setInterval(() => {
      setRun(prevRun => {
        const updatedNodes = prevRun.nodes.map(node => {
          if (node.executionStatus === 'running') {
            // Simulate node completion
            if (Math.random() > 0.7) {
              return {
                ...node,
                executionStatus: 'completed' as const,
                endTime: new Date().toISOString(),
                duration: '2m 15s'
              };
            }
          }
          return node;
        });

        const completedCount = updatedNodes.filter(n => n.executionStatus === 'completed').length;
        const failedCount = updatedNodes.filter(n => n.executionStatus === 'failed').length;
        const skippedCount = updatedNodes.filter(n => n.executionStatus === 'skipped').length;

        return {
          ...prevRun,
          nodes: updatedNodes,
          steps: {
            ...prevRun.steps,
            completed: completedCount,
            failed: failedCount,
            skipped: skippedCount
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, run.status]);

  const getStatusBadge = (status: WorkflowRun['status']) => {
    const variants = {
      completed: { variant: 'default' as const, className: 'bg-accent-green/20 text-accent-green border-accent-green/30', icon: CheckCircle },
      running: { variant: 'secondary' as const, className: 'bg-primary/20 text-primary border-primary/30', icon: Activity },
      failed: { variant: 'destructive' as const, className: 'bg-accent-pink/20 text-accent-pink border-accent-pink/30', icon: XCircle },
      queued: { variant: 'outline' as const, className: 'border-accent-yellow/50 text-accent-yellow', icon: Clock },
      paused: { variant: 'outline' as const, className: 'border-accent-orange/50 text-accent-orange', icon: Pause }
    } as const;
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`capitalize flex items-center gap-1 ${config.className}`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getNodeStatusBadge = (status: WorkflowRunNode['executionStatus']) => {
    const variants = {
      pending: { className: 'bg-muted text-muted-foreground', icon: Clock },
      running: { className: 'bg-primary/20 text-primary', icon: Activity },
      completed: { className: 'bg-accent-green/20 text-accent-green', icon: CheckCircle },
      failed: { className: 'bg-accent-pink/20 text-accent-pink', icon: XCircle },
      skipped: { className: 'bg-accent-yellow/20 text-accent-yellow', icon: AlertCircle }
    } as const;
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`capitalize flex items-center gap-1 ${config.className}`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const progressPercentage = (run.steps.completed / run.steps.total) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">          
          <div>
            <h1 className="text-2xl font-bold">Workflow Run Details</h1>
            <p className="text-muted-foreground">Run ID: {run.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLive ? 'animate-spin' : ''}`} />
            {isLive ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Run Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Card className="glass-card hover-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(run.status)}</div>
              </div>
              <Activity className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{run.duration}</p>
              </div>
              <Timer className="w-8 h-8 text-accent-yellow/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Triggered By</p>
                <p className="text-lg font-semibold capitalize">{run.triggeredBy}</p>
              </div>
              <Zap className="w-8 h-8 text-accent-green/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{run.steps.completed}/{run.steps.total}</p>
              </div>
              <Eye className="w-8 h-8 text-accent-pink/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card hover-accent transition-all duration-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Execution Progress</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Completed: {run.steps.completed}</span>
                <span>Failed: {run.steps.failed}</span>
                <span>Skipped: {run.steps.skipped}</span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Started: {run.startTime}</span>
              {run.endTime && <span className="text-muted-foreground">Ended: {run.endTime}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Canvas */}
      <Card className="glass-card hover-accent transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Workflow Execution Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 relative w-full">
            <DndProvider backend={HTML5Backend}>
              <WorkflowCanvas
                nodes={run.nodes}
                connections={connections}
                selectedNode={selectedNode}
                onAddNode={() => {}}
                onUpdateNode={() => {}}
                onSelectNode={setSelectedNode}
                onDeleteNode={() => {}}
                onConnect={() => {}}
              />
            </DndProvider>
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNode && (
        <Card className="glass-card hover-accent transition-all duration-300">
          <CardHeader>
            <CardTitle>Node Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const node = run.nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{node.data.label}</h4>
                    {getNodeStatusBadge(node.executionStatus)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{node.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{node.duration || 'N/A'}</p>
                    </div>
                    {node.startTime && (
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p className="font-medium">{node.startTime}</p>
                      </div>
                    )}
                    {node.endTime && (
                      <div>
                        <p className="text-muted-foreground">End Time</p>
                        <p className="font-medium">{node.endTime}</p>
                      </div>
                    )}
                  </div>
                  
                  {node.error && (
                    <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 rounded-md">
                      <p className="text-sm font-medium text-accent-pink">Error</p>
                      <p className="text-sm text-accent-pink/80">{node.error}</p>
                    </div>
                  )}
                  
                  {node.output && (
                    <div>
                      <p className="text-sm font-medium mb-2">Output</p>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                        {JSON.stringify(node.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
