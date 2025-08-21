'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { NodeSchemaViewer } from '@/components/NodeSchemaViewer';
import { StateManager } from '@/components/StateManager';
import { GraphTemplateBuilder } from '@/components/GraphTemplateBuilder';
import { NamespaceOverview } from '@/components/NamespaceOverview';
import { StatesByRunId } from '@/components/StatesByRunId';
import { NodeDetailModal } from '@/components/NodeDetailModal';
import { GraphTemplateDetailModal } from '@/components/GraphTemplateDetailModal';
import { apiService } from '@/services/api';
import { 
  WorkflowStep, 
  NodeRegistration, 
  ResponseState, 
  UpsertGraphTemplateRequest,
  UpsertGraphTemplateResponse,
  StateStatus 
} from '@/types/state-manager';
import { 
  Settings, 
  GitBranch, 
  Database, 
  Play, 
  BarChart3,
  Zap,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'overview' | 'nodes' | 'graph' | 'states' | 'run-states'>('overview');
  const [namespace, setNamespace] = useState('testnamespace');
  const [apiKey, setApiKey] = useState('niki');
  const [runtimeName, setRuntimeName] = useState('test-runtime');
  const [graphName, setGraphName] = useState('test-graph');
  
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'register-nodes',
      title: 'Register Nodes',
      description: 'Register nodes with their input/output schemas and secrets',
      status: 'pending'
    },
    {
      id: 'create-graph',
      title: 'Create Graph Template',
      description: 'Define the workflow graph with nodes and connections',
      status: 'pending'
    },
    {
      id: 'create-states',
      title: 'Create States',
      description: 'Create execution states for the graph template',
      status: 'pending'
    },
    {
      id: 'enqueue-states',
      title: 'Enqueue States',
      description: 'Queue states for execution',
      status: 'pending'
    },
    {
      id: 'execute-states',
      title: 'Execute States',
      description: 'Execute states and handle results',
      status: 'pending'
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [registeredNodes, setRegisteredNodes] = useState<NodeRegistration[]>([]);
  const [graphTemplate, setGraphTemplate] = useState<UpsertGraphTemplateRequest | null>(null);
  const [states, setStates] = useState<ResponseState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedNode, setSelectedNode] = useState<NodeRegistration | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [selectedGraphTemplate, setSelectedGraphTemplate] = useState<UpsertGraphTemplateResponse | null>(null);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  // Sample node for demonstration
  const sampleNode: NodeRegistration = {
    name: "TestNode",
    inputs_schema: {
      type: "object",
      properties: {
        input1: { type: "string", description: "First input parameter" },
        input2: { type: "number", description: "Second input parameter" }
      },
      required: ["input1", "input2"]
    },
    outputs_schema: {
      type: "object",
      properties: {
        output1: { type: "string", description: "First output result" },
        output2: { type: "number", description: "Second output result" }
      }
    },
    secrets: ["test_secret"]
  };

  const executeWorkflowStep = async (stepIndex: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const step = workflowSteps[stepIndex];
      
      // Update step status to active
      const updatedSteps = [...workflowSteps];
      updatedSteps[stepIndex].status = 'active';
      setWorkflowSteps(updatedSteps);
      setCurrentStep(stepIndex);

      switch (step.id) {
        case 'register-nodes':
          const registerResponse = await apiService.registerNodes(
            namespace,
            {
              runtime_name: runtimeName,
              nodes: [sampleNode]
            },
            apiKey
          );
          setRegisteredNodes(registerResponse.registered_nodes);
          updatedSteps[stepIndex].data = registerResponse;
          updatedSteps[stepIndex].status = 'completed';
          break;

        case 'create-graph':
          const graphRequest: UpsertGraphTemplateRequest = {
            secrets: { test_secret: "secret_value" },
            nodes: [
              {
                node_name: "TestNode",
                namespace: namespace,
                identifier: "node1",
                inputs: { input1: "test_value", input2: 42 },
                next_nodes: ["node2"]
              },
              {
                node_name: "TestNode",
                namespace: namespace,
                identifier: "node2",
                inputs: { input1: "{{node1.output1}}", input2: "{{node1.output2}}" },
                next_nodes: []
              }
            ]
          };
          
          const graphResponse = await apiService.upsertGraphTemplate(
            namespace,
            graphName,
            graphRequest,
            apiKey
          );
          setGraphTemplate(graphRequest);
          updatedSteps[stepIndex].data = graphResponse;
          updatedSteps[stepIndex].status = 'completed';
          break;

        case 'create-states':
          // Generate a unique run ID for this execution
          const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const createResponse = await apiService.createStates(
            namespace,
            graphName,
            {
              run_id: runId,
              states: [
                {
                  identifier: "node1",
                  inputs: { input1: "test_value", input2: 42 }
                }
              ]
            },
            apiKey
          );
          setStates(createResponse.states);
          updatedSteps[stepIndex].data = createResponse;
          updatedSteps[stepIndex].status = 'completed';
          break;

        case 'enqueue-states':
          const enqueueResponse = await apiService.enqueueStates(
            namespace,
            {
              nodes: ["TestNode"],
              batch_size: 1
            },
            apiKey
          );
          updatedSteps[stepIndex].data = enqueueResponse;
          updatedSteps[stepIndex].status = 'completed';
          break;

        case 'execute-states':
          if (states.length > 0) {
            const executeResponse = await apiService.executeState(
              namespace,
              states[0].state_id,
              {
                outputs: [
                  {
                    output1: "executed_value",
                    output2: 100
                  }
                ]
              },
              apiKey
            );
            updatedSteps[stepIndex].data = executeResponse;
            updatedSteps[stepIndex].status = 'completed';
          }
          break;
      }
      
      setWorkflowSteps(updatedSteps);
      
      // Auto-advance to next step if not the last
      if (stepIndex < workflowSteps.length - 1) {
        setTimeout(() => {
          executeWorkflowStep(stepIndex + 1);
        }, 1000);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      const updatedSteps = [...workflowSteps];
      updatedSteps[stepIndex].status = 'error';
      setWorkflowSteps(updatedSteps);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteState = async (stateId: string) => {
    try {
      await apiService.executeState(
        namespace,
        stateId,
        {
          outputs: [
            {
              output1: "executed_value",
              output2: 100
            }
          ]
        },
        apiKey
      );
      
      // Refresh states
      // In a real app, you'd fetch updated states
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute state');
    }
  };

  const handleSaveGraphTemplate = async (template: UpsertGraphTemplateRequest) => {
    try {
      await apiService.upsertGraphTemplate(namespace, graphName, template, apiKey);
      setGraphTemplate(template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save graph template');
    }
  };

  // Modal handlers
  const handleOpenNodeModal = (node: NodeRegistration) => {
    setSelectedNode(node);
    setIsNodeModalOpen(true);
  };

  const handleCloseNodeModal = () => {
    setIsNodeModalOpen(false);
    setSelectedNode(null);
  };

  const handleOpenGraphModal = async (graphName: string) => {
    try {
      setIsLoading(true);
      const graphTemplate = await apiService.getGraphTemplate(namespace, graphName, apiKey);
      setSelectedGraphTemplate(graphTemplate);
      setIsGraphModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGraphModal = () => {
    setIsGraphModalOpen(false);
    setSelectedGraphTemplate(null);
  };

  const tabs = [    
    { id: 'overview', label: 'Overview', icon: BarChart3 },    
    { id: 'graph', label: 'Graph Template', icon: GitBranch },    
    { id: 'run-states', label: 'Run States', icon: Filter }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#031035] shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/exospheresmall.png" alt="Exosphere Logo" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-white">Exosphere Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">Namespace:</span>
                <input
                  type="text"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  className="px-2 py-1 text-sm text-white border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">API Key:</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="px-2 py-1 text-sm text-white border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#031035] text-[#031035]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 bg-[#031035]/10 border border-[#031035]/20 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#031035]"></div>
              <span className="ml-2 text-sm text-[#031035]">Processing...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'workflow' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Workflow Execution</h2>
              <button
                onClick={() => executeWorkflowStep(0)}
                disabled={isLoading}
                className="px-4 py-2 bg-[#031035] text-white rounded-lg hover:bg-[#0a1a4a] disabled:opacity-50"
              >
                Start Workflow
              </button>
            </div>
            <WorkflowVisualizer
              steps={workflowSteps}
              currentStep={currentStep}
              onStepClick={(stepIndex) => executeWorkflowStep(stepIndex)}
            />
          </div>
        )}

        {activeTab === 'nodes' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Nodes</h2>
            <div className="grid gap-6">
              {registeredNodes.map((node, index) => (
                <div key={index} className="cursor-pointer" onClick={() => handleOpenNodeModal(node)}>
                  <NodeSchemaViewer
                    node={node}
                    isExpanded={index === 0}
                    onToggle={() => {}}
                  />
                </div>
              ))}
              {registeredNodes.length === 0 && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Nodes Registered</h3>
                  <p className="text-sm text-gray-500">
                    Run the workflow to register nodes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Graph Template Builder</h2>
              {graphTemplate && (
                <button
                  onClick={() => handleOpenGraphModal(graphName)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Graph Template
                </button>
              )}
            </div>
            <GraphTemplateBuilder
              graphTemplate={graphTemplate || undefined}
              onSave={handleSaveGraphTemplate}
              readOnly={false}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <NamespaceOverview
            namespace={namespace}
            apiKey={apiKey}
            onOpenNode={handleOpenNodeModal}
            onOpenGraphTemplate={handleOpenGraphModal}
          />
        )}

        {activeTab === 'states' && (
          <StateManager
            states={states}
            onExecuteState={handleExecuteState}
          />
        )}

        {activeTab === 'run-states' && (
          <StatesByRunId
            namespace={namespace}
            apiKey={apiKey}
          />
        )}
      </main>

      {/* Modals */}
      <NodeDetailModal
        node={selectedNode}
        isOpen={isNodeModalOpen}
        onClose={handleCloseNodeModal}
      />
      
      <GraphTemplateDetailModal
        graphTemplate={selectedGraphTemplate}
        isOpen={isGraphModalOpen}
        onClose={handleCloseGraphModal}
      />
    </div>
  );
}
