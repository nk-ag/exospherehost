# Integration Tests

This directory contains comprehensive integration tests for the Exosphere system, covering the complete workflow from node creation to execution.

## Overview

The integration tests cover:

1. **State Manager Integration Tests** - Testing the complete state-manager workflow
2. **API Server Integration Tests** - Testing user management, authentication, and project workflows
3. **Niku Runtime Integration Tests** - Testing the complete end-to-end workflow with niku nodes

## Prerequisites

Before running the integration tests, ensure you have:

### Dependencies
- Python 3.12+
- pytest
- pytest-asyncio
- httpx
- pymongo
- redis

### Services Running
- **MongoDB** on `localhost:27017`
- **Redis** on `localhost:6379`
- **State Manager** on `localhost:8000`
- **API Server** on `localhost:8001`

## Quick Start

### 1. Install Dependencies

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx pymongo redis

# Or install from requirements (if available)
pip install -r requirements-test.txt
```

### 2. Start Required Services

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Start Redis
docker run -d --name redis -p 6379:6379 redis:latest

# Start State Manager
cd state-manager
uv run run.py --mode development

# Start API Server (in another terminal)
cd api-server
uv run run.py --mode development
```

#### Option B: Using Docker Compose

```bash
# Start all services using docker-compose
docker-compose up -d mongodb redis
```

### 3. Verify Setup

Before running the integration tests, verify that your setup is correct:

```bash
# Test setup and imports
python tests/integration/test_setup.py
```

This will check that all dependencies are installed and imports work correctly.

### 4. Run Integration Tests

#### Run All Tests
```bash
python tests/integration/run_integration_tests.py
```

#### Run Specific Test Suites
```bash
# State Manager only
python tests/integration/run_integration_tests.py --state-manager-only

# API Server only
python tests/integration/run_integration_tests.py --api-server-only

# Niku integration only
python tests/integration/run_integration_tests.py --niku-only

# With verbose output
python tests/integration/run_integration_tests.py --verbose
```

## Test Structure

### State Manager Integration Tests

**File**: `state-manager/tests/integration/test_full_workflow_integration.py`

**Coverage**:
- Node registration with state-manager
- Graph template creation and management
- State creation and execution
- Secrets management
- Error handling
- Multi-node workflows

**Key Test Classes**:
- `TestFullWorkflowIntegration` - Complete workflow testing
- `TestNikuIntegration` - Niku-specific node testing

### API Server Integration Tests

**File**: `api-server/tests/integration/test_api_server_integration.py`

**Coverage**:
- User creation and management
- Authentication and token management
- Project creation and management
- Error handling and validation
- Concurrent operations

**Key Test Classes**:
- `TestApiServerIntegration` - Complete user workflow testing
- `TestApiServerErrorHandling` - Error scenarios
- `TestApiServerConcurrentOperations` - Concurrent operation testing

### Niku Full Integration Tests

**File**: `tests/integration/test_niku_full_integration.py`

**Coverage**:
- Niku runtime startup and registration
- Complete end-to-end workflow with TestNode2
- Multi-node workflows
- Error handling
- Secrets integration

**Key Test Classes**:
- `TestNikuFullIntegration` - Complete niku workflow testing
- `TestNikuRuntimeIntegration` - Runtime-specific testing

## Test Workflows

### Happy Path Workflow

1. **Node Registration**: Register TestNode2 with state-manager
2. **Graph Creation**: Create a graph template with the registered node
3. **State Creation**: Create states for the graph
4. **Execution**: Execute states and verify outputs
5. **Verification**: Verify the complete workflow

### Error Handling Workflow

1. **Invalid Inputs**: Test with invalid data
2. **Authentication Errors**: Test with invalid credentials
3. **Service Failures**: Test when services are unavailable
4. **Concurrent Operations**: Test race conditions

## Environment Variables

The tests use the following environment variables (with defaults):

```bash
STATE_MANAGER_URL=http://localhost:8000
API_SERVER_URL=http://localhost:8001
MONGO_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
STATE_MANAGER_SECRET=test-secret
NIKU_API_KEY=niki
```

## Running Tests Manually

### Using pytest directly

```bash
# Run all integration tests
pytest tests/integration/ -v -m integration

# Run specific test file
pytest state-manager/tests/integration/test_full_workflow_integration.py -v

# Run specific test class
pytest tests/integration/test_niku_full_integration.py::TestNikuFullIntegration -v

# Run specific test method
pytest tests/integration/test_niku_full_integration.py::TestNikuFullIntegration::test_niku_node_execution_workflow -v
```

### Using the test runner

```bash
# Run all tests
python tests/integration/run_integration_tests.py

# Run with verbose output
python tests/integration/run_integration_tests.py --verbose

# Run specific test suite
python tests/integration/run_integration_tests.py --state-manager-only
```

## Test Data and Cleanup

- Tests generate unique namespaces and IDs to avoid conflicts
- Each test cleans up after itself
- Test data is isolated using unique identifiers
- No persistent data is left after tests complete

## Troubleshooting

### Common Issues

1. **Services Not Available**
   ```
   ❌ State Manager is not available at http://localhost:8000
   ```
   **Solution**: Ensure all required services are running

2. **Import Errors**
   ```
   ModuleNotFoundError: No module named 'app'
   ```
   **Solution**: 
   - Run the setup test: `python tests/integration/test_setup.py`
   - Ensure you're running tests from the project root directory
   - Check that the PYTHONPATH includes the project root

3. **Authentication Errors**
   ```
   401 Unauthorized
   ```
   **Solution**: Check API keys and secrets in environment variables

4. **Database Connection Errors**
   ```
   Connection refused
   ```
   **Solution**: Ensure MongoDB and Redis are running and accessible

### Debug Mode

Run tests with verbose output to see detailed information:

```bash
python tests/integration/run_integration_tests.py --verbose
```

### Manual Service Testing

Test individual services manually:

```bash
# Test State Manager
curl http://localhost:8000/health

# Test API Server
curl http://localhost:8001/health
```

## Contributing

When adding new integration tests:

1. Follow the existing test structure and naming conventions
2. Use unique identifiers for test data
3. Include proper cleanup in fixtures
4. Add comprehensive error handling tests
5. Document new test workflows
6. Update this README with new test information

## Test Coverage

The integration tests aim to cover:

- ✅ Happy path workflows
- ✅ Error handling scenarios
- ✅ Authentication and authorization
- ✅ Concurrent operations
- ✅ Service integration
- ✅ Data persistence
- ✅ Runtime registration and execution

## Performance Considerations

- Tests are designed to run quickly (typically < 30 seconds per test suite)
- Use async/await for I/O operations
- Implement proper timeouts for external service calls
- Clean up resources promptly
- Use session-scoped fixtures where appropriate
