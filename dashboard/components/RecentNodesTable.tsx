import { useRouter } from "next/navigation";
import { DataTable, Column } from "./ui/DataTable";
import { getFailureBadge, renderId, renderName, renderText } from "./ui/table-utils";

interface Node {
  id: string;
  name: string;
  numberOfRuns: number;
  numberOfPendingQueued: number;
  failures: number;
  namespace: string;
  createdBy: string;
  numberOfWorkflowsUsing: number;
  lastTriggeredTime: string;
}

interface RecentNodesTableProps {
  nodes?: Node[];
}

const mockNodes: Node[] = [
  {
    id: 'node-001',
    name: 'Data Processor',
    numberOfRuns: 156,
    numberOfPendingQueued: 3,
    failures: 2,
    namespace: 'data-processing',
    createdBy: 'john.doe',
    numberOfWorkflowsUsing: 8,
    lastTriggeredTime: '2025-01-30 14:32'
  },
  {
    id: 'node-002',
    name: 'Email Sender',
    numberOfRuns: 89,
    numberOfPendingQueued: 0,
    failures: 1,
    namespace: 'notifications',
    createdBy: 'jane.smith',
    numberOfWorkflowsUsing: 12,
    lastTriggeredTime: '2025-01-30 14:45'
  },
  {
    id: 'node-003',
    name: 'Report Generator',
    numberOfRuns: 234,
    numberOfPendingQueued: 5,
    failures: 8,
    namespace: 'reporting',
    createdBy: 'mike.wilson',
    numberOfWorkflowsUsing: 15,
    lastTriggeredTime: '2025-01-30 14:20'
  },
  {
    id: 'node-004',
    name: 'Database Backup',
    numberOfRuns: 67,
    numberOfPendingQueued: 1,
    failures: 0,
    namespace: 'infrastructure',
    createdBy: 'admin',
    numberOfWorkflowsUsing: 3,
    lastTriggeredTime: '2025-01-30 13:00'
  },
  {
    id: 'node-005',
    name: 'API Gateway',
    numberOfRuns: 445,
    numberOfPendingQueued: 12,
    failures: 15,
    namespace: 'api-gateway',
    createdBy: 'devops-team',
    numberOfWorkflowsUsing: 25,
    lastTriggeredTime: '2025-01-30 15:00'
  },
];

export function RecentNodesTable({ nodes = mockNodes }: RecentNodesTableProps) {
  const router = useRouter();

  const handleNodeClick = (node: Node) => {
    router.push(`/nodes/${node.id}`);
  };

  const handleCreateNode = () => {
    router.push('/nodes/new');
  };

  const columns: Column<Node>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => renderId(value)
    },
    {
      key: 'name',
      header: 'Name',
      render: (value) => renderName(value)
    },
    {
      key: 'numberOfRuns',
      header: 'Runs',
      render: (value) => renderText(value.toString())
    },
    {
      key: 'numberOfPendingQueued',
      header: 'Pending',
      render: (value) => renderText(value.toString())
    },
    {
      key: 'failures',
      header: 'Failures',
      render: (value) => getFailureBadge(value)
    },
    {
      key: 'namespace',
      header: 'Namespace',
      render: (value) => renderText(value)
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (value) => renderText(value)
    },
    {
      key: 'numberOfWorkflowsUsing',
      header: 'Workflows',
      render: (value) => renderText(value.toString())
    },
    {
      key: 'lastTriggeredTime',
      header: 'Last Triggered',
      render: (value) => renderText(value)
    }
  ];

  return (
    <DataTable
      title="Recent Nodes"
      data={nodes}
      columns={columns}
      onRowClick={handleNodeClick}
      emptyStateMessage="No nodes found"
      emptyStateAction={{
        label: "Create Node",
        onClick: handleCreateNode
      }}
      className="col-span-3"
    />
  );
} 