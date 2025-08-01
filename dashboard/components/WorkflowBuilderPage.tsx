import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Save, Play, Pause, Settings, Zap } from "lucide-react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { WorkflowNodesPalette } from "./WorkflowNodesPalette";
import { WorkflowNode, WorkflowConnection } from "./types/workflow";

interface WorkflowBuilderPageProps {
  workflowId: string | null;
  onBack: () => void;
}

export function WorkflowBuilderPage({ workflowId, onBack }: WorkflowBuilderPageProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const workflowName = workflowId === 'new' ? 'New Workflow' : 
    workflowId === 'wf-001' ? 'Data Processing Pipeline' :
    workflowId === 'wf-002' ? 'User Notification System' :
    workflowId === 'wf-003' ? 'Report Generation' :
    `Workflow ${workflowId}`;

  const handleAddNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: getNodeLabel(nodeType),
        config: {}
      }
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const handleConnect = useCallback((from: string, to: string) => {
    // Check if connection already exists
    const connectionExists = connections.some(conn => 
      (conn.from === from && conn.to === to) || (conn.from === to && conn.to === from)
    );
    
    if (!connectionExists && from !== to) {
      const newConnection: WorkflowConnection = {
        id: `conn-${Date.now()}`,
        from,
        to
      };
      setConnections(prev => [...prev, newConnection]);
    }
  }, [connections]);

  const handleSave = () => {
    // Save workflow logic here
    console.log('Saving workflow:', { nodes, connections });
  };

  const handleRun = () => {
    setIsRunning(!isRunning);
    // Run workflow logic here
  };

  function getNodeLabel(nodeType: string): string {
    const labels: Record<string, string> = {
      'trigger-schedule': 'Schedule Trigger',
      'trigger-webhook': 'Webhook Trigger',
      'trigger-manual': 'Manual Trigger',
      'action-http': 'HTTP Request',
      'action-email': 'Send Email',
      'action-database': 'Database Query',
      'action-transform': 'Transform Data',
      'condition-if': 'If Condition',
      'condition-switch': 'Switch',
      'flow-delay': 'Delay',
      'flow-parallel': 'Parallel Execution'
    };
    return labels[nodeType] || nodeType;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 glass-card">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-accent/20 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">{workflowName}</h1>
                <p className="text-sm text-muted-foreground">Visual workflow editor</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${isRunning ? 'bg-accent-green/20 text-accent-green border-accent-green/30' : 'bg-secondary/50'}`}
            >
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-accent/20 hover:text-primary border-primary/30"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRun}
              className={`hover:bg-accent/20 border-primary/30 ${isRunning ? 'hover:text-accent-pink' : 'hover:text-accent-green'}`}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Stop' : 'Test Run'}
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="bg-primary hover:bg-primary/80 text-primary-foreground subtle-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Node palette */}
          <div className="w-80 border-r border-border/50 glass-card overflow-y-auto">
            <WorkflowNodesPalette />
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              nodes={nodes}
              connections={connections}
              selectedNode={selectedNode}
              onAddNode={handleAddNode}
              onUpdateNode={handleUpdateNode}
              onSelectNode={setSelectedNode}
              onDeleteNode={handleDeleteNode}
              onConnect={handleConnect}
            />
          </div>

          {/* Properties panel */}
          {selectedNode && (
            <div className="w-80 border-l border-border/50 glass-card overflow-y-auto">
              <Card className="m-4 glass-card">
                <CardHeader>
                  <CardTitle className="text-primary">Node Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Node ID</label>
                      <p className="text-sm text-muted-foreground font-mono">{selectedNode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Type</label>
                      <p className="text-sm text-muted-foreground">
                        {nodes.find(n => n.id === selectedNode)?.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Label</label>
                      <p className="text-sm text-muted-foreground">
                        {nodes.find(n => n.id === selectedNode)?.data.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Position</label>
                      <div className="text-sm text-muted-foreground">
                        x: {nodes.find(n => n.id === selectedNode)?.position.x?.toFixed(0)}, 
                        y: {nodes.find(n => n.id === selectedNode)?.position.y?.toFixed(0)}
                      </div>
                    </div>
                    {/* Additional configuration options would go here */}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}