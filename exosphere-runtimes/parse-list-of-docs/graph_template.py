#!/usr/bin/env python3
"""
Parse List of Docs Graph Template

This file defines the graph template for the simplified document processing workflow.
It processes a list of documents from S3: list files → parse each PDF → upload each to S3.
"""

import asyncio
import aiohttp
import os

# Graph Template Definition
PARSE_LIST_OF_DOCS_GRAPH_TEMPLATE = {
    "secrets": {
        "openai_api_key": "testkey",
        "aws_access_key_id": "testkey",
        "aws_secret_access_key": "testkey",
        "aws_region": "us-east-1"
    },
    "nodes": [
        {
            "node_name": "ListS3FilesNode",
            "namespace": "parse-list-of-docs",
            "identifier": "list_files",
            "inputs": {
                "bucket_name": "initial",
                "prefix": "initial",
                "files_only": "true",
                "recursive": "false"
            },
            "next_nodes": ["parse_pdf"]
        },
        {
            "node_name": "ParseSinglePDFNode",
            "namespace": "parse-list-of-docs",
            "identifier": "parse_pdf",
            "inputs": {
                "bucket_name": "initial",
                "key": "${{ list_files.outputs.key }}"
            },
            "next_nodes": ["upload_to_s3"]
        },

        {
            "node_name": "UploadToS3Node",
            "namespace": "parse-list-of-docs",
            "identifier": "upload_to_s3",
            "inputs": {
                "extracted_content": "${{ parse_pdf.outputs.extracted_content }}",
                "key": "${{ parse_pdf.outputs.key }}",
                "output_bucket": "processed-docs-bucket",
                "output_prefix": "processed-documents/"
            },
            "next_nodes": []
        }
    ]
}

async def create_graph_template(graph_name: str):
    """Create a graph template with simplified document processing nodes"""
    namespace = "parse-list-of-docs"
    api_key = os.getenv("STATE_MANAGER_API_KEY")  # TODO: Replace with your actual API key
    
    graph_request = {
        "secrets": {
            "openai_api_key": "testkey",
            "aws_access_key_id": "testkey",
            "aws_secret_access_key": "testkey",
            "aws_region": "us-east-1"
        },
        "nodes": PARSE_LIST_OF_DOCS_GRAPH_TEMPLATE["nodes"]
    }
    
    async with aiohttp.ClientSession() as session:
        # Create the graph template
        url = f"http://localhost:8000/v0/namespace/{namespace}/graph/{graph_name}"
        headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        
        try:
            async with session.put(url, json=graph_request, headers=headers) as response:
                if response.status == 201:
                    print(f"Parse list of docs graph template created successfully: {graph_name}")
                    return graph_name
                else:
                    print(f"Failed to create graph template: {response.status}")
                    print(await response.text())
                    return None
        except Exception as e:
            print(f"Error creating graph template: {e}")
            return None

async def trigger_graph_execution(graph_name: str):
    """Trigger the first node using the new trigger graph API endpoint"""
    namespace = "parse-list-of-docs"
    api_key = "niki"  # TODO: Replace with your actual API key
    
    # Trigger graph with the first node
    trigger_request = {
        "states": [
            {
                "identifier": "list_files",
                "inputs": {
                    "bucket_name": "my-documents-bucket",
                    "prefix": "pdfs/"
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
                    print("✅ Parse list of docs graph triggered successfully!")
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


async def main():
    """Main function to create graph and trigger workflow"""
    print("🚀 Starting Parse List of Docs workflow setup...")
    
    # Step 1: Create the graph template
    print("\n📋 Step 1: Creating parse list of docs graph template...")
    graph_name = "parse-list-of-docs-workflow"
    # await create_graph_template(graph_name)
    
    # Step 2: Trigger the graph execution
    print("\n🎯 Step 2: Triggering parse list of docs workflow...")
    state_id, run_id = await trigger_graph_execution(graph_name)
    
    if state_id and run_id:
        print("\n✅ Parse list of docs workflow initiated successfully!")
        print("   The workflow will now execute:")
        print("   1. ListS3FilesNode (list_files) - List PDF files from S3")
        print("   2. ParseSinglePDFNode (parse_pdf) - Parse each PDF file")
        print("   3. UploadToS3Node (upload_to_s3) - Upload processed document to S3")
        print(f"\n   State ID: {state_id}")
        print(f"   Run ID: {run_id}")
        print(f"   Graph: {graph_name}")
    else:
        print("❌ Failed to trigger parse list of docs workflow.")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
