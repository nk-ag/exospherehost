![logo light](assets/logo-light.svg#gh-light-mode-only)
![logo dark](assets/logo-dark.svg#gh-dark-mode-only)
[![Docs](https://img.shields.io/badge/docs-latest-success)](https://docs.exosphere.host)
[![Last commit](https://img.shields.io/github/last-commit/exospherehost/exospherehost)](https://github.com/exospherehost/exospherehost/commits/main)
[![PyPI - Version](https://img.shields.io/pypi/v/exospherehost)](https://pypi.org/project/exospherehost/)
[![Coverage](https://img.shields.io/codecov/c/gh/exospherehost/exospherehost)](https://codecov.io/gh/exospherehost/exospherehost)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-native-326ce5?logo=kubernetes&logoColor=white)](https://github.com/orgs/exospherehost/packages?repo_name=exospherehost)
[![Discord](https://badgen.net/discord/members/V8uuA6mmzg)](https://discord.gg/V8uuA6mmzg)
![Stars](https://img.shields.io/github/stars/exospherehost/exospherehost?style=social)

---

# Exosphere

**Run AI agents at scale with reliable workflows**

Exosphere helps you build and deploy AI workflows that can handle large amounts of data and run for long periods. Create reusable components (nodes) and connect them into powerful workflows.

## What Exosphere Does

- **Build once, use anywhere**: Create reusable AI components
- **Scale automatically**: Run infinite parallel agents
- **Never lose data**: Persistent state management across runs
- **Handle failures**: Built-in error recovery and retry logic
- **Monitor everything**: Web dashboard to track your workflows

## Quick Start

### 1. Install Exosphere

```bash
uv add exospherehost
```

### 2. Create Your First AI Node

A node is a reusable AI component. It could be an AI agent, API call, or any code you want to run.

```python
from exospherehost import BaseNode
from pydantic import BaseModel

class CityAnalyzer(BaseNode):
    class Inputs(BaseModel):
        city_name: str
    
    class Outputs(BaseModel):
        description: str
        population: str
    
    async def execute(self) -> Outputs:
        # Your AI logic here
        description = f"Analyzing {self.inputs.city_name}..."
        population = "1000000"  # Example data
        
        return Outputs(description=description, population=population)
```

### 3. Set Up State Manager & Dashboard

Create a `docker-compose.yml` file to run Exosphere services:

```yaml
version: "3.8"

services:
  # Database for storing workflow data
  mongodb:
    image: mongo:7.0
    container_name: exosphere-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: exosphere
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - exosphere-network

  # State Manager - stores and retrieves data
  exosphere-state-manager:
    image: ghcr.io/exospherehost/exosphere-state-manager:latest
    container_name: exosphere-state-manager
    restart: unless-stopped
    environment:
      - MONGO_URI=mongodb://admin:password@mongodb:27017/exosphere?authSource=admin
      - STATE_MANAGER_SECRET=your-secret-key
      - MONGO_DATABASE_NAME=exosphere
      - SECRETS_ENCRYPTION_KEY=your-encryption-key
    depends_on:
      - mongodb
    ports:
      - "8000:8000"
    networks:
      - exosphere-network

  # Dashboard - web interface to monitor workflows
  exosphere-dashboard:
    image: ghcr.io/exospherehost/exosphere-dashboard:latest
    container_name: exosphere-dashboard
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_EXOSPHERE_STATE_MANAGER_URL=http://exosphere-state-manager:8000
      - NEXT_PUBLIC_DEFAULT_NAMESPACE=my-project
      - NEXT_PUBLIC_DEFAULT_API_KEY=your-secret-key
    depends_on:
      - exosphere-state-manager
    ports:
      - "3000:3000"
    networks:
      - exosphere-network

volumes:
  mongodb_data:
    driver: local

networks:
  exosphere-network:
    driver: bridge
    attachable: true
```

Start the services:

```bash
docker-compose up -d
```

### 4. Run Your Node

```python
from exospherehost import Runtime

# Set environment variables to connect to State Manager
# EXOSPHERE_STATE_MANAGER_URI=http://localhost:8000
# EXOSPHERE_API_KEY=your-secret-key

Runtime(
    name="my-runtime",
    namespace="my-project",
    nodes=[CityAnalyzer]
).start()
```

### 5. Register the graph with the State Manager

Register the graph with the State Manager:

```python
import asyncio
from exospherehost import StateManager

asyncio.run(StateManager(namespace="my-project").upsert_graph(
    graph_name="city-analysis-workflow",
    secrets={},
    graph_nodes=[
        {
            "node_name": "CityAnalyzer",
            "identifier": "analyze-nyc",
            "inputs": {
                "city_name": "New York"
            },
            "next_nodes": []
        }
    ]
))
```

### 6. Monitor Your Workflows

Open your browser and go to `http://localhost:3000` to see the dashboard.

## What Each Service Does

- **MongoDB**: Stores all your workflow data and state
- **State Manager**: Handles data storage and retrieval between workflow runs
- **Dashboard**: Web interface to monitor and manage your workflows

## Production Deployment

For production, use the same Docker images with your own configuration:

```bash
# Pull latest images
docker pull ghcr.io/exospherehost/exosphere-state-manager:latest
docker pull ghcr.io/exospherehost/exosphere-dashboard:latest

# Run with your settings
docker run -d \
  --name exosphere-state-manager \
  -p 8000:8000 \
  -e MONGO_URI=your-mongodb-connection \
  -e STATE_MANAGER_SECRET=your-secret \
  ghcr.io/exospherehost/exosphere-state-manager:latest
```

## Documentation

For detailed guides and examples, visit [docs.exosphere.host](https://docs.exosphere.host)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](/CONTRIBUTING.md) for guidelines.

Join our [Discord community](https://discord.gg/msUHahrp) for discussions and weekly feature talks.
