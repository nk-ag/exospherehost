# Basic Node Examples

This section contains basic node implementation examples that demonstrate fundamental patterns for creating Exosphere nodes.

## Simple Data Processing Node

A basic node that performs simple text operations.

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class DataProcessorNode(BaseNode):
    class Inputs(BaseModel):
        text: str
        operation: str

    class Outputs(BaseModel):
        result: str
        status: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        if self.inputs.operation == "uppercase":
            result = self.inputs.text.upper()
        elif self.inputs.operation == "lowercase":
            result = self.inputs.text.lower()
        else:
            return self.Outputs(
                result="",
                status="error: unknown operation"
            )
        
        return self.Outputs(
            result=result,
            status="success"
        )
```

## Complex Data Processing Node

A node that handles complex data using JSON serialization.

```python
import json
from exospherehost import BaseNode
from pydantic import BaseModel

class ComplexDataNode(BaseNode):
    class Inputs(BaseModel):
        config: str  # JSON string
        data_list: str  # JSON string

    class Outputs(BaseModel):
        result: str
        metadata: str  # JSON string

    class Secrets(BaseModel):
        api_key: str

    async def execute(self) -> Outputs:
        # Parse JSON inputs
        config = json.loads(self.inputs.config)
        data_list = json.loads(self.inputs.data_list)
        
        # Process data
        results = []
        for item in data_list:
            processed = process_item(item, config)
            results.append(processed)
        
        # Return JSON outputs
        return self.Outputs(
            result=json.dumps(results),
            metadata=json.dumps({
                "processed_count": len(results),
                "config_used": config
            })
        )
```

## Multi-Output Node

A node that returns multiple outputs by returning a list.

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class MultiOutputNode(BaseNode):
    class Inputs(BaseModel):
        data: str

    class Outputs(BaseModel):
        processed_data: str
        status: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> list[Outputs]:
        # Process data and create multiple outputs
        outputs = []
        
        # Split data and process each part
        parts = self.inputs.data.split(',')
        
        for i, part in enumerate(parts):
            processed = part.strip().upper()
            outputs.append(self.Outputs(
                processed_data=processed,
                status=f"processed_part_{i}"
            ))
        
        return outputs
```

## Error Handling Node

A node that demonstrates robust error handling patterns.

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class RobustNode(BaseNode):
    class Inputs(BaseModel):
        data: str

    class Outputs(BaseModel):
        result: str
        error: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        try:
            # Your processing logic
            result = process_data(self.inputs.data)
            return self.Outputs(
                result=result,
                error=""
            )
        except ValueError as e:
            return self.Outputs(
                result="",
                error=f"validation_error: {str(e)}"
            )
        except Exception as e:
            return self.Outputs(
                result="",
                error=f"processing_error: {str(e)}"
            )
```

## Testing Node

A simple node for testing purposes.

```python
import asyncio
from exospherehost import BaseNode
from pydantic import BaseModel

class TestNode(BaseNode):
    class Inputs(BaseModel):
        data: str

    class Outputs(BaseModel):
        result: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        return self.Outputs(result=f"processed: {self.inputs.data}")

# Test the node
async def test_node():
    node = TestNode()
    inputs = TestNode.Inputs(data="test data")
    secrets = TestNode.Secrets()
    
    outputs = await node._execute(inputs, secrets)
    print(f"Output: {outputs.result}")

# Run the test
asyncio.run(test_node())
```
