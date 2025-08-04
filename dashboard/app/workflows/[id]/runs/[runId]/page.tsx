'use client'

import { WorkflowRunPage } from "@/components/WorkflowRunPage";
import { FuturisticSidebar } from "@/components/FuturisticSidebar";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Settings, Play } from "lucide-react";

interface WorkflowRunPageProps {
  params: {
    id: string;
    runId: string;
  };
}

export default function WorkflowRunRoute({ params }: WorkflowRunPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/workflows/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background opacity-95 pointer-events-none"></div>
      
      {/* Sidebar */}
      <FuturisticSidebar currentPage="workflows" />
      
      {/* Main content */}
      <div className="ml-16 lg:ml-64 transition-all duration-300">
        <div className="p-6 relative z-10 w-full">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/" 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/workflows"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Workflows
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href={`/workflows/${params.id}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {params.id}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {params.runId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <WorkflowRunPage 
            runId={params.runId}
            onBack={handleBack}
          />
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