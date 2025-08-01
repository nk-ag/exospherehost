import { useRouter } from "next/navigation";
import { DataTable, Column } from "./ui/DataTable";
import { getStatusBadge, renderId, renderName, renderText, renderCapitalized } from "./ui/table-utils";

interface Workflow {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'failed' | 'queued';
  startTime: string;
  duration: string;
  triggeredBy: string;
}

interface RecentWorkflowsTableProps {
  workflows?: Workflow[];
}

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Data Processing Pipeline',
    status: 'completed',
    startTime: '2025-01-30 14:32',
    duration: '2m 15s',
    triggeredBy: 'scheduler'
  },
  {
    id: 'wf-002',
    name: 'User Notification System',
    status: 'running',
    startTime: '2025-01-30 14:45',
    duration: '1m 30s',
    triggeredBy: 'api'
  },
  {
    id: 'wf-003',
    name: 'Report Generation',
    status: 'failed',
    startTime: '2025-01-30 14:20',
    duration: '45s',
    triggeredBy: 'manual'
  },
  {
    id: 'wf-004',
    name: 'Database Backup',
    status: 'completed',
    startTime: '2025-01-30 13:00',
    duration: '15m 32s',
    triggeredBy: 'scheduler'
  },
  {
    id: 'wf-005',
    name: 'Email Campaign',
    status: 'queued',
    startTime: '2025-01-30 15:00',
    duration: '-',
    triggeredBy: 'api'
  },
];

export function RecentWorkflowsTable({ workflows = mockWorkflows }: RecentWorkflowsTableProps) {
  const router = useRouter();

  const handleWorkflowClick = (workflow: Workflow) => {
    router.push(`/workflows/${workflow.id}`);
  };

  const handleCreateWorkflow = () => {
    router.push('/workflows/new');
  };

  const columns: Column<Workflow>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => renderId(value)
    },
    {
      key: 'name',
      header: 'Workflow Name',
      render: (value) => renderName(value)
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
      key: 'triggeredBy',
      header: 'Triggered By',
      render: (value) => renderCapitalized(value)
    }
  ];

  return (
    <DataTable
      title="Recent Workflow Executions"
      data={workflows}
      columns={columns}
      onRowClick={handleWorkflowClick}
      emptyStateMessage="No workflows found"
      emptyStateAction={{
        label: "Create Workflow",
        onClick: handleCreateWorkflow
      }}
      className="col-span-3"
    />
  );
}