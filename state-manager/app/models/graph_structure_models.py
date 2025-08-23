from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime
from .db.state import StateStatusEnum

class GraphNode(BaseModel):
    """Represents a node in the graph structure"""
    id: str = Field(..., description="Unique identifier for the node (state ID)")
    node_name: str = Field(..., description="Name of the node")
    identifier: str = Field(..., description="Identifier of the node")
    status: StateStatusEnum = Field(..., description="Status of the state")
    inputs: Dict[str, Any] = Field(..., description="Inputs of the state")
    outputs: Dict[str, Any] = Field(..., description="Outputs of the state")
    error: Optional[str] = Field(None, description="Error message if any")
    created_at: datetime = Field(..., description="When the state was created")
    updated_at: datetime = Field(..., description="When the state was last updated")
    position: Optional[Dict[str, float]] = Field(None, description="Optional position for graph layout")


class GraphEdge(BaseModel):
    """Represents an edge in the graph structure"""
    id: str = Field(..., description="Unique identifier for the edge")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    source_output: Optional[str] = Field(None, description="Output key from source node")
    target_input: Optional[str] = Field(None, description="Input key in target node")


class GraphStructureResponse(BaseModel):
    """Response model for graph structure API"""
    namespace: str = Field(..., description="Namespace name")
    run_id: str = Field(..., description="Run ID")
    root_states: List[GraphNode] = Field(..., description="Roots")
    graph_name: str = Field(..., description="Graph name")
    nodes: List[GraphNode] = Field(..., description="List of nodes in the graph")
    edges: List[GraphEdge] = Field(..., description="List of edges in the graph")
    node_count: int = Field(..., description="Number of nodes")
    edge_count: int = Field(..., description="Number of edges")
    execution_summary: Dict[str, int] = Field(..., description="Summary of execution statuses")
