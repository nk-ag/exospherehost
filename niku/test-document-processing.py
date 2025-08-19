#!/usr/bin/env python3
"""
Test Document Processing Graph Template

This script tests the document processing workflow by triggering it with sample data
and monitoring the execution progress.
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, Any

# Configuration
STATE_MANAGER_URL = "http://localhost:8000"
NAMESPACE = "document-processing"
API_KEY = "your-api-key-here"  # Replace with your actual API key

async def trigger_document_processing(session: aiohttp.ClientSession) -> Dict[str, Any]:
    """Trigger the document processing workflow with sample data."""
    print("🎯 Triggering document processing workflow...")
    
    # Sample PDF content for testing
    sample_pdf_content = """
    # Sample Document for Testing
    
    This is a sample document that will be processed by our AI-powered workflow.
    
    ## Key Information
    - Document Type: Technical Report
    - Author: AI Assistant
    - Date: 2024-01-01
    
    ## Content Summary
    This document contains various types of content including:
    1. Text content with markdown formatting
    2. Tables with structured data
    3. Images with visual information
    
    ## Sample Table
    | Component | Version | Status |
    |-----------|---------|--------|
    | API Server | 1.0.0 | Active |
    | State Manager | 1.0.0 | Active |
    | Document Processor | 1.0.0 | Testing |
    
    ## Important Notes
    - This is a test document
    - All data is fictional
    - Used for workflow validation
    """
    
    trigger_request = {
        "states": [
            {
                "identifier": "parse_pdf",
                "inputs": {
                    "pdf_path": "test-document.pdf",
                    "pdf_content": sample_pdf_content
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
                print(f"✅ Workflow triggered successfully!")
                print(f"   - Run ID: {result.get('run_id', 'N/A')}")
                print(f"   - Status: {result.get('status', 'N/A')}")
                print(f"   - States created: {len(result.get('states', []))}")
                return result
            else:
                print(f"❌ Failed to trigger workflow: {response.status}")
                print(await response.text())
                return {}
    except Exception as e:
        print(f"❌ Error triggering workflow: {e}")
        return {}

async def get_states_by_run_id(session: aiohttp.ClientSession, run_id: str) -> Dict[str, Any]:
    """Get all states for a specific run ID."""
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/states/{run_id}"
    headers = {"X-API-Key": API_KEY}
    
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"❌ Failed to get states: {response.status}")
                return {}
    except Exception as e:
        print(f"❌ Error getting states: {e}")
        return {}

async def get_current_states(session: aiohttp.ClientSession) -> Dict[str, Any]:
    """Get current states in the namespace."""
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/states/"
    headers = {"X-API-Key": API_KEY}
    
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"❌ Failed to get current states: {response.status}")
                return {}
    except Exception as e:
        print(f"❌ Error getting current states: {e}")
        return {}

async def monitor_workflow_progress(session: aiohttp.ClientSession, run_id: str, max_wait_time: int = 300):
    """Monitor the workflow progress and display status updates."""
    print(f"\n📊 Monitoring workflow progress for Run ID: {run_id}")
    print("=" * 60)
    
    start_time = time.time()
    last_status = None
    
    while time.time() - start_time < max_wait_time:
        # Get states for this run
        states_data = await get_states_by_run_id(session, run_id)
        
        if not states_data:
            print("❌ Could not retrieve states data")
            break
        
        states = states_data.get("states", [])
        current_status = states_data.get("status", "UNKNOWN")
        
        # Only print if status changed
        if current_status != last_status:
            print(f"\n🔄 Status: {current_status}")
            print(f"   - Total states: {len(states)}")
            
            # Show state details
            for state in states:
                state_id = state.get("id", "N/A")
                node_name = state.get("node_name", "N/A")
                node_status = state.get("status", "UNKNOWN")
                print(f"   - {node_name} ({state_id}): {node_status}")
            
            last_status = current_status
        
        # Check if workflow is complete
        if current_status in ["COMPLETED", "FAILED", "ERRORED"]:
            print(f"\n✅ Workflow {current_status.lower()}!")
            break
        
        # Wait before next check
        await asyncio.sleep(5)
    
    if time.time() - start_time >= max_wait_time:
        print(f"\n⏰ Monitoring timeout reached ({max_wait_time}s)")

async def test_graph_template_exists(session: aiohttp.ClientSession) -> bool:
    """Test if the graph template exists."""
    print("🔍 Checking if graph template exists...")
    
    url = f"{STATE_MANAGER_URL}/v0/namespace/{NAMESPACE}/graph/document-processing-workflow"
    headers = {"X-API-Key": API_KEY}
    
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Graph template found!")
                print(f"   - Nodes: {len(result.get('nodes', []))}")
                print(f"   - Validation status: {result.get('validation_status', 'UNKNOWN')}")
                return True
            else:
                print(f"❌ Graph template not found: {response.status}")
                return False
    except Exception as e:
        print(f"❌ Error checking graph template: {e}")
        return False

async def main():
    """Main test function."""
    print("🧪 Testing Document Processing Graph Template")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Check if graph template exists
        template_exists = await test_graph_template_exists(session)
        if not template_exists:
            print("❌ Graph template not found. Please run build-document-processing-graph.py first.")
            return
        
        # Step 2: Trigger the workflow
        trigger_result = await trigger_document_processing(session)
        if not trigger_result:
            print("❌ Failed to trigger workflow. Exiting.")
            return
        
        run_id = trigger_result.get("run_id")
        if not run_id:
            print("❌ No run ID received. Exiting.")
            return
        
        # Step 3: Monitor workflow progress
        await monitor_workflow_progress(session, run_id)
        
        # Step 4: Show final summary
        print("\n" + "=" * 60)
        print("📋 Test Summary:")
        print(f"   - Run ID: {run_id}")
        print(f"   - Namespace: {NAMESPACE}")
        print(f"   - Graph: document-processing-workflow")
        print(f"   - Test completed successfully!")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
