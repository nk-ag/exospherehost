
import asyncio
import aiohttp
import json
from typing import List

async def create_graph_template(graph_name: str):
    """Create a graph template with multiple nodes"""
    namespace = "testnamespace"
    api_key = "niki"
    
    # Define the graph structure
    graph_nodes = [
        {
            "node_name": "TestNode2",
            "namespace": namespace,
            "identifier": "node1",
            "inputs": {
                "x": "initial",
                "y": "data"
            },
            "next_nodes": ["node2"]
        },
        {
            "node_name": "DataProcessorNode", 
            "namespace": namespace,
            "identifier": "node2",
            "inputs": {
                "data": "${{ node1.outputs.processed_data }}",
                "operation": "uppercase"
            },
            "next_nodes": ["node3"]
        },
        {
            "node_name": "FinalOutputNode",
            "namespace": namespace,
            "identifier": "node3", 
            "inputs": {
                "node1_output": "${{ node1.outputs.x }}",
                "node2_result": "${{ node2.outputs.processed_result }}",
                "node2_operation": "${{ node2.outputs.operation_type }}"
            },
            "next_nodes": []
        }
    ]
    
    graph_request = {
        "secrets": {},
        "nodes": graph_nodes
    }
    
    async with aiohttp.ClientSession() as session:
        # Create the graph template
        url = f"http://localhost:8000/v0/namespace/{namespace}/graph/{graph_name}"
        headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        
        try:
            async with session.put(url, json=graph_request, headers=headers) as response:
                if response.status == 201:
                    print(f"✅ Graph template created successfully: {graph_name}")
                    return graph_name
                else:
                    print(f"❌ Failed to create graph template: {response.status}")
                    print(await response.text())
                    return None
        except Exception as e:
            print(f"❌ Error creating graph template: {e}")
            return None

async def trigger_first_node(graph_name: str):
    """Trigger the first node using the state/create API endpoint"""
    namespace = "testnamespace"
    api_key = "niki"
    
    # Create state for the first node
    state_request = {
        "states": [
            {
                "identifier": "node1",
                "inputs": {
                    "x": "hello",
                    "y": "world"
                }
            }
        ]
    }
    
    async with aiohttp.ClientSession() as session:
        url = f"http://localhost:8000/v0/namespace/{namespace}/graph/{graph_name}/states/create"
        headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        
        try:
            async with session.post(url, json=state_request, headers=headers) as response:
                if response.status == 200:
                    response_data = await response.json()
                    print(f"✅ State created successfully!")
                    print(f"   - Graph: {graph_name}")
                    print(f"   - State ID: {response_data['states'][0]['state_id']}")
                    print(f"   - Node: {response_data['states'][0]['node_name']}")
                    print(f"   - Status: {response_data['status']}")
                    return response_data['states'][0]['state_id']
                else:
                    print(f"❌ Failed to create state: {response.status}")
                    print(await response.text())
                    return None
        except Exception as e:
            print(f"❌ Error creating state: {e}")
            return None

async def main():
    """Main function to create graph and trigger workflow"""
    print("🚀 Starting Niku multi-node workflow setup...")
    
    # Step 1: Create the graph template
    # print("\n📋 Step 1: Creating graph template...")
    graph_name = "niku-multi-node-workflow"
    await create_graph_template(graph_name)
    
    # if not graph_name:
    #     print("❌ Failed to create graph template. Exiting.")
    #     return
    
    # Step 2: Trigger the first node
    print("\n🎯 Step 2: Triggering first node...")
    state_id = await trigger_first_node(graph_name)
    
    if state_id:
        print(f"\n✅ Workflow initiated successfully!")
        print(f"   The workflow will now execute:")
        print(f"   1. TestNode2 (node1) - Process initial data")
        print(f"   2. DataProcessorNode (node2) - Process node1 output")
        print(f"   3. FinalOutputNode (node3) - Combine all results")
        print(f"\n   State ID: {state_id}")
        print(f"   Graph: {graph_name}")
    else:
        print("❌ Failed to trigger workflow.")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
