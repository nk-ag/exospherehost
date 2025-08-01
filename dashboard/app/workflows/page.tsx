'use client'

import { WorkflowsPage } from "@/components/WorkflowsPage";
import { FuturisticSidebar } from "@/components/FuturisticSidebar";
import { useRouter } from "next/navigation";

export default function WorkflowsRoute() {
  const router = useRouter();

  const handleWorkflowSelect = (workflowId: string) => {
    if (workflowId === 'new') {
      router.push('/workflows/new');
    } else {
      router.push(`/workflows/${workflowId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background opacity-95 pointer-events-none"></div>
      
      {/* Sidebar */}
      <FuturisticSidebar />
      
      {/* Main content */}
      <div className="ml-16 lg:ml-64 transition-all duration-300">
        <div className="p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <WorkflowsPage onWorkflowSelect={handleWorkflowSelect} />
          </div>
        </div>
      </div>
      
      {/* Subtle accent particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
} 