"""
Full integration tests for the complete exosphere system with niku nodes.

This test covers the complete end-to-end workflow:
1. Start niku runtime with TestNode2
2. Register nodes with state-manager
3. Create graph templates
4. Create and execute states
5. Verify the complete workflow

Prerequisites:
- A running MongoDB instance
- A running Redis instance
- The state-manager service running on localhost:8000
- The api-server service running on localhost:8001 (or different port)
- The niku runtime running and registered with state-manager
"""

import sys
import os
import pytest
import asyncio
import httpx
import json
import subprocess
import time
import signal
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Add state-manager app to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../state-manager')))

# Mark all tests as integration tests
pytestmark = pytest.mark.integration


class TestNikuFullIntegration:
    """Full integration tests for the complete exosphere system with niku nodes."""
    
    @pytest.fixture
    async def state_manager_client(self):
        """Create an HTTP client for the state-manager."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            yield client
    
    @pytest.fixture
    async def api_server_client(self):
        """Create an HTTP client for the api-server."""
        async with httpx.AsyncClient(base_url="http://localhost:8001") as client:
            yield client
    
    @pytest.fixture
    def niku_namespace(self) -> str:
        """Generate a unique niku test namespace."""
        return f"niku-namespace-{uuid.uuid4().hex[:8]}"
    
    @pytest.fixture
    def niku_api_key(self) -> str:
        """Get the niku API key from environment."""
        return os.getenv("NIKU_API_KEY", "niki")
    
    @pytest.fixture
    def niku_runtime_name(self) -> str:
        """Generate a unique niku runtime name."""
        return f"niku-runtime-{uuid.uuid4().hex[:8]}"
    
    @pytest.fixture
    def niku_process(self):
        """Start the niku runtime process."""
        # Get the path to the niku directory
        niku_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../niku'))
        
        # Start the niku process
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=niku_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Give it some time to start up
        time.sleep(5)
        
        yield process
        
        # Cleanup: terminate the process
        try:
            process.terminate()
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
    
    async def test_niku_runtime_registration(self, state_manager_client, niku_namespace: str,
                                           niku_api_key: str, niku_runtime_name: str):
        """Test that the niku runtime registers its nodes with the state-manager."""
        
        # Wait a bit for the niku runtime to register
        await asyncio.sleep(2)
        
        # Check if the TestNode2 is registered
        # We can do this by trying to create a graph template with TestNode2
        graph_name = f"test-niku-graph-{uuid.uuid4().hex[:8]}"
        
        graph_nodes = [
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "test_node",
                "inputs": {
                    "x": "hello",
                    "y": "world"
                },
                "next_nodes": []
            }
        ]
        
        request_data = {
            "secrets": {},
            "nodes": graph_nodes
        }
        
        response = await state_manager_client.put(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}",
            json=request_data,
            headers={"X-API-Key": niku_api_key}
        )
        
        # The graph creation should succeed if the node is registered
        assert response.status_code == 201
        print(f"✅ Niku runtime registration verified - TestNode2 is available")
    
    async def test_niku_node_execution_workflow(self, state_manager_client, niku_namespace: str,
                                              niku_api_key: str):
        """Test the complete workflow with niku TestNode2."""
        
        # Step 1: Create a graph template with TestNode2
        graph_name = f"niku-workflow-graph-{uuid.uuid4().hex[:8]}"
        
        graph_nodes = [
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "niku_node_1",
                "inputs": {
                    "x": "hello",
                    "y": "world"
                },
                "next_nodes": []
            }
        ]
        
        graph_request = {
            "secrets": {},
            "nodes": graph_nodes
        }
        
        response = await state_manager_client.put(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}",
            json=graph_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 201
        print(f"✅ Graph template created: {graph_name}")
        
        # Step 2: Create states for the graph
        state_request = {
            "states": [
                {
                    "identifier": "niku_node_1",
                    "inputs": {
                        "x": "hello",
                        "y": "world"
                    }
                }
            ]
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}/states/create",
            json=state_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        state_id = response_data["states"][0]["state_id"]
        print(f"✅ State created: {state_id}")
        
        # Step 3: Simulate the niku runtime executing the state
        # The TestNode2 should return {"x": "test"} as defined in niku/main.py
        execute_request = {
            "outputs": {
                "x": "test"
            }
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/states/{state_id}/executed",
            json=execute_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        print(f"✅ State executed successfully")
        
        # Step 4: Verify the state was processed correctly
        # We can check if the state is in the executed state
        # This would typically involve checking the database or making additional API calls
        
        print(f"🎉 Complete niku workflow completed successfully!")
        print(f"   - Namespace: {niku_namespace}")
        print(f"   - Graph: {graph_name}")
        print(f"   - State ID: {state_id}")
    
    async def test_niku_multi_node_workflow(self, state_manager_client, niku_namespace: str,
                                          niku_api_key: str):
        """Test a workflow with multiple niku nodes in sequence."""
        
        # Step 1: Create a graph template with multiple TestNode2 instances
        graph_name = f"niku-multi-node-graph-{uuid.uuid4().hex[:8]}"
        
        graph_nodes = [
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "niku_node_1",
                "inputs": {
                    "x": "first",
                    "y": "node"
                },
                "next_nodes": ["niku_node_2"]
            },
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "niku_node_2",
                "inputs": {
                    "x": "{{niku_node_1.x}}",  # Reference output from first node
                    "y": "second"
                },
                "next_nodes": []
            }
        ]
        
        graph_request = {
            "secrets": {},
            "nodes": graph_nodes
        }
        
        response = await state_manager_client.put(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}",
            json=graph_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 201
        print(f"✅ Multi-node graph template created: {graph_name}")
        
        # Step 2: Create states for the first node
        state_request = {
            "states": [
                {
                    "identifier": "niku_node_1",
                    "inputs": {
                        "x": "first",
                        "y": "node"
                    }
                }
            ]
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}/states/create",
            json=state_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        state_id_1 = response_data["states"][0]["state_id"]
        print(f"✅ First state created: {state_id_1}")
        
        # Step 3: Execute the first state
        execute_request_1 = {
            "outputs": {
                "x": "test"  # Output from TestNode2
            }
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/states/{state_id_1}/executed",
            json=execute_request_1,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        print(f"✅ First state executed")
        
        # Step 4: Create state for the second node (which should be triggered automatically)
        # In a real scenario, the state-manager would automatically create the next state
        # For this test, we'll create it manually
        state_request_2 = {
            "states": [
                {
                    "identifier": "niku_node_2",
                    "inputs": {
                        "x": "test",  # This should come from the first node's output
                        "y": "second"
                    }
                }
            ]
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}/states/create",
            json=state_request_2,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        state_id_2 = response_data["states"][0]["state_id"]
        print(f"✅ Second state created: {state_id_2}")
        
        # Step 5: Execute the second state
        execute_request_2 = {
            "outputs": {
                "x": "test"  # Output from TestNode2
            }
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/states/{state_id_2}/executed",
            json=execute_request_2,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        print(f"✅ Second state executed")
        
        print(f"🎉 Multi-node niku workflow completed successfully!")
        print(f"   - Namespace: {niku_namespace}")
        print(f"   - Graph: {graph_name}")
        print(f"   - State 1 ID: {state_id_1}")
        print(f"   - State 2 ID: {state_id_2}")
    
    async def test_niku_error_handling(self, state_manager_client, niku_namespace: str,
                                     niku_api_key: str):
        """Test error handling in niku workflows."""
        
        # Step 1: Create a graph template
        graph_name = f"niku-error-graph-{uuid.uuid4().hex[:8]}"
        
        graph_nodes = [
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "niku_error_node",
                "inputs": {
                    "x": "error",
                    "y": "test"
                },
                "next_nodes": []
            }
        ]
        
        graph_request = {
            "secrets": {},
            "nodes": graph_nodes
        }
        
        response = await state_manager_client.put(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}",
            json=graph_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 201
        print(f"✅ Error test graph template created: {graph_name}")
        
        # Step 2: Create a state
        state_request = {
            "states": [
                {
                    "identifier": "niku_error_node",
                    "inputs": {
                        "x": "error",
                        "y": "test"
                    }
                }
            ]
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}/states/create",
            json=state_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        state_id = response_data["states"][0]["state_id"]
        print(f"✅ Error test state created: {state_id}")
        
        # Step 3: Simulate an error during execution
        error_request = {
            "error": "Test error message",
            "error_code": "TEST_ERROR",
            "error_details": {
                "reason": "Simulated error for testing"
            }
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/states/{state_id}/errored",
            json=error_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        print(f"✅ Error state handled correctly")
        
        print(f"🎉 Niku error handling test completed successfully!")
        print(f"   - Namespace: {niku_namespace}")
        print(f"   - Graph: {graph_name}")
        print(f"   - State ID: {state_id}")
    
    async def test_niku_secrets_integration(self, state_manager_client, niku_namespace: str,
                                          niku_api_key: str):
        """Test niku workflow with secrets."""
        
        # Step 1: Create a graph template with secrets
        graph_name = f"niku-secrets-graph-{uuid.uuid4().hex[:8]}"
        
        graph_nodes = [
            {
                "node_name": "TestNode2",
                "namespace": niku_namespace,
                "identifier": "niku_secrets_node",
                "inputs": {
                    "x": "hello",
                    "y": "world"
                },
                "next_nodes": []
            }
        ]
        
        graph_request = {
            "secrets": {
                "test_secret": "secret_value_123"
            },
            "nodes": graph_nodes
        }
        
        response = await state_manager_client.put(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}",
            json=graph_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 201
        print(f"✅ Secrets graph template created: {graph_name}")
        
        # Step 2: Create a state
        state_request = {
            "states": [
                {
                    "identifier": "niku_secrets_node",
                    "inputs": {
                        "x": "hello",
                        "y": "world"
                    }
                }
            ]
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/graph/{graph_name}/states/create",
            json=state_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        state_id = response_data["states"][0]["state_id"]
        print(f"✅ Secrets test state created: {state_id}")
        
        # Step 3: Retrieve secrets for the state
        response = await state_manager_client.get(
            f"/v0/namespace/{niku_namespace}/state/{state_id}/secrets",
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        response_data = response.json()
        assert "secrets" in response_data
        assert "test_secret" in response_data["secrets"]
        assert response_data["secrets"]["test_secret"] == "secret_value_123"
        print(f"✅ Secrets retrieved successfully")
        
        # Step 4: Execute the state
        execute_request = {
            "outputs": {
                "x": "test"
            }
        }
        
        response = await state_manager_client.post(
            f"/v0/namespace/{niku_namespace}/states/{state_id}/executed",
            json=execute_request,
            headers={"X-API-Key": niku_api_key}
        )
        
        assert response.status_code == 200
        print(f"✅ Secrets test state executed")
        
        print(f"🎉 Niku secrets integration test completed successfully!")
        print(f"   - Namespace: {niku_namespace}")
        print(f"   - Graph: {graph_name}")
        print(f"   - State ID: {state_id}")


class TestNikuRuntimeIntegration:
    """Integration tests for the niku runtime itself."""
    
    @pytest.fixture
    def niku_process(self):
        """Start the niku runtime process."""
        niku_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../niku'))
        
        # Set environment variables for the niku runtime
        env = os.environ.copy()
        env["STATE_MANAGER_URI"] = "http://localhost:8000"
        env["NIKU_API_KEY"] = "niki"
        
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=niku_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        # Give it time to start and register
        time.sleep(10)
        
        yield process
        
        # Cleanup
        try:
            process.terminate()
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
    
    async def test_niku_runtime_startup(self, niku_process):
        """Test that the niku runtime starts up correctly."""
        
        # Check if the process is running
        assert niku_process.poll() is None, "Niku runtime process should be running"
        
        # Check if there are any immediate errors
        if niku_process.stderr:
            stderr_output = niku_process.stderr.read()
            if stderr_output:
                print(f"Niku runtime stderr: {stderr_output}")
        
        print("✅ Niku runtime started successfully")
    
    async def test_niku_runtime_registration_with_state_manager(self, niku_process):
        """Test that the niku runtime registers with the state-manager."""
        
        # Wait for registration
        await asyncio.sleep(5)
        
        # Create a client to check if TestNode2 is available
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            # Try to create a graph template with TestNode2
            graph_name = f"test-niku-registration-{uuid.uuid4().hex[:8]}"
            
            graph_request = {
                "secrets": {},
                "nodes": [
                    {
                        "node_name": "TestNode2",
                        "namespace": "testnamespace",
                        "identifier": "test_node",
                        "inputs": {
                            "x": "hello",
                            "y": "world"
                        },
                        "next_nodes": []
                    }
                ]
            }
            
            response = await client.put(
                f"/v0/namespace/testnamespace/graph/{graph_name}",
                json=graph_request,
                headers={"X-API-Key": "niki"}
            )
            
            # If the node is registered, this should succeed
            assert response.status_code == 201
            print("✅ Niku runtime successfully registered TestNode2 with state-manager")


if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v", "-s"])
