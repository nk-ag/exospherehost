# Getting Started

## Installation

```bash
uv add exospherehost
```

## Environment Setup

Set up your environment variables for authentication:
=== ".env File"

    ```bash
    EXOSPHERE_STATE_MANAGER_URI=your-state-manager-uri
    EXOSPHERE_API_KEY=your-api-key
    ```
=== "Environment Variables"

    ```bash
    export EXOSPHERE_STATE_MANAGER_URI="your-state-manager-uri"
    export EXOSPHERE_API_KEY="your-api-key"
    ```

Refer: [Getting State Manager URI](./state-manager-setup.md)

## Overview

Exosphere is built around three core concepts:

### 1. Nodes

Nodes are the building blocks of your workflows. Each node:

- Defines input/output schemas using Pydantic models
- Implements an `execute` method for processing logic
- Can be connected to other nodes to form **workflows**
- Automatically handles state persistence

### 2. Runtime

The `Runtime` class manages the execution environment and coordinates with the ExosphereHost state manager. It handles:

- Node lifecycle management
- State coordination
- Error handling and recovery
- Resource allocation

### 3. State Manager

The state manager orchestrates workflow execution, manages state transitions, and provides the dashboard for monitoring and debugging.

## Quick Start Example

Create a simple node that processes data:

```python
from exospherehost import Runtime, BaseNode
from pydantic import BaseModel

class SampleNode(BaseNode):
    class Inputs(BaseModel):
        name: str
        data: str

    class Outputs(BaseModel):
        message: str
        processed_data: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        print(f"Processing data for: {self.inputs.name}")
        processed_data = f"completed:{self.inputs.data}"
        return self.Outputs(
            message="success",
            processed_data=processed_data
        )

# Initialize the runtime
# Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
Runtime(
    namespace="MyProject",
    name="DataProcessor",
    nodes=[SampleNode]
).start()
```

## Next Steps

Now that you have the basics, explore:

- **[Register Node](./register-node.md)** - Understand how to create and register custom nodes
- **[Create Runtime](./create-runtime.md)** - Learn how to set up and configure your runtime
- **[Create Graph](./create-graph.md)** - Build workflows by connecting nodes together
- **[Trigger Graph](./trigger-graph.md)** - Execute your workflows and monitor their progress

## Key Features

- **Distributed Execution**: Run nodes across multiple compute resources
- **State Management**: Automatic state persistence and recovery
- **Type Safety**: Full Pydantic integration for input/output validation
- **String-only data model (v1)**: All `Inputs`, `Outputs`, and `Secrets` fields are strings
- **Async Support**: Native async/await support for high-performance operations
- **Error Handling**: Built-in retry mechanisms and error recovery
- **Scalability**: Designed for high-volume batch processing and workflows

## Architecture

```
-------------------     --------------------     --------------------
│   Your Nodes    │ <-> │     Runtime      │ <-> │  State Manager   │
│                 │     │                  │     │                  │
│ - Inputs        │     │ - Registration   │     │ - Orchestration  │
│ - Outputs       │     │ - Execution      │     │ - State Mgmt     │
│ - Secrets       │     │ - Error Handling │     │ - Dashboard      │
-------------------     --------------------     --------------------
```

## Data Model (v1)

**Important**: In v1, all fields in `Inputs`, `Outputs`, and `Secrets` must be strings. If you need to pass complex data (e.g., JSON), serialize the data to a string first, then parse that string within your node.

```python
class MyNode(BaseNode):
    class Inputs(BaseModel):
        # ✅ Correct - string fields
        user_id: str
        config: str  # JSON string
        
    class Outputs(BaseModel):
        # ✅ Correct - string fields
        result: str
        metadata: str  # JSON string
        
    class Secrets(BaseModel):
        # ✅ Correct - string fields
        api_key: str
        database_url: str
```

## Support

For support and questions:
- **Email**: [nivedit@exosphere.host](mailto:nivedit@exosphere.host)
- **Documentation**: [https://docs.exosphere.host](https://docs.exosphere.host)
- **GitHub Issues**: [https://github.com/exospherehost/exospherehost/issues](https://github.com/exospherehost/exospherehost/issues)
