# Exosphere

Exosphere is an open-source infrastructure layer to run distributed AI workflows and agents with Python based on a node-based architecture.

---

**Documentation**: [https://docs.exosphere.host](https://docs.exosphere.host)

**Source Code**: [https://github.com/exospherehost/exospherehost](https://github.com/exospherehost/exospherehost)

---

## Requirements

Python 3.12+

## Installation

```bash
uv add exospherehost
```

## Example

### Create it

Create a file `main.py` with:

```python
from exospherehost import Runtime, BaseNode
from pydantic import BaseModel

class HelloWorldNode(BaseNode):
    class Inputs(BaseModel):
        name: str

    class Outputs(BaseModel):
        message: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        return self.Outputs(
            message=f"Hello, {self.inputs.name}!"
        )

# Initialize the runtime
Runtime(
    namespace="MyProject",
    name="HelloWorld",
    nodes=[HelloWorldNode]
).start()
```

### Run it

Run the server with:

```bash
uv run main.py
```

### Check it

Your runtime is now running and ready to process workflows!

### Interactive Dashboard

Now go to your Exosphere dashboard to:

* View your registered nodes
* Create and manage graph templates
* Trigger workflows
* Monitor execution states
* Debug and troubleshoot

Ref: [Dashboard Guide](./dashboard.md)

## Example flow

Now modify the file `main.py` to add more complex processing:

```python
from exospherehost import Runtime, BaseNode
from pydantic import BaseModel
import json

class DataProcessorNode(BaseNode):
    class Inputs(BaseModel):
        data: str
        operation: str

    class Outputs(BaseModel):
        result: str
        status: str

    class Secrets(BaseModel):
        api_key: str

    async def execute(self) -> Outputs:
        # Parse the input data
        try:
            data = json.loads(self.inputs.data)
        except:
            return self.Outputs(
                result="",
                status="error: invalid json"
            )
        
        # Process based on operation
        if self.inputs.operation == "transform":
            result = {"transformed": data, "processed": True}
        else:
            result = {"original": data, "processed": False}
        
        return self.Outputs(
            result=json.dumps(result),
            status="success"
        )

# Initialize the runtime
Runtime(
    namespace="MyProject",
    name="DataProcessor",
    nodes=[DataProcessorNode]
).start()
```

The runtime will automatically reload and register the updated node.
