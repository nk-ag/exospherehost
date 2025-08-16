'use client';

import React from 'react';
import { StateStatus, ResponseState } from '@/types/state-manager';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  Ban,
  Zap,
  Database
} from 'lucide-react';

interface StateManagerProps {
  states: ResponseState[];
  onExecuteState?: (stateId: string) => void;
  onRetryState?: (stateId: string) => void;
  onCancelState?: (stateId: string) => void;
}

const getStateStatusIcon = (status: StateStatus) => {
  switch (status) {
    case StateStatus.CREATED:
      return <Clock className="w-5 h-5 text-gray-500" />;
    case StateStatus.QUEUED:
      return <Play className="w-5 h-5 text-blue-500 animate-pulse" />;
    case StateStatus.EXECUTED:
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case StateStatus.NEXT_CREATED:
      return <Zap className="w-5 h-5 text-purple-500" />;
    case StateStatus.RETRY_CREATED:
      return <RotateCcw className="w-5 h-5 text-orange-500" />;
    case StateStatus.TIMEDOUT:
      return <Clock className="w-5 h-5 text-red-500" />;
    case StateStatus.ERRORED:
      return <XCircle className="w-5 h-5 text-red-500" />;
    case StateStatus.CANCELLED:
      return <Ban className="w-5 h-5 text-gray-500" />;
    case StateStatus.SUCCESS:
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

const getStateStatusColor = (status: StateStatus) => {
  switch (status) {
    case StateStatus.CREATED:
      return 'bg-gray-100 text-gray-800';
    case StateStatus.QUEUED:
      return 'bg-blue-100 text-blue-800';
    case StateStatus.EXECUTED:
      return 'bg-green-100 text-green-800';
    case StateStatus.NEXT_CREATED:
      return 'bg-purple-100 text-purple-800';
    case StateStatus.RETRY_CREATED:
      return 'bg-orange-100 text-orange-800';
    case StateStatus.TIMEDOUT:
      return 'bg-red-100 text-red-800';
    case StateStatus.ERRORED:
      return 'bg-red-100 text-red-800';
    case StateStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800';
    case StateStatus.SUCCESS:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateStatusDescription = (status: StateStatus) => {
  switch (status) {
    case StateStatus.CREATED:
      return 'State has been created and is waiting to be processed';
    case StateStatus.QUEUED:
      return 'State is queued and waiting for execution';
    case StateStatus.EXECUTED:
      return 'State has been executed successfully';
    case StateStatus.NEXT_CREATED:
      return 'Next state has been created based on this execution';
    case StateStatus.RETRY_CREATED:
      return 'Retry state has been created due to failure';
    case StateStatus.TIMEDOUT:
      return 'State execution timed out';
    case StateStatus.ERRORED:
      return 'State execution failed with an error';
    case StateStatus.CANCELLED:
      return 'State execution was cancelled';
    case StateStatus.SUCCESS:
      return 'State completed successfully';
    default:
      return 'Unknown state status';
  }
};

export const StateManager: React.FC<StateManagerProps> = ({
  states,
  onExecuteState,
  onRetryState,
  onCancelState
}) => {
  const [expandedState, setExpandedState] = React.useState<string | null>(null);

  const canExecute = (status: StateStatus) => {
    return status === StateStatus.CREATED || status === StateStatus.QUEUED;
  };

  const canRetry = (status: StateStatus) => {
    return status === StateStatus.ERRORED || status === StateStatus.TIMEDOUT;
  };

  const canCancel = (status: StateStatus) => {
    return status === StateStatus.CREATED || status === StateStatus.QUEUED;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">State Management</h2>
      
      <div className="grid gap-4">
        {states.map((state) => (
          <div
            key={state.state_id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStateStatusIcon(state.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {state.node_name} - {state.identifier}
                    </h3>
                    <p className="text-sm text-gray-600">
                      State ID: {state.state_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(state.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateStatusColor(state.status)}`}>
                    {state.status}
                  </span>
                  
                  <div className="flex space-x-2">
                    {canExecute(state.status) && onExecuteState && (
                      <button
                        onClick={() => onExecuteState(state.state_id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Execute State"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canRetry(state.status) && onRetryState && (
                      <button
                        onClick={() => onRetryState(state.state_id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Retry State"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canCancel(state.status) && onCancelState && (
                      <button
                        onClick={() => onCancelState(state.state_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel State"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setExpandedState(expandedState === state.state_id ? null : state.state_id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Toggle Details"
                    >
                      {expandedState === state.state_id ? '−' : '+'}
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {getStateStatusDescription(state.status)}
              </p>
            </div>
            
            {expandedState === state.state_id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Inputs:</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(state.inputs, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Metadata:</h4>
                    <div className="space-y-1 text-xs">
                      <div><span className="font-medium">Graph:</span> {state.graph_name}</div>
                      <div><span className="font-medium">Node:</span> {state.node_name}</div>
                      <div><span className="font-medium">Identifier:</span> {state.identifier}</div>
                      <div><span className="font-medium">Created:</span> {new Date(state.created_at).toISOString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {states.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Database className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No States Found</h3>
          <p className="text-sm text-gray-500">
            Create states to see them appear here
          </p>
        </div>
      )}
    </div>
  );
};
