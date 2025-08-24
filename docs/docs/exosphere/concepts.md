# Core Concepts

This section explains the fundamental concepts that define Exosphere's architecture and design philosophy.

## Fanout

Fanout is a core concept in Exosphere that enables parallel processing and distributed execution. It allows a single node to produce multiple outputs, which can then be processed by multiple downstream nodes simultaneously.

### Understanding Fanout

Fanout occurs when a node returns multiple outputs from a single execution. This is particularly useful for:

- **Data splitting**: Dividing large datasets into smaller chunks for parallel processing
- **Batch processing**: Processing multiple items simultaneously
- **Parallel agents**: Executing different branches of a workflow concurrently

### Fanout Example

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class DataSplitterNode(BaseNode):
    class Inputs(BaseModel):
        data: str  # JSON string of data array

    class Outputs(BaseModel):
        chunk: str  # JSON string of data chunk

    class Secrets(BaseModel):
        pass

    async def execute(self) -> list[Outputs]:
        data = json.loads(self.inputs.data)
        chunk_size = 100
        
        outputs = []
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            outputs.append(self.Outputs(
                chunk=json.dumps(chunk)
            ))
        
        return outputs  # This creates fanout - multiple outputs
```

### Fanout in Flows

When a node produces multiple outputs, the state manager creates multiple states that can be processed in parallel. In the flow structure, this is handled through the `next_nodes` field:

```json
{
  "nodes": [
    {
      "node_name": "DataSplitterNode",
      "namespace": "MyProject",
      "identifier": "data_splitter",
      "inputs": {
        "data": "initial"
      },
      "next_nodes": ["processor_1", "processor_2", "processor_3"]
    },
    {
      "node_name": "DataProcessorNode",
      "namespace": "MyProject",
      "identifier": "processor_1",
      "inputs": {
        "chunk": "${{ data_splitter.outputs.chunk }}"
      },
      "next_nodes": ["result_merger"]
    },
    {
      "node_name": "DataProcessorNode",
      "namespace": "MyProject",
      "identifier": "processor_2",
      "inputs": {
        "chunk": "${{ data_splitter.outputs.chunk }}"
      },
      "next_nodes": ["result_merger"]
    },
    {
      "node_name": "DataProcessorNode",
      "namespace": "MyProject",
      "identifier": "processor_3",
      "inputs": {
        "chunk": "${{ data_splitter.outputs.chunk }}"
      },
      "next_nodes": ["result_merger"]
    },
    {
      "node_name": "ResultMergerNode",
      "namespace": "MyProject",
      "identifier": "result_merger",
      "inputs": {
        "result_1": "${{ processor_1.outputs.processed_data }}",
        "result_2": "${{ processor_2.outputs.processed_data }}",
        "result_3": "${{ processor_3.outputs.processed_data }}"
      },
      "next_nodes": []
    }
  ]
}
```

Each output from the `data_splitter` node will trigger separate executions of the processor nodes, and the `result_merger` will wait for all processors to complete before executing.

## Units

Units in Exosphere represent the atomic processing components that make up your workflows. Each unit is a self-contained piece of logic that can be executed independently.

### Unit Characteristics

- **Self-contained**: Each unit has its own inputs, outputs, and processing logic
- **Stateless**: Units don't maintain state between executions (state is managed externally)
- **Reusable**: Units can be used in multiple workflows
- **Testable**: Units can be tested independently

## Inputs

Inputs define the data that a unit expects to receive. In Exosphere v1, all inputs must be strings, which provides a consistent interface while allowing for complex data through JSON serialization.

### Input Structure

```python
class Inputs(BaseModel):
    # Simple string inputs
    user_id: str
    operation: str
    
    # Complex data as JSON strings
    config: str  # JSON string
    data: str    # JSON string
```

### Input Validation

Pydantic automatically validates inputs based on the schema:

```python
class Inputs(BaseModel):
    user_id: str
    age: str  # Must be a string representation of a number
    
    @validator('age')
    def validate_age(cls, v):
        try:
            age = int(v)
            if age < 0 or age > 150:
                raise ValueError("Age must be between 0 and 150")
            return v
        except ValueError:
            raise ValueError("Age must be a valid integer")
```

### Working with Complex Inputs

Since all inputs are strings, use JSON for complex data:

```python
async def execute(self) -> Outputs:
    # Parse JSON inputs
    config = json.loads(self.inputs.config)
    data = json.loads(self.inputs.data)
    
    # Use the parsed data
    result = self._process_with_config(data, config)
    
    return self.Outputs(result=json.dumps(result))
```

### Input Mapping in Flows

In flow templates, inputs can reference outputs from previous nodes using the `${{ ... }}` syntax:

```json
{
  "nodes": [
    {
      "node_name": "DataLoaderNode",
      "identifier": "data_loader",
      "inputs": {
        "source": "initial"  // Static value
      },
      "next_nodes": ["data_processor"]
    },
    {
      "node_name": "DataProcessorNode",
      "identifier": "data_processor", 
      "inputs": {
        "raw_data": "${{ data_loader.outputs.processed_data }}",  // Mapped from previous node
        "config": "initial"  // Static value
      },
      "next_nodes": ["data_validator"]
    }
  ]
}
```

**Mapping Syntax:**
- **`${{ node_identifier.outputs.field_name }}`**: Maps output from a specific node
- **`initial`**: Static value provided when the flow is triggered
- **Direct values**: String, number, or boolean values

## Outputs

Outputs define the data that a unit produces. Like inputs, all outputs must be strings in v1, providing a consistent interface for data flow between units.

### Output Structure

```python
class Outputs(BaseModel):
    # Simple string outputs
    status: str
    message: str
    
    # Complex data as JSON strings
    result: str      # JSON string
    metadata: str    # JSON string
```

### Multiple Outputs

Units can return multiple outputs through fanout:

```python
async def execute(self) -> list[Outputs]:
    data = json.loads(self.inputs.data)
    
    outputs = []
    for item in data:
        processed = self._process_item(item)
        outputs.append(self.Outputs(
            result=json.dumps(processed),
            item_id=str(item['id'])
        ))
    
    return outputs  # Multiple outputs for fanout
```

### Output Validation

Validate outputs before returning them:

```python
async def execute(self) -> Outputs:
    result = self._process(self.inputs.data)
    
    # Validate the result
    if not result:
        return self.Outputs(
            result="",
            status="error",
            error="Processing failed"
        )
    
    return self.Outputs(
        result=json.dumps(result),
        status="success",
        error=""
    )
```

## Secrets

Secrets provide secure access to sensitive configuration data such as API keys, database credentials, and other authentication tokens. Secrets are managed securely by the Exosphere runtime and are never exposed in logs or error messages.

### Secret Structure

```python
class Secrets(BaseModel):
    # API credentials
    api_key: str
    api_secret: str
    
    # Database credentials
    database_url: str
    database_password: str
    
    # External service credentials
    aws_access_key_id: str
    aws_secret_access_key: str
```

### Using Secrets

Secrets are automatically injected into your unit during execution:

```python
async def execute(self) -> Outputs:
    # Access secrets via self.secrets
    headers = {
        "Authorization": f"Bearer {self.secrets.api_key}",
        "Content-Type": "application/json"
    }
    
    # Use secrets for API calls
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.example.com/process",
            headers=headers,
            json={"data": self.inputs.data}
        )
    
    return self.Outputs(result=response.text)
```

### Secret Management

Secrets are managed by the Exosphere runtime and are defined as an object in the flow template:

```json
{
  "secrets": {
    "openai_api_key": "your-openai-key",
    "aws_access_key_id": "your-aws-key",
    "aws_secret_access_key": "your-aws-secret",
    "database_url": "your-database-url"
  },
  "nodes": [
    // ... node definitions
  ]
}
```

Secrets can be configured through:

1. **Flow template**: Define secrets in the flow template (for development)
2. **Environment variables**: Set secrets in your runtime environment
3. **Runtime configuration**: Pass secrets when creating the runtime
4. **External secret management**: Integrate with services like AWS Secrets Manager

### Security Best Practices

- **Never log secrets**: Secrets are automatically filtered from logs
- **Use environment variables**: Store secrets in environment variables
- **Rotate secrets regularly**: Implement secret rotation policies
- **Limit secret scope**: Only include secrets that the unit actually needs

## Data Flow Concepts

### Linear Flow

Simple sequential processing where each node has a single successor:

```json
{
  "nodes": [
    {
      "node_name": "DataLoaderNode",
      "identifier": "data_loader",
      "next_nodes": ["data_processor"]
    },
    {
      "node_name": "DataProcessorNode", 
      "identifier": "data_processor",
      "next_nodes": ["data_validator"]
    },
    {
      "node_name": "DataValidatorNode",
      "identifier": "data_validator", 
      "next_nodes": []
    }
  ]
}
```

### Parallel Flow

Multiple nodes processing simultaneously with a merge point:

```json
{
  "nodes": [
    {
      "node_name": "DataSplitterNode",
      "identifier": "data_splitter",
      "next_nodes": ["processor_1", "processor_2"]
    },
    {
      "node_name": "DataProcessorNode",
      "identifier": "processor_1",
      "next_nodes": ["result_merger"]
    },
    {
      "node_name": "DataProcessorNode", 
      "identifier": "processor_2",
      "next_nodes": ["result_merger"]
    },
    {
      "node_name": "ResultMergerNode",
      "identifier": "result_merger",
      "next_nodes": []
    }
  ]
}
```

### Conditional Flow

Flow that depends on conditions (handled within node logic):

```json
{
  "nodes": [
    {
      "node_name": "DataAnalyzerNode",
      "identifier": "data_analyzer",
      "next_nodes": ["text_processor", "image_processor"]
    },
    {
      "node_name": "TextProcessorNode",
      "identifier": "text_processor",
      "next_nodes": ["result_collector"]
    },
    {
      "node_name": "ImageProcessorNode",
      "identifier": "image_processor", 
      "next_nodes": ["result_collector"]
    },
    {
      "node_name": "ResultCollectorNode",
      "identifier": "result_collector",
      "next_nodes": []
    }
  ]
}
```

### Fanout Flow

One node producing multiple outputs for parallel processing:

```json
{
  "nodes": [
    {
      "node_name": "DataSplitterNode",
      "identifier": "data_splitter",
      "next_nodes": ["processor_1", "processor_2", "processor_3"]
    },
    {
      "node_name": "DataProcessorNode",
      "identifier": "processor_1",
      "next_nodes": []
    },
    {
      "node_name": "DataProcessorNode",
      "identifier": "processor_2", 
      "next_nodes": []
    },
    {
      "node_name": "DataProcessorNode",
      "identifier": "processor_3",
      "next_nodes": []
    }
  ]
}
```

## State Management

### State Lifecycle

1. **Pending**: State is created and waiting for execution
2. **Running**: State is currently being executed
3. **Executed**: State completed successfully
4. **Errored**: State failed with an error

### State Persistence

States are automatically persisted by the state manager, providing:

- **Fault tolerance**: Failed states can be retried
- **Recovery**: Workflows can resume from where they left off
- **Monitoring**: Track execution progress and history
- **Debugging**: Inspect state data and error information

### State Transitions

```python
# State transitions are handled automatically
async def execute(self) -> Outputs:
    try:
        result = self._process(self.inputs.data)
        return self.Outputs(result=result)  # State becomes "executed"
    except Exception as e:
        raise e  # State becomes "errored"
```

## Error Handling

### Error Propagation

Errors in units are automatically handled by the runtime:

```python
async def execute(self) -> Outputs:
    try:
        result = self._process(self.inputs.data)
        return self.Outputs(result=result)
    except ValueError as e:
        # Validation errors - don't retry
        return self.Outputs(
            result="",
            error=f"validation_error: {str(e)}"
        )
    except Exception as e:
        # Processing errors - will be retried
        raise e
```

### Retry Logic

The runtime automatically retries failed states:

- **Transient failures**: Network issues, temporary unavailability
- **Configurable retry limits**: Set maximum retry attempts
- **Exponential backoff**: Increasing delays between retries
- **Error classification**: Different handling for different error types

## Performance Concepts

### Async Execution

All units are executed asynchronously:

```python
async def execute(self) -> Outputs:
    # Async operations for better performance
    result = await self._async_operation(self.inputs.data)
    return self.Outputs(result=result)
```

### Parallel Processing

Fanout enables parallel processing:

```python
async def execute(self) -> list[Outputs]:
    # This will create multiple parallel executions
    return [self.Outputs(data=chunk) for chunk in self._split_data()]
```

### Resource Management

- **Connection pooling**: Reuse connections for external services
- **Memory management**: Automatic cleanup of resources
- **CPU utilization**: Efficient use of available compute resources

## Scalability Concepts

### Horizontal Scaling

Add more runtime instances to handle increased load:

```python
# Multiple runtime instances can process the same workflow
# Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
Runtime(namespace="MyProject", name="Runtime-1", nodes=[MyNode]).start()
Runtime(namespace="MyProject", name="Runtime-2", nodes=[MyNode]).start()
```

### Load Balancing

The state manager automatically distributes work across available runtimes:

- **Round-robin distribution**: Even distribution of states
- **Capacity-based routing**: Consider runtime capacity
- **Health-based routing**: Avoid unhealthy runtimes

### Auto-scaling

Scale based on workload:

- **Queue depth**: Scale up when queue is full
- **Processing time**: Scale up when processing is slow
- **Error rates**: Scale down when error rates are high

## Next Steps

- **[Create Flow](./create-graph.md)** - Learn how to create flow templates
- **[Trigger Flow](./trigger-graph.md)** - Execute your workflows
- **[Examples](./examples.md)** - See real-world examples
- **[Dashboard](./dashboard.md)** - Monitor your flows with the Exosphere dashboard
