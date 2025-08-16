'use client';

import React from 'react';
import { WorkflowStep, StateStatus } from '@/types/state-manager';
import { CheckCircle, Circle, XCircle, Clock, Play, Database, GitBranch, Settings } from 'lucide-react';

interface WorkflowVisualizerProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const getStepIcon = (step: WorkflowStep) => {
  switch (step.status) {
    case 'completed':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'active':
      return <Play className="w-6 h-6 text-blue-500 animate-pulse" />;
    case 'error':
      return <XCircle className="w-6 h-6 text-red-500" />;
    default:
      return <Circle className="w-6 h-6 text-gray-400" />;
  }
};

const getStepTypeIcon = (stepId: string) => {
  if (stepId.includes('register')) return <Settings className="w-4 h-4" />;
  if (stepId.includes('graph')) return <GitBranch className="w-4 h-4" />;
  if (stepId.includes('state')) return <Database className="w-4 h-4" />;
  return <Circle className="w-4 h-4" />;
};

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">State Manager Workflow</h2>
      
      <div className="relative">
        {/* Connection lines */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 -z-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                onStepClick ? 'hover:scale-105' : ''
              }`}
              onClick={() => onStepClick?.(index)}
            >
              <div className={`
                bg-white rounded-lg p-6 shadow-lg border-2 transition-all duration-300
                ${step.status === 'completed' ? 'border-green-200 shadow-green-100' : ''}
                ${step.status === 'active' ? 'border-blue-200 shadow-blue-100' : ''}
                ${step.status === 'error' ? 'border-red-200 shadow-red-100' : ''}
                ${step.status === 'pending' ? 'border-gray-200' : ''}
                ${index === currentStep ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
              `}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStepTypeIcon(step.id)}
                    <span className="text-sm font-medium text-gray-600">
                      Step {index + 1}
                    </span>
                  </div>
                  {getStepIcon(step)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {step.description}
                </p>
                
                {step.data && (
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className={`
                  mt-4 text-xs font-medium px-2 py-1 rounded-full
                  ${step.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${step.status === 'active' ? 'bg-blue-100 text-blue-800' : ''}
                  ${step.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                  ${step.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                  {step.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
