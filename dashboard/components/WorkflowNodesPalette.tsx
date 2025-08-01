import { useDrag } from 'react-dnd';
import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Webhook, Play, Globe, Mail, Database, Shuffle, GitBranch, Split, Timer, Workflow } from "lucide-react";
import { NODE_TYPES, NodeType } from "./types/workflow";

const iconMap: Record<string, any> = {
  Clock,
  Webhook, 
  Play,
  Globe,
  Mail,
  Database,
  Shuffle,
  GitBranch,
  Split,
  Timer,
  Workflow
};

interface DraggableNodeProps {
  nodeType: NodeType;
}

function DraggableNode({ nodeType }: DraggableNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'workflow-node',
    item: { nodeType: nodeType.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  const Icon = iconMap[nodeType.icon];
  const categoryColors = {
    trigger: 'border-primary/30 bg-primary/10',
    action: 'border-accent-green/30 bg-accent-green/10',
    condition: 'border-accent-pink/30 bg-accent-pink/10',
    flow: 'border-accent-yellow/30 bg-accent-yellow/10'
  };

  return (
    <div
      ref={ref}
      className={`
        p-3 rounded-lg border cursor-grab transition-all duration-200 hover-accent
        ${categoryColors[nodeType.category]}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}
      `}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${nodeType.category === 'trigger' ? 'bg-primary/20' : ''}
          ${nodeType.category === 'action' ? 'bg-accent-green/20' : ''}
          ${nodeType.category === 'condition' ? 'bg-accent-pink/20' : ''}
          ${nodeType.category === 'flow' ? 'bg-accent-yellow/20' : ''}
        `}>
          <Icon className="w-4 h-4" style={{ color: nodeType.color }} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-foreground">{nodeType.label}</div>
          <div className="text-xs text-muted-foreground">{nodeType.description}</div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowNodesPalette() {
  const categories = {
    trigger: NODE_TYPES.filter(n => n.category === 'trigger'),
    action: NODE_TYPES.filter(n => n.category === 'action'),
    condition: NODE_TYPES.filter(n => n.category === 'condition'),
    flow: NODE_TYPES.filter(n => n.category === 'flow')
  };

  const categoryLabels = {
    trigger: 'Triggers',
    action: 'Actions', 
    condition: 'Conditions',
    flow: 'Flow Control'
  };

  const categoryColors = {
    trigger: 'text-primary',
    action: 'text-accent-green',
    condition: 'text-accent-pink',
    flow: 'text-accent-yellow'
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-primary mb-2">Workflow Components</h2>
        <p className="text-sm text-muted-foreground">
          Drag components onto the canvas to build your workflow
        </p>
      </div>

      {Object.entries(categories).map(([category, nodes]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className={`font-medium ${categoryColors[category as keyof typeof categoryColors]}`}>
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <Badge variant="outline" className="text-xs">
              {nodes.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {nodes.map((nodeType) => (
              <DraggableNode key={nodeType.id} nodeType={nodeType} />
            ))}
          </div>
        </div>
      ))}

      {/* Quick tips */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Drag nodes to canvas to add them</p>
          <p>• Click nodes to select and configure</p>
          <p>• Connect nodes by dragging from outputs</p>
          <p>• Right-click for context menu</p>
        </CardContent>
      </Card>
    </div>
  );
}