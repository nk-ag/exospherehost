# Run ID Feature Guide

## Overview

I've implemented a comprehensive run ID system for the State Manager that allows tracking and grouping states by their execution runs. This feature enables better organization, debugging, and monitoring of graph executions.

## Key Features

### 1. **Run ID Persistence**
- Every state now includes a `run_id` field
- Run IDs are generated automatically when creating states
- All states in a single graph execution share the same run ID
- Run IDs persist through the entire state lifecycle

### 2. **New API Endpoints**
- **GET `/v0/namespace/{namespace}/states/`** - Fetch all current states
- **GET `/v0/namespace/{namespace}/states/run/{run_id}`** - Fetch states by run ID

### 3. **Enhanced Frontend**
- New "Run States" tab for viewing states grouped by run ID
- Run ID selector with state counts
- Detailed state information display
- Summary statistics

## Backend Implementation

### Database Schema Changes

#### Updated State Model (`state-manager/app/models/db/state.py`)
```python
class State(BaseDatabaseModel):
    # ... existing fields ...
    run_id: str = Field(..., description="Unique run ID for grouping states from the same graph execution")
    # ... rest of fields ...
```

#### Updated Request Models (`state-manager/app/models/create_models.py`)
```python
class CreateRequestModel(BaseModel):
    run_id: str = Field(..., description="Unique run ID for grouping states from the same graph execution")
    states: list[RequestStateModel] = Field(..., description="List of states")

class ResponseStateModel(BaseModel):
    # ... existing fields ...
    run_id: str = Field(..., description="Unique run ID for grouping states from the same graph execution")
    # ... rest of fields ...
```

### New Controllers

#### 1. `get_current_states.py`
```python
async def get_current_states(namespace: str, request_id: str) -> List[State]:
    """Get all current states in a namespace"""
    states = await State.find(State.namespace_name == namespace).to_list()
    return states
```

#### 2. `get_states_by_run_id.py`
```python
async def get_states_by_run_id(namespace: str, run_id: str, request_id: str) -> List[State]:
    """Get all states for a given run ID in a namespace"""
    states = await State.find(
        State.run_id == run_id,
        State.namespace_name == namespace
    ).to_list()
    return states
```

### New Response Models (`state-manager/app/models/state_list_models.py`)

```python
class StateListItem(BaseModel):
    """Model for a single state in a list"""
    id: str
    node_name: str
    namespace_name: str
    identifier: str
    graph_name: str
    run_id: str
    status: StateStatusEnum
    inputs: dict[str, Any]
    outputs: dict[str, Any]
    error: Optional[str]
    parents: dict[str, str]
    created_at: datetime
    updated_at: datetime

class StatesByRunIdResponse(BaseModel):
    """Response model for fetching states by run ID"""
    namespace: str
    run_id: str
    count: int
    states: List[StateListItem]

class CurrentStatesResponse(BaseModel):
    """Response model for fetching current states"""
    namespace: str
    count: int
    states: List[StateListItem]
    run_ids: List[str]  # List of unique run IDs
```

### New API Routes

#### 1. Get Current States
```python
@router.get("/states/", response_model=CurrentStatesResponse)
async def get_current_states_route(namespace_name: str, request: Request, api_key: str = Depends(check_api_key)):
    # Returns all states in namespace with unique run IDs list
```

#### 2. Get States by Run ID
```python
@router.get("/states/run/{run_id}", response_model=StatesByRunIdResponse)
async def get_states_by_run_id_route(namespace_name: str, run_id: str, request: Request, api_key: str = Depends(check_api_key)):
    # Returns all states for a specific run ID
```

## Frontend Implementation

### TypeScript Types (`state-manager-frontend/src/types/state-manager.ts`)

```typescript
export interface CreateRequest {
  run_id: string;
  states: RequestState[];
}

export interface ResponseState {
  // ... existing fields ...
  run_id: string;
  // ... rest of fields ...
}

export interface StateListItem {
  id: string;
  node_name: string;
  namespace_name: string;
  identifier: string;
  graph_name: string;
  run_id: string;
  status: StateStatus;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  error?: string;
  parents: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface StatesByRunIdResponse {
  namespace: string;
  run_id: string;
  count: number;
  states: StateListItem[];
}

export interface CurrentStatesResponse {
  namespace: string;
  count: number;
  states: StateListItem[];
  run_ids: string[];
}
```

### API Service Methods (`state-manager-frontend/src/services/api.ts`)

```typescript
// Get all current states
async getCurrentStates(namespace: string, apiKey: string): Promise<CurrentStatesResponse>

// Get states by run ID
async getStatesByRunId(namespace: string, runId: string, apiKey: string): Promise<StatesByRunIdResponse>
```

### New Component: StatesByRunId (`state-manager-frontend/src/components/StatesByRunId.tsx`)

Features:
- **Run ID Selector**: Visual grid of available run IDs with state counts
- **State Details**: Complete state information including inputs, outputs, errors
- **Status Indicators**: Color-coded status badges with icons
- **Summary Statistics**: Total states, unique run IDs, completed states
- **Real-time Updates**: Refresh capability and error handling

### Dashboard Integration

#### New Tab: "Run States"
- Added as the 6th tab in the navigation
- Uses Filter icon for visual identification
- Provides comprehensive run ID management interface

#### Run ID Generation
```typescript
// In the create-states workflow step
const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const createResponse = await apiService.createStates(namespace, graphName, {
  run_id: runId,
  states: [...]
}, apiKey);
```

## API Usage Examples

### 1. Create States with Run ID
```bash
curl -X POST "http://localhost:8000/v0/namespace/test-namespace/graph/test-graph/states/create" \
  -H "X-API-Key: niki" \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "run_1703123456789_abc123def",
    "states": [
      {
        "identifier": "node1",
        "inputs": {"input1": "test_value", "input2": 42}
      }
    ]
  }'
```

### 2. Get All Current States
```bash
curl -X GET "http://localhost:8000/v0/namespace/test-namespace/states/" \
  -H "X-API-Key: niki"
```

Response:
```json
{
  "namespace": "test-namespace",
  "count": 5,
  "states": [...],
  "run_ids": ["run_1703123456789_abc123def", "run_1703123456790_xyz789ghi"]
}
```

### 3. Get States by Run ID
```bash
curl -X GET "http://localhost:8000/v0/namespace/test-namespace/states/run/run_1703123456789_abc123def" \
  -H "X-API-Key: niki"
```

Response:
```json
{
  "namespace": "test-namespace",
  "run_id": "run_1703123456789_abc123def",
  "count": 2,
  "states": [
    {
      "id": "state_id_1",
      "node_name": "TestNode",
      "namespace_name": "test-namespace",
      "identifier": "node1",
      "graph_name": "test-graph",
      "run_id": "run_1703123456789_abc123def",
      "status": "CREATED",
      "inputs": {"input1": "test_value", "input2": 42},
      "outputs": {},
      "error": null,
      "parents": {},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Frontend Usage

### 1. Navigate to Run States Tab
1. Open the State Manager Dashboard
2. Click on the "Run States" tab (6th tab)
3. View all available run IDs in the selector grid

### 2. Select a Run ID
1. Click on any run ID card in the selector
2. View detailed states for that specific run
3. See inputs, outputs, status, and error information

### 3. Monitor Execution
1. Run the workflow to create new states with run IDs
2. Refresh the Run States tab to see new executions
3. Track state progression through different statuses

## Benefits

### 1. **Execution Tracking**
- Group related states by execution run
- Track complete workflow executions
- Debug specific runs independently

### 2. **Better Organization**
- Clear separation between different executions
- Easy identification of related states
- Improved state management

### 3. **Enhanced Monitoring**
- Real-time execution tracking
- Status monitoring per run
- Error tracking and debugging

### 4. **Scalability**
- Support for multiple concurrent executions
- Efficient querying by run ID
- Future support for run-level operations

## Future Enhancements

### 1. **Run-Level Operations**
- Cancel entire runs
- Retry failed runs
- Run-level metrics and analytics

### 2. **Advanced Filtering**
- Filter by date range
- Filter by status
- Search by run ID patterns

### 3. **Run Templates**
- Save successful run configurations
- Clone runs with modifications
- Run history and comparison

### 4. **Performance Optimizations**
- Database indexing on run_id
- Pagination for large state sets
- Caching of run metadata

## Migration Notes

### For Existing Data
- Existing states without run_id will need migration
- Consider adding a default run_id for legacy states
- Update any existing queries to handle missing run_id

### For New Implementations
- Always include run_id when creating states
- Use consistent run ID generation patterns
- Implement proper error handling for run ID conflicts

## Testing

### 1. **Backend Testing**
```bash
# Test state creation with run ID
curl -X POST "http://localhost:8000/v0/namespace/test-namespace/graph/test-graph/states/create" \
  -H "X-API-Key: niki" \
  -d '{"run_id": "test_run_1", "states": [...]}'

# Test fetching states by run ID
curl -X GET "http://localhost:8000/v0/namespace/test-namespace/states/run/test_run_1" \
  -H "X-API-Key: niki"
```

### 2. **Frontend Testing**
1. Run the complete workflow
2. Navigate to Run States tab
3. Verify run ID generation and display
4. Test state filtering and selection

The run ID feature provides a robust foundation for tracking and managing state executions, making the State Manager more powerful and easier to use for complex workflow scenarios.
