export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    config: Record<string, any>;
  };
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

export interface NodeType {
  id: string;
  category: 'trigger' | 'action' | 'condition' | 'flow';
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const NODE_TYPES: NodeType[] = [
  // Triggers
  {
    id: 'trigger-schedule',
    category: 'trigger',
    label: 'Schedule',
    description: 'Trigger on a schedule',
    icon: 'Clock',
    color: '#7DD3FC'
  },
  {
    id: 'trigger-webhook',
    category: 'trigger',
    label: 'Webhook',
    description: 'Trigger via HTTP webhook',
    icon: 'Webhook',
    color: '#7DD3FC'
  },
  {
    id: 'trigger-manual',
    category: 'trigger',
    label: 'Manual',
    description: 'Manual trigger',
    icon: 'Play',
    color: '#7DD3FC'
  },
  
  // Actions
  {
    id: 'action-http',
    category: 'action',
    label: 'HTTP Request',
    description: 'Make HTTP API call',
    icon: 'Globe',
    color: '#6EE7B7'
  },
  {
    id: 'action-email',
    category: 'action',
    label: 'Send Email',
    description: 'Send email notification',
    icon: 'Mail',
    color: '#6EE7B7'
  },
  {
    id: 'action-database',
    category: 'action',
    label: 'Database',
    description: 'Query or update database',
    icon: 'Database',
    color: '#6EE7B7'
  },
  {
    id: 'action-transform',
    category: 'action',
    label: 'Transform',
    description: 'Transform data',
    icon: 'Shuffle',
    color: '#6EE7B7'
  },
  
  // Conditions
  {
    id: 'condition-if',
    category: 'condition',
    label: 'If Condition',
    description: 'Conditional branching',
    icon: 'GitBranch',
    color: '#F472B6'
  },
  {
    id: 'condition-switch',
    category: 'condition',
    label: 'Switch',
    description: 'Multi-way branching',
    icon: 'Split',
    color: '#F472B6'
  },
  
  // Flow control
  {
    id: 'flow-delay',
    category: 'flow',
    label: 'Delay',
    description: 'Add delay between steps',
    icon: 'Timer',
    color: '#FDE047'
  },
  {
    id: 'flow-parallel',
    category: 'flow',
    label: 'Parallel',
    description: 'Execute steps in parallel',
    icon: 'Workflow',
    color: '#FDE047'
  }
];