# Examples

This section provides real-world examples of Exosphere workflows and nodes. These examples demonstrate common patterns and use cases for building distributed AI workflows.

## Document Processing Examples

### Parse List of Documents

A comprehensive document processing pipeline that handles multiple document types and formats.

#### Node Structure

```python
from exospherehost import BaseNode
from pydantic import BaseModel
import json

class DocumentParserNode(BaseNode):
    class Inputs(BaseModel):
        document_url: str
        document_type: str
        processing_config: str  # JSON string

    class Outputs(BaseModel):
        parsed_content: str  # JSON string
        metadata: str  # JSON string
        status: str

    class Secrets(BaseModel):
        api_key: str
        storage_bucket: str

    async def execute(self) -> Outputs:
        config = json.loads(self.inputs.processing_config)
        
        # Parse document based on type
        if self.inputs.document_type == "pdf":
            content = await self._parse_pdf(self.inputs.document_url)
        elif self.inputs.document_type == "docx":
            content = await self._parse_docx(self.inputs.document_url)
        else:
            content = await self._parse_text(self.inputs.document_url)
        
        # Extract metadata
        metadata = {
            "document_type": self.inputs.document_type,
            "file_size": len(content),
            "processing_config": config
        }
        
        return self.Outputs(
            parsed_content=json.dumps(content),
            metadata=json.dumps(metadata),
            status="success"
        )
    
    async def _parse_pdf(self, url):
        # PDF parsing logic
        pass
    
    async def _parse_docx(self, url):
        # DOCX parsing logic
        pass
    
    async def _parse_text(self, url):
        # Text parsing logic
        pass
```

#### Graph Template

```json
{
  "name": "document-processing-pipeline",
  "description": "Process and parse multiple document types",
  "nodes": [
    {
      "id": "document-loader",
      "name": "DocumentLoaderNode",
      "namespace": "exospherehost"
    },
    {
      "id": "document-parser",
      "name": "DocumentParserNode",
      "namespace": "exospherehost"
    },
    {
      "id": "content-analyzer",
      "name": "ContentAnalyzerNode",
      "namespace": "exospherehost"
    },
    {
      "id": "result-storer",
      "name": "ResultStorerNode",
      "namespace": "exospherehost"
    }
  ],
  "connections": [
    {
      "from": "document-loader",
      "to": "document-parser",
      "mapping": {
        "document_url": "document_url",
        "document_type": "document_type"
      }
    },
    {
      "from": "document-parser",
      "to": "content-analyzer",
      "mapping": {
        "parsed_content": "content"
      }
    },
    {
      "from": "content-analyzer",
      "to": "result-storer",
      "mapping": {
        "analysis_result": "result"
      }
    }
  ],
  "triggers": [
    {
      "id": "process-documents",
      "node": "document-loader"
    }
  ],
  "secrets": [
    "api_key",
    "storage_bucket"
  ]
}
```

#### Triggering the Pipeline

```python
from exospherehost import StateManager, TriggerState
import json

async def process_documents():
    state_manager = StateManager(
        namespace="exospherehost",
        state_manager_uri="https://your-state-manager.exosphere.host",
        key="your-api-key"
    )
    
    # Document processing configuration
    config = {
        "ocr_enabled": True,
        "language": "en",
        "extract_tables": True,
        "extract_images": False
    }
    
    # Create trigger state
    trigger_state = TriggerState(
        identifier="process-documents",
        inputs={
            "document_url": "https://example.com/document.pdf",
            "document_type": "pdf",
            "processing_config": json.dumps(config)
        }
    )
    
    # Trigger the pipeline
    result = await state_manager.trigger("document-processing-pipeline", state=trigger_state)
    return result
```

## Cloud Storage Examples

### S3 File Processing

A cloud storage runtime that processes files from S3 buckets.

#### List S3 Files Node

```python
import boto3
from exospherehost import BaseNode
from pydantic import BaseModel

class ListS3FilesNode(BaseNode):
    class Inputs(BaseModel):
        bucket_name: str
        prefix: str = ""
        files_only: str = "true"
        recursive: str = "false"

    class Outputs(BaseModel):
        file_keys: str  # JSON string of file keys

    class Secrets(BaseModel):
        aws_access_key_id: str
        aws_secret_access_key: str
        aws_region: str

    async def execute(self) -> Outputs:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=self.secrets.aws_access_key_id,
            aws_secret_access_key=self.secrets.aws_secret_access_key,
            region_name=self.secrets.aws_region
        )
        
        response = s3_client.list_objects_v2(
            Bucket=self.inputs.bucket_name,
            Prefix=self.inputs.prefix
        )
        
        file_keys = []
        for obj in response.get('Contents', []):
            if self.inputs.files_only == "true":
                if not obj['Key'].endswith('/'):
                    file_keys.append(obj['Key'])
            else:
                file_keys.append(obj['Key'])
        
        return self.Outputs(file_keys=json.dumps(file_keys))
```

#### Download S3 File Node

```python
import boto3
import tempfile
import os
from exospherehost import BaseNode
from pydantic import BaseModel

class DownloadS3FileNode(BaseNode):
    class Inputs(BaseModel):
        bucket_name: str
        file_key: str
        local_path: str = ""

    class Outputs(BaseModel):
        local_file_path: str
        file_size: str
        download_status: str

    class Secrets(BaseModel):
        aws_access_key_id: str
        aws_secret_access_key: str
        aws_region: str

    async def execute(self) -> Outputs:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=self.secrets.aws_access_key_id,
            aws_secret_access_key=self.secrets.aws_secret_access_key,
            region_name=self.secrets.aws_region
        )
        
        # Determine local path
        if not self.inputs.local_path:
            temp_dir = tempfile.gettempdir()
            filename = os.path.basename(self.inputs.file_key)
            local_path = os.path.join(temp_dir, filename)
        else:
            local_path = self.inputs.local_path
        
        try:
            # Download file
            s3_client.download_file(
                self.inputs.bucket_name,
                self.inputs.file_key,
                local_path
            )
            
            # Get file size
            file_size = os.path.getsize(local_path)
            
            return self.Outputs(
                local_file_path=local_path,
                file_size=str(file_size),
                download_status="success"
            )
            
        except Exception as e:
            return self.Outputs(
                local_file_path="",
                file_size="0",
                download_status=f"error: {str(e)}"
            )
```

#### Cloud Storage Runtime

```python
from exospherehost import Runtime
from nodes.list_s3_files import ListS3FilesNode
from nodes.download_s3_file import DownloadS3FileNode

# Initialize the cloud storage runtime
Runtime(
    name="cloud-storage-runtime",
    namespace="exospherehost",
    nodes=[ListS3FilesNode, DownloadS3FileNode]
).start()
```

#### S3 Processing Graph

```json
{
  "name": "s3-file-processing",
  "description": "Process files from S3 bucket",
  "nodes": [
    {
      "id": "file-lister",
      "name": "ListS3FilesNode",
      "namespace": "exospherehost"
    },
    {
      "id": "file-downloader",
      "name": "DownloadS3FileNode",
      "namespace": "exospherehost"
    },
    {
      "id": "file-processor",
      "name": "FileProcessorNode",
      "namespace": "exospherehost"
    }
  ],
  "connections": [
    {
      "from": "file-lister",
      "to": "file-downloader",
      "mapping": {
        "file_keys": "file_key"
      }
    },
    {
      "from": "file-downloader",
      "to": "file-processor",
      "mapping": {
        "local_file_path": "input_file"
      }
    }
  ],
  "triggers": [
    {
      "id": "process-s3-files",
      "node": "file-lister"
    }
  ],
  "secrets": [
    "aws_access_key_id",
    "aws_secret_access_key",
    "aws_region"
  ]
}
```

## Data Processing Examples

### Batch Data Processing

A scalable batch processing pipeline for large datasets.

#### Data Splitter Node

```python
import json
from exospherehost import BaseNode
from pydantic import BaseModel

class DataSplitterNode(BaseNode):
    class Inputs(BaseModel):
        data: str  # JSON string of data array
        batch_size: str = "1000"

    class Outputs(BaseModel):
        batch_data: str  # JSON string of batch data

    class Secrets(BaseModel):
        pass

    async def execute(self) -> list[Outputs]:
        data = json.loads(self.inputs.data)
        batch_size = int(self.inputs.batch_size)
        
        outputs = []
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            outputs.append(self.Outputs(
                batch_data=json.dumps(batch)
            ))
        
        return outputs
```

#### Data Processor Node

```python
import json
from exospherehost import BaseNode
from pydantic import BaseModel

class DataProcessorNode(BaseNode):
    class Inputs(BaseModel):
        batch_data: str  # JSON string
        processing_config: str  # JSON string

    class Outputs(BaseModel):
        processed_data: str  # JSON string
        processing_stats: str  # JSON string

    class Secrets(BaseModel):
        api_key: str

    async def execute(self) -> Outputs:
        data = json.loads(self.inputs.batch_data)
        config = json.loads(self.inputs.processing_config)
        
        # Process the data
        processed_items = []
        for item in data:
            processed_item = await self._process_item(item, config)
            processed_items.append(processed_item)
        
        # Calculate statistics
        stats = {
            "input_count": len(data),
            "output_count": len(processed_items),
            "processing_time": "calculated_time"
        }
        
        return self.Outputs(
            processed_data=json.dumps(processed_items),
            processing_stats=json.dumps(stats)
        )
    
    async def _process_item(self, item, config):
        # Item processing logic
        return {"processed": item, "config": config}
```

#### Result Merger Node

```python
import json
from exospherehost import BaseNode
from pydantic import BaseModel

class ResultMergerNode(BaseNode):
    class Inputs(BaseModel):
        processed_data: str  # JSON string
        batch_id: str

    class Outputs(BaseModel):
        merged_results: str  # JSON string
        total_count: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        data = json.loads(self.inputs.processed_data)
        
        # Merge results (in a real scenario, this would aggregate from multiple batches)
        merged_results = data
        
        return self.Outputs(
            merged_results=json.dumps(merged_results),
            total_count=str(len(merged_results))
        )
```

## API Integration Examples

### External API Processing

A node that integrates with external APIs for data enrichment.

#### API Integration Node

```python
import httpx
import json
from exospherehost import BaseNode
from pydantic import BaseModel

class APIEnrichmentNode(BaseNode):
    class Inputs(BaseModel):
        user_data: str  # JSON string
        enrichment_type: str

    class Outputs(BaseModel):
        enriched_data: str  # JSON string
        api_response: str  # JSON string

    class Secrets(BaseModel):
        api_key: str
        api_endpoint: str

    async def execute(self) -> Outputs:
        user_data = json.loads(self.inputs.user_data)
        
        headers = {
            "Authorization": f"Bearer {self.secrets.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.secrets.api_endpoint}/enrich",
                headers=headers,
                json={
                    "data": user_data,
                    "type": self.inputs.enrichment_type
                }
            )
        
        if response.status_code == 200:
            enriched_data = response.json()
            return self.Outputs(
                enriched_data=json.dumps(enriched_data),
                api_response=json.dumps({"status": "success"})
            )
        else:
            return self.Outputs(
                enriched_data=json.dumps(user_data),
                api_response=json.dumps({"status": "error", "code": response.status_code})
            )
```

## Machine Learning Examples

### Model Inference Node

A node for running machine learning model inference.

#### ML Inference Node

```python
import json
import numpy as np
from exospherehost import BaseNode
from pydantic import BaseModel

class MLInferenceNode(BaseNode):
    class Inputs(BaseModel):
        input_data: str  # JSON string
        model_name: str

    class Outputs(BaseModel):
        predictions: str  # JSON string
        confidence_scores: str  # JSON string

    class Secrets(BaseModel):
        model_path: str
        model_config: str  # JSON string

    async def execute(self) -> Outputs:
        input_data = json.loads(self.inputs.input_data)
        model_config = json.loads(self.secrets.model_config)
        
        # Load model (in practice, you'd load this once and cache it)
        model = await self._load_model(self.secrets.model_path)
        
        # Preprocess input
        processed_input = self._preprocess_input(input_data, model_config)
        
        # Run inference
        predictions = await self._run_inference(model, processed_input)
        
        # Postprocess results
        confidence_scores = self._calculate_confidence(predictions)
        
        return self.Outputs(
            predictions=json.dumps(predictions.tolist()),
            confidence_scores=json.dumps(confidence_scores.tolist())
        )
    
    async def _load_model(self, model_path):
        # Model loading logic
        pass
    
    def _preprocess_input(self, data, config):
        # Preprocessing logic
        pass
    
    async def _run_inference(self, model, input_data):
        # Inference logic
        pass
    
    def _calculate_confidence(self, predictions):
        # Confidence calculation
        pass
```

## Error Handling Examples

### Robust Error Handling Node

A node that demonstrates comprehensive error handling patterns.

#### Error Handler Node

```python
import json
import traceback
from exospherehost import BaseNode
from pydantic import BaseModel

class RobustProcessingNode(BaseNode):
    class Inputs(BaseModel):
        data: str
        retry_count: str = "0"

    class Outputs(BaseModel):
        result: str
        error: str
        retry_count: str

    class Secrets(BaseModel):
        max_retries: str = "3"

    async def execute(self) -> Outputs:
        current_retry = int(self.inputs.retry_count)
        max_retries = int(self.secrets.max_retries)
        
        try:
            # Attempt processing
            result = await self._process_data(self.inputs.data)
            
            return self.Outputs(
                result=result,
                error="",
                retry_count=str(current_retry)
            )
            
        except ValueError as e:
            # Validation error - don't retry
            return self.Outputs(
                result="",
                error=f"validation_error: {str(e)}",
                retry_count=str(current_retry)
            )
            
        except Exception as e:
            # Processing error - retry if possible
            if current_retry < max_retries:
                # This will trigger a retry with incremented count
                raise Exception(f"retry_attempt_{current_retry + 1}: {str(e)}")
            else:
                return self.Outputs(
                    result="",
                    error=f"max_retries_exceeded: {str(e)}",
                    retry_count=str(current_retry)
                )
    
    async def _process_data(self, data):
        # Processing logic that might fail
        if not data:
            raise ValueError("Data cannot be empty")
        
        # Simulate processing
        return f"processed: {data}"
```

## Monitoring and Logging Examples

### Logging Node

A node that demonstrates proper logging and monitoring.

#### Logger Node

```python
import json
import logging
from datetime import datetime
from exospherehost import BaseNode
from pydantic import BaseModel

class LoggingNode(BaseNode):
    class Inputs(BaseModel):
        message: str
        log_level: str = "INFO"
        metadata: str = "{}"  # JSON string

    class Outputs(BaseModel):
        log_entry: str  # JSON string
        timestamp: str

    class Secrets(BaseModel):
        log_endpoint: str
        log_api_key: str

    async def execute(self) -> Outputs:
        metadata = json.loads(self.inputs.metadata)
        timestamp = datetime.now().isoformat()
        
        log_entry = {
            "message": self.inputs.message,
            "level": self.inputs.log_level,
            "timestamp": timestamp,
            "metadata": metadata,
            "node_id": "LoggingNode"
        }
        
        # Send to external logging service
        await self._send_log(log_entry)
        
        return self.Outputs(
            log_entry=json.dumps(log_entry),
            timestamp=timestamp
        )
    
    async def _send_log(self, log_entry):
        # Send log to external service
        async with httpx.AsyncClient() as client:
            await client.post(
                self.secrets.log_endpoint,
                headers={"Authorization": f"Bearer {self.secrets.log_api_key}"},
                json=log_entry
            )
```

## Best Practices Summary

### 1. Error Handling

- Always handle exceptions gracefully
- Provide meaningful error messages
- Implement retry logic for transient failures
- Use appropriate error types for different scenarios

### 2. Data Validation

- Validate inputs at the node level
- Use Pydantic for schema validation
- Handle edge cases and invalid data
- Provide clear error messages for validation failures

### 3. Performance

- Use async/await for I/O operations
- Implement proper resource cleanup
- Consider batching for large datasets
- Monitor and optimize execution time

### 4. Security

- Never log sensitive data
- Use secrets for API keys and credentials
- Validate and sanitize inputs
- Implement proper authentication

### 5. Monitoring

- Log important events and errors
- Track execution metrics
- Implement health checks
- Use structured logging

## Next Steps

- **[Concepts](./concepts.md)** - Learn about fanout, units, inputs, outputs, and secrets
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Tutorials](./tutorials.md)** - Step-by-step tutorials for common use cases
