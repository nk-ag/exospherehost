import { useRef, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { WorkflowNode, WorkflowConnection } from "./types/workflow";
import { WorkflowNodeComponent } from "./WorkflowNodeComponent";
import { WorkflowConnectionComponent } from "./WorkflowConnectionComponent";

interface WorkflowCanvasProps {
  nodes: (WorkflowNode & { executionStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' })[];
  connections: WorkflowConnection[];
  selectedNode: string | null;
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onSelectNode: (nodeId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
  onConnect: (from: string, to: string) => void;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNode,
  onAddNode,
  onUpdateNode,
  onSelectNode,
  onDeleteNode,
  onConnect
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'workflow-node',
    drop: (item: { nodeType: string }, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const clientOffset = monitor.getClientOffset();
        if (clientOffset) {
          const position = {
            x: clientOffset.x - canvasRect.left,
            y: clientOffset.y - canvasRect.top
          };
          onAddNode(item.nodeType, position);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectNode(null);
      setConnectingFrom(null);
    }
  }, [onSelectNode]);

  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggedNode(nodeId);
      setIsDragging(true);
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setDragOffset({
          x: e.clientX - canvasRect.left - node.position.x,
          y: e.clientY - canvasRect.top - node.position.y
        });
      }
      
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && isDragging) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const newPosition = {
          x: e.clientX - canvasRect.left - dragOffset.x,
          y: e.clientY - canvasRect.top - dragOffset.y
        };
        
        // Update node position immediately
        onUpdateNode(draggedNode, { position: newPosition });
      }
    }
  }, [draggedNode, isDragging, dragOffset, onUpdateNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    onSelectNode(nodeId);
    setConnectingFrom(null);
  }, [onSelectNode]);

  const handleStartConnection = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
    onSelectNode(null);
  }, [onSelectNode]);

  const handleCompleteConnection = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      onConnect(connectingFrom, nodeId);
      setConnectingFrom(null);
    }
  }, [connectingFrom, onConnect]);

  const handleCancelConnection = useCallback(() => {
    setConnectingFrom(null);
  }, []);

  // Combine refs for drop functionality
  const combinedRef = useCallback((node: HTMLDivElement) => {
    canvasRef.current = node;
    drop(node);
  }, [drop]);

  return (
    <div 
      ref={combinedRef}
      className={`
        relative w-full h-full bg-background/50 overflow-hidden select-none
        ${isOver ? 'bg-primary/5' : ''}
        ${isDragging ? 'cursor-grabbing' : 'cursor-default'}
      `}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(125, 211, 252, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 211, 252, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {connections.map((connection) => {
          const fromNode = nodes.find(n => n.id === connection.from);
          const toNode = nodes.find(n => n.id === connection.to);
          if (fromNode && toNode) {
            return (
              <WorkflowConnectionComponent
                key={connection.id}
                connection={connection}
                fromNode={fromNode}
                toNode={toNode}
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          isConnecting={connectingFrom !== null}
          canConnect={connectingFrom !== null && connectingFrom !== node.id}
          isDragging={draggedNode === node.id}
          onSelect={handleNodeSelect}
          onDelete={onDeleteNode}
          onDragStart={handleNodeDragStart}
          onStartConnection={handleStartConnection}
          onCompleteConnection={handleCompleteConnection}
          executionStatus={node.executionStatus}
        />
      ))}

      {/* Connection indicator line */}
      {connectingFrom && (
        <div 
          className="absolute inset-0 pointer-events-none z-30"
          onClick={handleCancelConnection}
        >
          <div className="text-center p-2 bg-primary/10 text-primary text-sm">
            Click on another node to connect, or click canvas to cancel
          </div>
        </div>
      )}

      {/* Drop zone indicator */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-primary font-medium">Drop here to add component</div>
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-lg font-medium mb-2">Start Building Your Workflow</div>
            <div className="text-sm">Drag components from the left panel to get started</div>
          </div>
        </div>
      )}
    </div>
  );
}