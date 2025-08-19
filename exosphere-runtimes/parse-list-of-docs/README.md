# Parse List of Docs Runtime

A simplified document processing workflow for parsing multiple documents from S3, generating Q&A pairs, and uploading reports back to S3.

## Workflow Overview

This runtime implements a streamlined document processing pipeline:

1. **ListS3FilesNode** - Lists PDF files from an S3 bucket
2. **ParseSinglePDFNode** - Parses a single PDF file from S3
3. **ChunkDocumentNode** - Splits document content into manageable chunks
4. **GenerateQuestionNode** - Generates questions from document chunks
5. **GenerateAnswerNode** - Generates answers to the questions
6. **VerifyAnswerNode** - Verifies the accuracy of generated answers
7. **CreateReportNode** - Creates final reports from verification results
8. **UploadToS3Node** - Uploads reports back to S3

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
EXOSPHERE_STATE_MANAGER_URI=http://localhost:8000
EXOSPHERE_API_KEY=your-api-key
```

3. Register the runtime:
```bash
python main.py
```

## Usage

Run the graph template to register and trigger the workflow:

```bash
python graph_template.py
```

This will:
- Register the graph template with the state manager
- Trigger the workflow with sample S3 bucket and prefix
- Process the first PDF file in the list
- Generate Q&A for the first chunk
- Create and upload a report

## Configuration

Update the following in `graph_template.py`:
- API keys and secrets
- S3 bucket names and prefixes
- Chunk size and overlap parameters

## Node Details

### ListS3FilesNode
- **Inputs**: `bucket_name`, `prefix`
- **Outputs**: `file_list`, `bucket_name`
- **Secrets**: AWS credentials

### ParseSinglePDFNode
- **Inputs**: `file_key`, `bucket_name`
- **Outputs**: `extracted_content`, `file_key`, `document_title`
- **Secrets**: AWS credentials

### ChunkDocumentNode
- **Inputs**: `extracted_content`, `file_key`, `chunk_size`, `overlap`
- **Outputs**: `chunks`, `file_key`, `total_chunks`

### GenerateQuestionNode
- **Inputs**: `chunk`
- **Outputs**: `source_chunk`, `generated_question`, `chunk_id`
- **Secrets**: OpenAI API key

### GenerateAnswerNode
- **Inputs**: `source_chunk`, `generated_question`, `chunk_id`
- **Outputs**: `generated_answer`, `question`, `source_chunk`, `chunk_id`
- **Secrets**: OpenAI API key

### VerifyAnswerNode
- **Inputs**: `generated_answer`, `question`, `source_chunk`, `chunk_id`
- **Outputs**: `verification_results`, `chunk_id`, `file_key`
- **Secrets**: OpenAI API key

### CreateReportNode
- **Inputs**: `verification_results`, `chunk_id`, `file_key`
- **Outputs**: `final_report`, `file_key`

### UploadToS3Node
- **Inputs**: `final_report`, `file_key`, `output_bucket`, `output_prefix`
- **Outputs**: `upload_status`, `s3_key`, `file_key`
- **Secrets**: AWS credentials

## Notes

- This is a simplified implementation with simulated S3 operations
- In production, replace simulated functions with actual AWS SDK calls
- The workflow processes one file and one chunk at a time
- For processing multiple files/chunks, you would need to implement loops or parallel processing
