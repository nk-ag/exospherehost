'use client';

import React from 'react';
import { NodeRegistration } from '@/types/state-manager';
import { Code, Eye, EyeOff } from 'lucide-react';

interface NodeSchemaViewerProps {
  node: NodeRegistration;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const SchemaRenderer: React.FC<{ schema: any; title: string }> = ({ schema, title }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const renderSchemaProperties = (properties: any, required: string[] = []) => {
    return Object.entries(properties).map(([key, value]: [string, any]) => (
      <div key={key} className="border-l-2 border-gray-200 pl-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm font-medium text-gray-800">
              {key}
            </span>
            {required.includes(key) && (
              <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                required
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {value.type}
          </span>
        </div>
        {value.description && (
          <p className="text-xs text-gray-600 mt-1">{value.description}</p>
        )}
        {value.enum && (
          <div className="mt-1">
            <span className="text-xs text-gray-500">Values: </span>
            <span className="text-xs font-mono text-[#031035]">
              {value.enum.join(', ')}
            </span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          {title}
        </h4>
        {isExpanded ? (
          <EyeOff className="w-4 h-4 text-gray-500" />
        ) : (
          <Eye className="w-4 h-4 text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {schema.properties && (
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">Properties:</h5>
              {renderSchemaProperties(schema.properties, schema.required || [])}
            </div>
          )}
          
          {schema.type && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Type:</span> {schema.type}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const NodeSchemaViewer: React.FC<NodeSchemaViewerProps> = ({
  node,
  isExpanded = false,
  onToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div 
                    className="bg-gradient-to-r from-[#031035] to-purple-600 p-4 text-white cursor-pointer hover:from-[#0a1a4a] hover:to-purple-700 transition-all duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{node.name}</h3>
            <p className="text-[#031035]/80 text-sm">
              {node.secrets.length} secrets • {Object.keys(node.inputs_schema.properties || {}).length} inputs • {Object.keys(node.outputs_schema.properties || {}).length} outputs
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
              Node
            </div>
            <div className="text-xs text-[#031035]/80 mt-1">
              Click to view details
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Secrets */}
          {node.secrets.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Secrets:</h4>
              <div className="flex flex-wrap gap-2">
                {node.secrets.map((secret, index) => (
                  <span
                    key={index}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                  >
                    {secret}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Schema */}
          <SchemaRenderer 
            schema={node.inputs_schema} 
            title="Input Schema" 
          />
          
          {/* Output Schema */}
          <SchemaRenderer 
            schema={node.outputs_schema} 
            title="Output Schema" 
          />
        </div>
      )}
    </div>
  );
};
