#!/usr/bin/env python3
"""
Build Document Processing Graph Template on Exosphere

This script registers the required nodes and creates a comprehensive document processing
and question-answering workflow graph template on the Exosphere state manager.
"""

import asyncio
import aiohttp
import json
from typing import List, Dict, Any

# Configuration
STATE_MANAGER_URL = "http://localhost:8000"
NAMESPACE = "document-processing"
API_KEY = "your-api-key-here"  # Replace with your actual API key

# Node definitions for the document processing workflow
DOCUMENT_PROCESSING_NODES = [
    {
        "node_name": "ParsePDFDocument",
        "namespace": NAMESPACE,
        "identifier": "parse_pdf",
        "description": "Parse PDF document into text, tables, and images",
        "inputs": {
            "pdf_path": "string",
            "pdf_content": "string"
        },
        "outputs": {
            "extracted_content": "object",
            "pdf_path": "string"
        }
    },
    {
        "node_name": "PreprocessMarkdownText",
        "namespace": NAMESPACE,
        "identifier": "preprocess_text",
        "description": "Clean markdown text and remove PII using AI",
        "inputs": {
            "extracted_content": "object",
            "openai_api_key": "secret"
        },
        "outputs": {
            "cleaned_markdown": "string",
            "original_text": "string"
        }
    },
    {
        "node_name": "PreprocessTables",
        "namespace": NAMESPACE,
        "identifier": "preprocess_tables",
        "description": "Convert tables to markdown format",
        "inputs": {
            "extracted_content": "object"
        },
        "outputs": {
            "markdown_tables": "array",
            "original_tables": "array"
        }
    },
    {
        "node_name": "AnalyzeImageContent",
        "namespace": NAMESPACE,
        "identifier": "analyze_images",
        "description": "Classify images as logos/symbols or content-bearing using AI",
        "inputs": {
            "extracted_content": "object",
            "openai_api_key": "secret"
        },
        "outputs": {
            "content_images": "array",
            "logo_images": "array"
        }
    },
    {
        "node_name": "GenerateImageDescriptions",
        "namespace": NAMESPACE,
        "identifier": "generate_descriptions",
        "description": "Generate descriptions for content-bearing images using AI",
        "inputs": {
            "content_images": "array",
            "openai_api_key": "secret"
        },
        "outputs": {
            "image_descriptions": "array"
        }
    },
    {
        "node_name": "DeduplicateImages",
        "namespace": NAMESPACE,
        "identifier": "deduplicate_images",
        "description": "Remove duplicate images using hashing",
        "inputs": {
            "image_descriptions": "array"
        },
        "outputs": {
            "unique_image_descriptions": "array"
        }
    },
    {
        "node_name": "CreateExtractedDocument",
        "namespace": NAMESPACE,
        "identifier": "create_document",
        "description": "Combine all processed content into unified document",
        "inputs": {
            "cleaned_markdown": "string",
            "markdown_tables": "array",
            "unique_image_descriptions": "array"
        },
        "outputs": {
            "extracted_document": "string",
            "document_sections": "array"
        }
    },
    {
        "node_name": "ChunkDocument",
        "namespace": NAMESPACE,
        "identifier": "chunk_document",
        "description": "Split document into manageable chunks",
        "inputs": {
            "extracted_document": "string"
        },
        "outputs": {
            "document_chunks": "array",
            "chunk_count": "number"
        }
    },
    {
        "node_name": "GenerateQuestion",
        "namespace": NAMESPACE,
        "identifier": "generate_question",
        "description": "Generate questions based on document chunks using AI",
        "inputs": {
            "chunk": "string",
            "openai_api_key": "secret"
        },
        "outputs": {
            "generated_question": "string",
            "source_chunk": "string"
        }
    },
    {
        "node_name": "GenerateAnswer",
        "namespace": NAMESPACE,
        "identifier": "generate_answer",
        "description": "Generate answers to questions using document content and AI",
        "inputs": {
            "source_chunk": "string",
            "generated_question": "string",
            "openai_api_key": "secret"
        },
        "outputs": {
            "generated_answer": "string",
            "question": "string",
            "source_chunk": "string"
        }
    },
    {
        "node_name": "VerifyAnswer",
        "namespace": NAMESPACE,
        "identifier": "verify_answer",
        "description": "Verify answer quality and accuracy using AI",
        "inputs": {
            "generated_answer": "string",
            "question": "string",
            "source_chunk": "string",
            "openai_api_key": "secret"
        },
        "outputs": {
            "verification_results": "string",
            "is_correct": "boolean",
            "is_relevant": "boolean",
            "is_biased": "boolean",
            "is_hallucination": "boolean",
            "answer": "string",
            "question": "string"
        }
    },
    {
        "node_name": "CreateFinalReport",
        "namespace": NAMESPACE,
        "identifier": "create_report",
        "description": "Generate comprehensive processing report",
        "inputs": {
            "verification_results": "array"
        },
        "outputs": {
            "final_report": "object"
        }
    }
]

async def register_nodes(session: aiohttp.ClientSession) -> bool:
    """Register all the document processing nodes."""
    print("📋 Registering document processing nodes...")
    
    register_request = {
        "nodes": DOCUMENT_PROCESSING_NODES
    }
    
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/nodes/"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    try:
        async with session.put(url, json=register_request, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Successfully registered {len(DOCUMENT_PROCESSING_NODES)} nodes")
                print(f"   - Registered nodes: {result.get('count', 0)}")
                return True
            else:
                print(f"❌ Failed to register nodes: {response.status}")
                print(await response.text())
                return False
    except Exception as e:
        print(f"❌ Error registering nodes: {e}")
        return False

async def create_graph_template(session: aiohttp.ClientSession) -> bool:
    """Create the document processing graph template."""
    print("\n📊 Creating document processing graph template...")
    
    # Define the graph structure with proper node connections
    graph_nodes = [
        {
            "node_name": "ParsePDFDocument",
            "namespace": NAMESPACE,
            "identifier": "parse_pdf",
            "inputs": {
                "pdf_path": "initial",
                "pdf_content": "initial"
            },
            "next_nodes": ["preprocess_text", "preprocess_tables", "analyze_images"]
        },
        {
            "node_name": "PreprocessMarkdownText",
            "namespace": NAMESPACE,
            "identifier": "preprocess_text",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["create_document"]
        },
        {
            "node_name": "PreprocessTables",
            "namespace": NAMESPACE,
            "identifier": "preprocess_tables",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}"
            },
            "next_nodes": ["create_document"]
        },
        {
            "node_name": "AnalyzeImageContent",
            "namespace": NAMESPACE,
            "identifier": "analyze_images",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["generate_descriptions"]
        },
        {
            "node_name": "GenerateImageDescriptions",
            "namespace": NAMESPACE,
            "identifier": "generate_descriptions",
            "inputs": {
                "content_images": "${{ analyze_images.outputs.content_images }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["deduplicate_images"]
        },
        {
            "node_name": "DeduplicateImages",
            "namespace": NAMESPACE,
            "identifier": "deduplicate_images",
            "inputs": {
                "image_descriptions": "${{ generate_descriptions.outputs.image_descriptions }}"
            },
            "next_nodes": ["create_document"]
        },
        {
            "node_name": "CreateExtractedDocument",
            "namespace": NAMESPACE,
            "identifier": "create_document",
            "inputs": {
                "cleaned_markdown": "${{ preprocess_text.outputs.cleaned_markdown }}",
                "markdown_tables": "${{ preprocess_tables.outputs.markdown_tables }}",
                "unique_image_descriptions": "${{ deduplicate_images.outputs.unique_image_descriptions }}"
            },
            "next_nodes": ["chunk_document"]
        },
        {
            "node_name": "ChunkDocument",
            "namespace": NAMESPACE,
            "identifier": "chunk_document",
            "inputs": {
                "extracted_document": "${{ create_document.outputs.extracted_document }}"
            },
            "next_nodes": ["generate_question"]
        },
        {
            "node_name": "GenerateQuestion",
            "namespace": NAMESPACE,
            "identifier": "generate_question",
            "inputs": {
                "chunk": "${{ chunk_document.outputs.document_chunks }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["generate_answer"]
        },
        {
            "node_name": "GenerateAnswer",
            "namespace": NAMESPACE,
            "identifier": "generate_answer",
            "inputs": {
                "source_chunk": "${{ generate_question.outputs.source_chunk }}",
                "generated_question": "${{ generate_question.outputs.generated_question }}",
                "openai_api_key": "secret"
            },
            "next_nodes": ["verify_answer"]
        },
        {
            "node_name": "VerifyAnswer",
            "namespace": NAMESPACE,
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
            "node_name": "CreateFinalReport",
            "namespace": NAMESPACE,
            "identifier": "create_report",
            "inputs": {
                "verification_results": "${{ verify_answer.outputs.verification_results }}"
            },
            "next_nodes": []
        }
    ]
    
    graph_request = {
        "secrets": {
            "openai_api_key": True  # This will be provided during execution
        },
        "nodes": graph_nodes
    }
    
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/graph/document-processing-workflow"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    try:
        async with session.put(url, json=graph_request, headers=headers) as response:
            if response.status == 201:
                result = await response.json()
                print(f"✅ Graph template created successfully!")
                print(f"   - Graph name: document-processing-workflow")
                print(f"   - Nodes: {len(graph_nodes)}")
                print(f"   - Validation status: {result.get('validation_status', 'UNKNOWN')}")
                if result.get('validation_errors'):
                    print(f"   - Validation errors: {result['validation_errors']}")
                return True
            else:
                print(f"❌ Failed to create graph template: {response.status}")
                print(await response.text())
                return False
    except Exception as e:
        print(f"❌ Error creating graph template: {e}")
        return False

async def trigger_graph_execution(session: aiohttp.ClientSession) -> bool:
    """Trigger the document processing graph with sample data."""
    print("\n🎯 Triggering document processing graph execution...")
    
    trigger_request = {
        "states": [
            {
                "identifier": "parse_pdf",
                "inputs": {
                    "pdf_path": "sample-document.pdf",
                    "pdf_content": "Sample PDF content for testing"
                }
            }
        ]
    }
    
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/graph/document-processing-workflow/trigger"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    try:
        async with session.post(url, json=trigger_request, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Graph triggered successfully!")
                print(f"   - Run ID: {result.get('run_id', 'N/A')}")
                print(f"   - Status: {result.get('status', 'N/A')}")
                print(f"   - States created: {len(result.get('states', []))}")
                return True
            else:
                print(f"❌ Failed to trigger graph: {response.status}")
                print(await response.text())
                return False
    except Exception as e:
        print(f"❌ Error triggering graph: {e}")
        return False

async def main():
    """Main function to build the document processing graph template."""
    print("🚀 Building Document Processing Graph Template on Exosphere")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Register nodes
        nodes_registered = await register_nodes(session)
        if not nodes_registered:
            print("❌ Failed to register nodes. Exiting.")
            return
        
        # Step 2: Create graph template
        graph_created = await create_graph_template(session)
        if not graph_created:
            print("❌ Failed to create graph template. Exiting.")
            return
        
        # Step 3: Trigger graph execution (optional)
        print("\n" + "=" * 60)
        print("🎉 Document Processing Graph Template Successfully Built!")
        print("\n📋 Summary:")
        print(f"   - Namespace: {NAMESPACE}")
        print(f"   - Graph name: document-processing-workflow")
        print(f"   - Nodes registered: {len(DOCUMENT_PROCESSING_NODES)}")
        print(f"   - API endpoint: {STATE_MANAGER_URL}")
        
        print("\n🔧 Next Steps:")
        print("1. Set your OpenAI API key in the secrets when triggering the graph")
        print("2. Provide actual PDF content or file path")
        print("3. Monitor the workflow execution through the state manager")
        
        print("\n📖 Usage Example:")
        print(f"curl -X POST '{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/graph/document-processing-workflow/trigger' \\")
        print(f"  -H 'X-API-Key: {API_KEY}' \\")
        print(f"  -H 'Content-Type: application/json' \\")
        print("  -d '{")
        print('    "states": [{')
        print('      "identifier": "parse_pdf",')
        print('      "inputs": {')
        print('        "pdf_path": "your-document.pdf",')
        print('        "pdf_content": "Your PDF content here"')
        print('      }')
        print('    }]')
        print("  }'")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
