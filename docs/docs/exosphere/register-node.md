# Register Node

Nodes are the building blocks of Exosphere workflows. Each node defines a specific piece of processing logic with typed inputs, outputs, and secrets. This guide shows you how to create and register custom nodes.

## Node Structure

Every node inherits from `BaseNode` and defines three key components:

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class MyNode(BaseNode):
    class Inputs(BaseModel):
        # Define your input fields here
        pass

    class Outputs(BaseModel):
        # Define your output fields here
        pass

    class Secrets(BaseModel):
        # Define your secret fields here
        pass

    async def execute(self) -> Outputs:
        # Implement your processing logic here
        pass
```

### Inputs

Define the data your node expects to receive:

```python
class Inputs(BaseModel):
    user_id: str
    data: str
    config: str  # JSON string for complex configuration
    batch_size: str = "100"  # Default value
```

### Outputs

Define the data your node produces:

```python
class Outputs(BaseModel):
    processed_data: str
    metadata: str  # JSON string for complex metadata
    status: str
    count: str
```

### Secrets

Define sensitive configuration data your node needs:

```python
class Secrets(BaseModel):
    api_key: str
    database_url: str
    encryption_key: str
```

## Examples

For node implementation examples, see the **[Node Implementation Examples](./examples/node-examples/index.md)** section, which includes:

- **[Nodes](./examples/node-examples/basic-nodes.md)** - Fundamental patterns and simple node implementations
- **[Integration](./examples/node-examples/integration-nodes.md)** - Nodes that integrate with external services and systems

These examples demonstrate common patterns, best practices, and real-world use cases for creating Exosphere nodes.

## Node Validation

The runtime automatically validates your nodes:

```python hl_lines="19"
# ✅ Valid node
class ValidNode(BaseNode):
    class Inputs(BaseModel):
        data: str  # All fields must be strings

    class Outputs(BaseModel):
        result: str  # All fields must be strings

    class Secrets(BaseModel):
        api_key: str  # All fields must be strings

    async def execute(self) -> Outputs:
        return self.Outputs(result="success")

# ❌ Invalid node - non-string fields
class InvalidNode(BaseNode):
    class Inputs(BaseModel):
        data: str
        count: int  # Error: must be str

    class Outputs(BaseModel):
        result: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        return self.Outputs(result="success")
```

## Node Registration

Nodes are automatically registered when you start your runtime:

```python hl_lines="14"
from exospherehost import Runtime

# Create your nodes
class Node1(BaseNode):
    # ... node implementation

class Node2(BaseNode):
    # ... node implementation

# Register nodes with runtime
# Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
Runtime(
    namespace="MyProject",
    name="MyRuntime",
    nodes=[Node1, Node2]  # Both nodes will be registered
).start()
```

## Node Naming and Organization

### Namespace Organization

Organise nodes to a namespace to re-use them across flows in that namespace

```python hl_lines="3 10"
# Development namespace
# Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
Runtime(
    namespace="dev",
    name="MyRuntime",
    nodes=[MyNode]
).start()

# Production namespace
# Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
Runtime(
    namespace="prod",
    name="MyRuntime",
    nodes=[MyNode]
).start()
```

## Next Steps

- **[Node Implementation Examples](./node-examples/index.md)** - Comprehensive examples of node implementations
- **[Create Graph](./create-graph.md)** - Learn how to connect nodes into workflows
- **[Trigger Graph](./trigger-graph.md)** - Execute and monitor your workflows
- **[Examples](./examples.md)** - See real-world workflow examples and use cases
