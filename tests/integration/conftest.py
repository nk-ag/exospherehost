"""
Pytest configuration for integration tests.

This file contains common fixtures and configuration for all integration tests.
"""

import pytest
import os
import sys
import asyncio
import httpx
import subprocess
import time
from typing import Generator, AsyncGenerator

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Add state-manager app to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../state-manager')))

# Add api-server app to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../api-server')))


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def state_manager_url() -> str:
    """Get the state-manager URL from environment or use default."""
    return os.getenv("STATE_MANAGER_URL", "http://localhost:8000")


@pytest.fixture(scope="session")
def api_server_url() -> str:
    """Get the api-server URL from environment or use default."""
    return os.getenv("API_SERVER_URL", "http://localhost:8001")


@pytest.fixture(scope="session")
def mongo_uri() -> str:
    """Get the MongoDB URI from environment or use default."""
    return os.getenv("MONGO_URI", "mongodb://localhost:27017")


@pytest.fixture(scope="session")
def redis_url() -> str:
    """Get the Redis URL from environment or use default."""
    return os.getenv("REDIS_URL", "redis://localhost:6379")


@pytest.fixture(scope="session")
def state_manager_secret() -> str:
    """Get the state-manager secret from environment or use default."""
    return os.getenv("STATE_MANAGER_SECRET", "test-secret")


@pytest.fixture(scope="session")
def niku_api_key() -> str:
    """Get the niku API key from environment or use default."""
    return os.getenv("NIKU_API_KEY", "niki")


@pytest.fixture
async def state_manager_client(state_manager_url: str) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Create an HTTP client for the state-manager."""
    async with httpx.AsyncClient(base_url=state_manager_url) as client:
        yield client


@pytest.fixture
async def api_server_client(api_server_url: str) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Create an HTTP client for the api-server."""
    async with httpx.AsyncClient(base_url=api_server_url) as client:
        yield client


@pytest.fixture(scope="session")
def check_services_available(state_manager_url: str, api_server_url: str) -> bool:
    """Check if required services are available before running tests."""
    
    def check_service(url: str, service_name: str) -> bool:
        try:
            response = httpx.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name} is available at {url}")
                return True
            else:
                print(f"❌ {service_name} is not responding correctly at {url}")
                return False
        except Exception as e:
            print(f"❌ {service_name} is not available at {url}: {e}")
            return False
    
    state_manager_available = check_service(state_manager_url, "State Manager")
    api_server_available = check_service(api_server_url, "API Server")
    
    if not state_manager_available or not api_server_available:
        pytest.skip("Required services are not available. Please start the services before running integration tests.")
    
    return True


@pytest.fixture(scope="session")
def niku_runtime_process():
    """Start the niku runtime process for integration tests."""
    
    # Get the path to the niku directory
    niku_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../niku'))
    
    # Set environment variables for the niku runtime
    env = os.environ.copy()
    env["STATE_MANAGER_URI"] = os.getenv("STATE_MANAGER_URL", "http://localhost:8000")
    env["NIKU_API_KEY"] = os.getenv("NIKU_API_KEY", "niki")
    
    # Start the niku process
    process = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=niku_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    # Give it time to start up and register
    time.sleep(10)
    
    yield process
    
    # Cleanup: terminate the process
    try:
        process.terminate()
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


# Mark all tests in this directory as integration tests
pytestmark = pytest.mark.integration


def pytest_configure(config):
    """Configure pytest for integration tests."""
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add integration marker."""
    for item in items:
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
