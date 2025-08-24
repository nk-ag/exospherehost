![logo light](assets/logo-light.svg#gh-light-mode-only)
![logo dark](assets/logo-dark.svg#gh-dark-mode-only)
[![Docs](https://img.shields.io/badge/docs-latest-success)](https://docs.exosphere.host)
![Last commit](https://img.shields.io/github/last-commit/exospherehost/exospherehost)
[![PyPI - Version](https://img.shields.io/pypi/v/exospherehost)](https://pypi.org/project/exospherehost/)
[![Coverage](https://img.shields.io/codecov/c/gh/exospherehost/exospherehost)](https://codecov.io/gh/exospherehost/exospherehost)
![Kubernetes](https://img.shields.io/badge/Kubernetes-native-326ce5?logo=kubernetes&logoColor=white)
[![Discord](https://badgen.net/discord/members/V8uuA6mmzg)](https://discord.gg/V8uuA6mmzg)
![Stars](https://img.shields.io/github/stars/exospherehost/exospherehost?style=social)
---
Exosphere is open source infrastructure to run AI agents at scale with first party support for large data and long running flows.

Exosphere lets you define plug and playable nodes that can then be run on a reliable backbone in the form of a workflow, with:
- Dynamic State Creation at runtime
- Infinite parallel agents 
- Persistent state management
- Failure handling

This allows developers to deploy production agents that can scale beautifully to build robust autonomous AI workflows.


## Getting Started

- ### Installation
  ```bash
  uv add exospherehost
  ```

- ### Define your first node
   Each node is an atomic reusable unit on Exosphere. Once registered, you can plug it into any workflow going forward. This could be an agent, an api call, or existing code, anything you want to be a unit of your workflow. 
  ```python
    from exospherehost import BaseNode
    from pydantic import BaseModel

    class MyFirstNode(BaseNode):

        class Inputs(BaseModel):
            city:str
            #Define inputs taken by node

        class Outputs(BaseModel):
            description:str
            #Output fields from this node            

        async def execute(self) -> Outputs:    
            return Outputs(descriptor_agent(inputs.city))        
            #Execution function:
            # >>Agent
            # >>Existing Code
            # >>Anything else you want to do!
  ```

 

  Create the node and add it to a runtime to enable execution:
  ```python
  from exospherehost import Runtime

  # Make sure to set EXOSPHERE environment variables:
  # - EXOSPHERE_STATE_MANAGER_URI=http://your-state-manager:8000
  # - EXOSPHERE_API_KEY=your-api-key
  # - Details on how to set these up are below
  Runtime(
    name="my-first-runtime",
    namespace="hello-world",
    nodes=[
       MyFirstNode
    ]
   ).start()
  ```

- ### Define your first flow
  
  Flows are then described connecting nodes with relationships in json objects. Exosphere runs flows as per defined trigger conditions. See [Flow defintions](https://docs.exosphere.host) to see more examples.
  ```json
  {
    "secrets": {},
    "nodes": [
        {
            "node_name": "MyFirstNode",
            "namespace": "hello-world",
            "identifier": "describe_city",
            "inputs": {
                "bucket_name": "initial",
                "prefix": "initial",
                "files_only": "true",
                "recursive": "false"
            },
            "next_nodes": ["create_batches"]
        }
    ]
  ```

## Use State Manager and Dashboard

Exosphere provides a State Manager for persistent data storage and a Dashboard for monitoring your AI workflows. Here's how to set them up:

#### Quick Start with Docker Compose

The easiest way to get started is using Docker Compose. Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  # MongoDB database for storing state
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

  # State Manager service
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

  # Dashboard for monitoring workflows
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

#### Running the Stack

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the Dashboard:**
   - Open your browser and go to `http://localhost:3000`
   - Use the default namespace and API key from your docker-compose file

3. **Connect your nodes to the State Manager:**
   
   Your nodes need environment variables to connect to the State Manager. Add these to your node containers:
   
   ```bash
   # Environment variables for your node containers
   - EXOSPHERE_STATE_MANAGER_URI=http://exosphere-state-manager:8000
   - EXOSPHERE_API_KEY=your-secret-key
   ```
   
   Or add them to your docker-compose.yml:
   ```yaml
   your-node-service:
     image: your-node-image
     environment:
       - EXOSPHERE_STATE_MANAGER_URI=http://exosphere-state-manager:8000
       - EXOSPHERE_API_KEY=your-secret-key
     networks:
       - exosphere-network
   ```

#### What Each Service Does

- **MongoDB**: Stores all your workflow state and data
- **State Manager**: Provides APIs for storing and retrieving state across workflow executions
- **Dashboard**: Web interface to monitor flows, view node status, and manage your AI agents

#### Production Deployment

For production, you can use the same images with Kubernetes or other orchestration tools:

```bash
# Pull the latest images
docker pull ghcr.io/exospherehost/exosphere-state-manager:latest
docker pull ghcr.io/exospherehost/exosphere-dashboard:latest

# Run with your own configuration
docker run -d \
  --name exosphere-state-manager \
  -p 8000:8000 \
  -e MONGO_URI=your-mongodb-connection \
  -e STATE_MANAGER_SECRET=your-secret \
  ghcr.io/exospherehost/exosphere-state-manager:latest
```

## Documentation



## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md). Further we are thankful to all the contributors helping us to simplify infrastructure starting with the process of building and deploying AI workflows and agents.

Join our Discord: https://discord.gg/msUHahrp for active community discussions. We have weekly community huddle to talk up feature dicsussions, feel free to become a part of the conversation.
