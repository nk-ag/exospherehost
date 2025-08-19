#!/usr/bin/env python3
"""
Document Processing Graph Template

This file defines the graph template for the document processing and question-answering workflow.
It can be used to create the graph template in the state manager.
"""

import asyncio
import aiohttp
import json
from typing import List

# Graph Template Definition
DOCUMENT_PROCESSING_GRAPH_TEMPLATE = {
    "name": "Document Processing and QA Workflow",
    "description": "Comprehensive document processing pipeline with AI-powered question generation and answer verification",
    "version": "1.0",
    "namespace": "document-processing",
    "secrets": {
        "openai_api_key": "testkey"  # This will be provided during execution
    },
    "nodes": [
        {
            "node_name": "ParsePDFDocumentNode",
            "namespace": "document-processing",
            "identifier": "parse_pdf",
            "inputs": {
                "pdf_path": "initial",
                "pdf_content": "initial"
            },
            "next_nodes": ["preprocess_text", "preprocess_tables", "analyze_images"]
        },
        {
            "node_name": "PreprocessMarkdownTextNode",
            "namespace": "document-processing",
            "identifier": "preprocess_text",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["merge_content"]
        },
        {
            "node_name": "PreprocessTablesNode",
            "namespace": "document-processing",
            "identifier": "preprocess_tables",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}"
            },
            "next_nodes": ["merge_content"]
        },
        {
            "node_name": "AnalyzeImageContentNode",
            "namespace": "document-processing",
            "identifier": "analyze_images",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["generate_descriptions"]
        },
        {
            "node_name": "GenerateImageDescriptionsNode",
            "namespace": "document-processing",
            "identifier": "generate_descriptions",
            "inputs": {
                "content_images": "${{ analyze_images.outputs.content_images }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["deduplicate_images"]
        },
        {
            "node_name": "DeduplicateImagesNode",
            "namespace": "document-processing",
            "identifier": "deduplicate_images",
            "inputs": {
                "image_descriptions": "${{ generate_descriptions.outputs.image_descriptions }}"
            },
            "next_nodes": ["merge_content"]
        },
        {
            "node_name": "CreateExtractedDocumentNode",
            "namespace": "document-processing",
            "identifier": "merge_content",
            "inputs": {
                "cleaned_markdown": "${{ preprocess_text.outputs.cleaned_markdown }}",
                "markdown_tables": "${{ preprocess_tables.outputs.markdown_tables }}",
                "unique_image_descriptions": "${{ deduplicate_images.outputs.unique_image_descriptions }}"
            },
            "next_nodes": ["chunk_document"]
        },
        {
            "node_name": "ChunkDocumentNode",
            "namespace": "document-processing",
            "identifier": "chunk_document",
            "inputs": {
                "extracted_document": "${{ merge_content.outputs.extracted_document }}"
            },
            "next_nodes": ["generate_question"]
        },
        {
            "node_name": "GenerateQuestionNode",
            "namespace": "document-processing",
            "identifier": "generate_question",
            "inputs": {
                "chunk": "${{ chunk_document.outputs.document_chunks }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["generate_answer"]
        },
        {
            "node_name": "GenerateAnswerNode",
            "namespace": "document-processing",
            "identifier": "generate_answer",
            "inputs": {
                "source_chunk": "${{ generate_question.outputs.source_chunk }}",
                "generated_question": "${{ generate_question.outputs.generated_question }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["verify_answer"]
        },
        {
            "node_name": "VerifyAnswerNode",
            "namespace": "document-processing",
            "identifier": "verify_answer",
            "inputs": {
                "generated_answer": "${{ generate_answer.outputs.generated_answer }}",
                "question": "${{ generate_answer.outputs.question }}",
                "source_chunk": "${{ generate_answer.outputs.source_chunk }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["create_report"]
        },
        {
            "node_name": "CreateFinalReportNode",
            "namespace": "document-processing",
            "identifier": "create_report",
            "inputs": {
                "verification_results": "${{ verify_answer.outputs.verification_results }}"
            },
            "next_nodes": []
        }
    ]
}

async def create_graph_template(graph_name: str):
    """Create a graph template with document processing nodes"""
    namespace = "document-processing"
    api_key = "niki"  # TODO: Replace with your actual API key
    
    graph_request = {
        "secrets": {
            "openai_api_key": "testkey"
        },
        "nodes": DOCUMENT_PROCESSING_GRAPH_TEMPLATE["nodes"]
    }
    
    async with aiohttp.ClientSession() as session:
        # Create the graph template
        url = f"http://localhost:8000/v0/namespace/{namespace}/graph/{graph_name}"
        headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        
        try:
            async with session.put(url, json=graph_request, headers=headers) as response:
                if response.status == 201:
                    print(f"✅ Document processing graph template created successfully: {graph_name}")
                    return graph_name
                else:
                    print(f"❌ Failed to create graph template: {response.status}")
                    print(await response.text())
                    return None
        except Exception as e:
            print(f"❌ Error creating graph template: {e}")
            return None

async def trigger_graph_execution(graph_name: str):
    """Trigger the first node using the new trigger graph API endpoint"""
    namespace = "document-processing"
    api_key = "niki"  # TODO: Replace with your actual API key
    
    # Trigger graph with the first node
    trigger_request = {
        "states": [
            {
                "identifier": "parse_pdf",
                "inputs": {
                    "pdf_path": "sample-document.pdf",
                    "pdf_content": "Sample PDF content for testing the document processing workflow..."
                }
            }
        ]
    }
    
    async with aiohttp.ClientSession() as session:
        url = f"http://localhost:8000/v0/namespace/{namespace}/graph/{graph_name}/trigger"
        headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        
        try:
            async with session.post(url, json=trigger_request, headers=headers) as response:
                if response.status == 200:
                    response_data = await response.json()
                    print(f"✅ Document processing graph triggered successfully!")
                    print(f"   - Graph: {graph_name}")
                    print(f"   - Run ID: {response_data['run_id']}")
                    print(f"   - State ID: {response_data['states'][0]['state_id']}")
                    print(f"   - Node: {response_data['states'][0]['node_name']}")
                    print(f"   - Status: {response_data['status']}")
                    return response_data['states'][0]['state_id'], response_data['run_id']
                else:
                    print(f"❌ Failed to trigger graph: {response.status}")
                    print(await response.text())
                    return None, None
        except Exception as e:
            print(f"❌ Error triggering graph: {e}")
            return None, None

# Example trigger request
EXAMPLE_TRIGGER_REQUEST = {
    "states": [
        {
            "identifier": "parse_pdf",
            "inputs": {
                "pdf_path": "sample-document.pdf",
                "pdf_content": "Sample PDF content for testing the workflow..."
            }
        }
    ]
}

# Example secrets
EXAMPLE_SECRETS = {
    "openai_api_key": "sk-your-openai-api-key-here"
}

async def main():
    """Main function to create graph and trigger workflow"""
    print("🚀 Starting Document Processing workflow setup...")
    
    # Step 1: Create the graph template
    print("\n📋 Step 1: Creating document processing graph template...")
    graph_name = "document-processing-workflow"
    await create_graph_template(graph_name)
    
    # Step 2: Trigger the graph execution
    print("\n🎯 Step 2: Triggering document processing workflow...")
    state_id, run_id = await trigger_graph_execution(graph_name)
    
    if state_id and run_id:
        print(f"\n✅ Document processing workflow initiated successfully!")
        print(f"   The workflow will now execute:")
        print(f"   1. ParsePDFDocumentNode (parse_pdf) - Extract content from PDF")
        print(f"   2. PreprocessMarkdownTextNode (preprocess_text) - Clean and format text")
        print(f"   3. PreprocessTablesNode (preprocess_tables) - Process table data")
        print(f"   4. AnalyzeImageContentNode (analyze_images) - Analyze images in document")
        print(f"   5. GenerateImageDescriptionsNode (generate_descriptions) - Generate image descriptions")
        print(f"   6. DeduplicateImagesNode (deduplicate_images) - Remove duplicate images")
        print(f"   7. CreateExtractedDocumentNode (merge_content) - Combine all processed content")
        print(f"   8. ChunkDocumentNode (chunk_document) - Split document into chunks")
        print(f"   9. GenerateQuestionNode (generate_question) - Generate questions from chunks")
        print(f"   10. GenerateAnswerNode (generate_answer) - Generate answers to questions")
        print(f"   11. VerifyAnswerNode (verify_answer) - Verify answer accuracy")
        print(f"   12. CreateFinalReportNode (create_report) - Create final report")
        print(f"\n   State ID: {state_id}")
        print(f"   Run ID: {run_id}")
        print(f"   Graph: {graph_name}")
    else:
        print("❌ Failed to trigger document processing workflow.")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
