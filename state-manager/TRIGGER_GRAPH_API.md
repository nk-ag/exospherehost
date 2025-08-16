# Trigger Graph API

The Trigger Graph API allows you to start a new graph execution by automatically generating a run ID and creating the initial states.

## Endpoint

```
POST /v0/namespace/{namespace_name}/graph/{graph_name}/trigger
```

## Request Body

```json
{
  "states": [
    {
      "identifier": "node_identifier_1",
      "inputs": {
        "input_key": "input_value"
      }
    },
    {
      "identifier": "node_identifier_2", 
      "inputs": {
        "another_input": "another_value"
      }
    }
  ]
}
```

## Response

```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CREATED",
  "states": [
    {
      "state_id": "state_object_id_1",
      "node_name": "NodeName1",
      "identifier": "node_identifier_1",
      "graph_name": "my_graph",
      "run_id": "550e8400-e29b-41d4-a716-446655440000",
      "inputs": {
        "input_key": "input_value"
      },
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "state_id": "state_object_id_2",
      "node_name": "NodeName2",
      "identifier": "node_identifier_2",
      "graph_name": "my_graph", 
      "run_id": "550e8400-e29b-41d4-a716-446655440000",
      "inputs": {
        "another_input": "another_value"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Key Features

1. **Automatic Run ID Generation**: The API automatically generates a unique UUID for the `run_id` field
2. **State Creation**: Creates all specified states with the generated run ID
3. **Graph Template Validation**: Validates that the graph template exists and contains the specified nodes
4. **Error Handling**: Returns appropriate HTTP error codes for various failure scenarios

## Example Usage

```bash
curl -X POST "http://localhost:8000/v0/namespace/my_namespace/graph/my_graph/trigger" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "states": [
      {
        "identifier": "start_node",
        "inputs": {
          "message": "Hello World"
        }
      },
      {
        "identifier": "process_node",
        "inputs": {
          "data": "some_data"
        }
      }
    ]
  }'
```

## Error Responses

- `404 Not Found`: Graph template not found
- `404 Not Found`: Node template not found within the graph
- `401 Unauthorized`: Invalid API key
- `500 Internal Server Error`: Database or other internal errors

## Differences from Create States API

The main difference between this API and the existing `/graph/{graph_name}/states/create` endpoint is:

- **Trigger Graph**: Automatically generates a run ID for you
- **Create States**: Requires you to provide your own run ID

This makes the Trigger Graph API more convenient for starting new graph executions, while the Create States API gives you more control over run ID management.
