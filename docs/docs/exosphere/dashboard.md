# Exosphere Dashboard

The Exosphere dashboard provides a comprehensive web interface for monitoring, debugging, and managing your workflows. This guide shows you how to access and use the dashboard effectively.

## Dashboard Overview

The Exosphere dashboard is a separate frontend application that connects to your state manager backend and provides:

- **Real-time monitoring** of workflow execution
- **Visual graph representation** of your workflows
- **State management** and debugging tools
- **Performance metrics** and analytics
- **Error tracking** and resolution

## Running the Dashboard

There are currently two ways to run the Exosphere dashboard frontend:

### Option 1: Docker Container (Recommended)

The easiest way to run the dashboard is using the pre-built Docker container:

```bash
docker run -p 3000:3000 ghcr.io/exospherehost/exosphere-dashboard:latest
```

This will start the dashboard and make it available at:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000

The container will automatically start and be ready in a few seconds.

### Option 2: Local Development

For development or customization, you can run the dashboard locally:

```bash
# Clone the state-manager-frontend repository
git clone <repository-url>
cd state-manager-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Option 3: Web Portal (Coming Soon)

A third option will be available soon - a hosted web portal where you can view your running states in production without needing to run anything locally.

## Dashboard Features

The Exosphere dashboard provides the following key features:

### 1. Graph Templates Management

- **View all graph templates** in your namespace
- **Visual graph representation** with node connections
- **Graph validation** and status checking
- **Template editing** capabilities

### 2. Registered Nodes Monitoring

- **List all registered nodes** in your namespace
- **Node health status** and availability
- **Node schemas** (inputs, outputs, secrets)
- **Node performance** metrics

### 3. Execution Monitoring

- **Real-time workflow execution** tracking
- **State transitions** visualization
- **Execution progress** indicators
- **Run history** and status

### 4. State Management

- **Current states** for active runs
- **State history** for completed runs
- **Error details** and debugging information
- **State retry** capabilities

### 5. API Integration

- **REST API endpoints** for programmatic access
- **Authentication** via API keys
- **Real-time updates** via WebSocket connections

## Connecting to Your State Manager

The dashboard connects to your state manager backend. Make sure your state manager is running and accessible:

> **Note**: For detailed setup instructions, see **[State Manager Setup](./state-manager-setup.md)**.

### Local State Manager

```bash
# Start the state manager
cd state-manager
python run.py
```

The state manager will be available at `http://localhost:8000`

### Production State Manager

In production, your state manager is typically available at:
`https://your-state-manager.exosphere.host`

## Configuration

### Environment Variables

Configure the dashboard by setting these environment variables:

```bash
# State manager API endpoint
NEXT_PUBLIC_STATE_MANAGER_URL=http://localhost:8000

# API key for authentication
NEXT_PUBLIC_API_KEY=your-api-key

# Namespace
NEXT_PUBLIC_NAMESPACE=your-namespace

# Other configuration options
NEXT_PUBLIC_REFRESH_INTERVAL=5000
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### API Key Authentication

The dashboard uses the same API key authentication as the state manager:

```bash
# Set your API key
export EXOSPHERE_KEY="your-api-key"
```

## Using the Dashboard

### Viewing Graph Templates

1. Navigate to the **Graphs** section
2. Select a graph template to view its details
3. The visual representation shows:
   - Nodes as connected boxes
   - Data flow direction with arrows
   - Triggers as entry points
   - Node relationships and dependencies

### Monitoring Execution

1. Go to the **Executions** section
2. Find your active run by run ID or search criteria
3. View the execution status:
   - **Pending**: States waiting to be executed
   - **Running**: Currently executing states
   - **Completed**: Successfully executed states
   - **Failed**: States that encountered errors

### Debugging Failed Executions

1. Identify failed states in the execution view
2. Click on a failed state to view details:
   - **Error message** and stack trace
   - **Input data** that caused the failure
   - **Node configuration** and secrets used
   - **Execution logs** and timestamps

3. Use the debugging tools:
   - **Retry state** with the same inputs
   - **Modify inputs** and retry
   - **View related states** in the workflow


## Next Steps

- **[Examples](./examples.md)** - See real-world dashboard usage examples
- **[Concepts](./concepts.md)** - Learn about fanout, units, inputs, outputs, and secrets
- **[API Reference](./api-reference.md)** - Complete API documentation
