import { WorkflowConnection, WorkflowNode } from "./types/workflow";

interface WorkflowConnectionComponentProps {
  connection: WorkflowConnection;
  fromNode: WorkflowNode;
  toNode: WorkflowNode;
}

export function WorkflowConnectionComponent({ 
  connection, 
  fromNode, 
  toNode 
}: WorkflowConnectionComponentProps) {
  // Calculate connection points based on node positions
  const fromX = fromNode.position.x + 96; // Node width/2 + output connection point offset
  const fromY = fromNode.position.y;
  const toX = toNode.position.x - 96; // Node width/2 - input connection point offset  
  const toY = toNode.position.y;

  // Create smooth curved path
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const controlPointOffset = Math.abs(deltaX) * 0.3 + 50; // Dynamic curve based on distance
  
  const path = `M ${fromX} ${fromY} C ${fromX + controlPointOffset} ${fromY}, ${toX - controlPointOffset} ${toY}, ${toX} ${toY}`;

  return (
    <g>
      {/* Define arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="12"
          markerHeight="8"
          refX="10"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4, 0 8"
            fill="rgba(125, 211, 252, 0.8)"
            stroke="none"
          />
        </marker>
      </defs>
      
      {/* Connection shadow/glow */}
      <path
        d={path}
        stroke="rgba(125, 211, 252, 0.2)"
        strokeWidth="6"
        fill="none"
        className="blur-sm"
      />
      
      {/* Main connection line */}
      <path
        d={path}
        stroke="rgba(125, 211, 252, 0.7)"
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
        className="drop-shadow-sm"
      />
      
      {/* Data flow animation */}
      <circle
        r="4"
        fill="rgba(125, 211, 252, 0.9)"
        className="drop-shadow-sm"
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={path}
          rotate="auto"
        />
      </circle>
      
      {/* Hover interaction area (invisible but clickable) */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="cursor-pointer hover:stroke-primary/20"
        onClick={(e) => {
          e.stopPropagation();
          // Could add connection deletion or editing here
          console.log('Connection clicked:', connection.id);
        }}
      />
    </g>
  );
}