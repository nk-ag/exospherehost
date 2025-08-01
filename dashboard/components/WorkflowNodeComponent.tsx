import { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { WorkflowNode } from "./types/workflow";
import { Clock, Webhook, Play, Globe, Mail, Database, Shuffle, GitBranch, Split, Timer, Workflow, X, Circle } from "lucide-react";

const iconMap: Record<string, any> = {
  'trigger-schedule': Clock,
  'trigger-webhook': Webhook,
  'trigger-manual': Play,
  'action-http': Globe,
  'action-email': Mail,
  'action-database': Database,
  'action-transform': Shuffle,
  'condition-if': GitBranch,
  'condition-switch': Split,
  'flow-delay': Timer,
  'flow-parallel': Workflow
};

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  'trigger-schedule': { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  'trigger-webhook': { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  'trigger-manual': { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  'action-http': { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green' },
  'action-email': { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green' },
  'action-database': { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green' },
  'action-transform': { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green' },
  'condition-if': { bg: 'bg-accent-pink/10', border: 'border-accent-pink/30', text: 'text-accent-pink' },
  'condition-switch': { bg: 'bg-accent-pink/10', border: 'border-accent-pink/30', text: 'text-accent-pink' },
  'flow-delay': { bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30', text: 'text-accent-yellow' },
  'flow-parallel': { bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30', text: 'text-accent-yellow' },
};

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  isConnecting: boolean;
  canConnect: boolean;
  isDragging: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onStartConnection: (nodeId: string) => void;
  onCompleteConnection: (nodeId: string) => void;
  executionStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

export function WorkflowNodeComponent({
  node,
  isSelected,
  isConnecting,
  canConnect,
  isDragging,
  onSelect,
  onDelete,
  onDragStart,
  onStartConnection,
  onCompleteConnection,
  executionStatus
}: WorkflowNodeComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = iconMap[node.type] || Circle;
  const colors = nodeColors[node.type] || { bg: 'bg-secondary/10', border: 'border-secondary/30', text: 'text-secondary' };

  // Execution status styling
  const getExecutionStatusStyle = () => {
    if (!executionStatus) return { border: '', bg: '', animation: '' };
    
    const statusStyles: Record<string, { border: string; bg: string; animation: string }> = {
      pending: { border: 'border-muted/50', bg: 'bg-muted/20', animation: '' },
      running: { border: 'border-primary/50', bg: 'bg-primary/20', animation: 'animate-pulse' },
      completed: { border: 'border-accent-green/50', bg: 'bg-accent-green/20', animation: '' },
      failed: { border: 'border-accent-pink/50', bg: 'bg-accent-pink/20', animation: '' },
      skipped: { border: 'border-accent-yellow/50', bg: 'bg-accent-yellow/20', animation: '' }
    };
    
    return statusStyles[executionStatus];
  };

  const executionStyle = getExecutionStatusStyle();

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canConnect) {
      onCompleteConnection(node.id);
    } else if (!isConnecting) {
      onSelect(node.id);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canConnect) {
      onCompleteConnection(node.id);
    }
  };

  const handleOutputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnecting) {
      onStartConnection(node.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !canConnect && !isConnecting) { // Left mouse button only
      onDragStart(node.id, e);
    }
  };

  return (
    <div
      className="absolute z-20"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`
          w-48 transition-all duration-200 glass-card
          ${colors.bg} ${colors.border}
          ${executionStyle.border || ''} ${executionStyle.bg || ''} ${executionStyle.animation || ''}
          ${isSelected ? 'ring-2 ring-primary subtle-glow' : ''}
          ${canConnect ? 'hover:ring-2 hover:ring-accent-green hover:scale-105 cursor-pointer' : ''}
          ${isDragging ? 'scale-105 rotate-1 cursor-grabbing' : 'cursor-grab'}
          ${isHovered && !canConnect && !isDragging ? 'hover-accent hover:scale-105' : ''}
        `}
        onClick={handleNodeClick}
        onMouseDown={handleMouseDown}
      >
        {/* Input connection point */}
        <div 
          className={`
            absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors
            ${canConnect ? 'bg-accent-green/20 border-accent-green cursor-pointer hover:bg-accent-green/40' : 'bg-card border-primary cursor-pointer hover:bg-primary/20'}
          `}
          onClick={handleInputClick}
        />

        {/* Node content */}
        <div className="p-3">
                      <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg} relative`}>
                <Icon className={`w-4 h-4 ${colors.text}`} />
                {executionStatus && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    executionStatus === 'completed' ? 'bg-accent-green' :
                    executionStatus === 'running' ? 'bg-primary animate-pulse' :
                    executionStatus === 'failed' ? 'bg-accent-pink' :
                    executionStatus === 'skipped' ? 'bg-accent-yellow' :
                    'bg-muted'
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {node.data.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.type}
                </div>
              </div>
            
            {/* Delete button (shown on hover or when selected) */}
            {(isHovered || isSelected) && !isDragging && (
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 hover:bg-destructive/20 hover:text-accent-pink"
                onClick={handleDeleteClick}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Output connection point */}
        <div 
          className={`
            absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors
            ${isConnecting ? 'bg-card border-muted cursor-not-allowed' : 'bg-card border-accent-green cursor-pointer hover:bg-accent-green/20'}
          `}
          onClick={handleOutputClick}
        />

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-primary rounded-lg pointer-events-none" />
        )}

        {/* Connection indicator */}
        {canConnect && (
          <div className="absolute -inset-2 border-2 border-dashed border-accent-green rounded-lg pointer-events-none animate-pulse" />
        )}
      </Card>
    </div>
  );
}