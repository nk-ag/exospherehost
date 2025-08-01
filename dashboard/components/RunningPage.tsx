import { RecentWorkflowsTable } from "./RecentWorkflowsTable";
import { RecentNodesTable } from "./RecentNodesTable";

export function RunningPage() {
  return <div>

    <div className="pb-6">
        <h2 className="text-2xl font-bold">Exosphere Hub</h2>
    </div>
    <div className="pb-6">
        <RecentWorkflowsTable />
       
    </div>
    <RecentNodesTable />
  </div>;
}