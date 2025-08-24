# State Manager Setup Guide

This guide provides step-by-step instructions for setting up the Exosphere state manager in both local and production environments.

## Overview

The Exosphere state manager is the core backend service that handles workflow execution, state management, and coordination between nodes. It provides a REST API for managing graph templates, registered nodes, and workflow execution states.

## Local Setup

=== "Docker (Recommended)"

    The easiest way to run the state manager locally is using Docker. This approach ensures consistent environments and minimal setup.

    ### Prerequisites

    - Docker installed

    ### Setup Steps

    1. **Pull the public image and run**:
       ```bash
       docker run -d \
         --name exosphere-state-manager \
         -p 8000:8000 \
         -e MONGO_URI="mongodb://localhost:27017/exosphere" \
         -e MONGO_DATABASE_NAME="exosphere" \
         -e STATE_MANAGER_SECRET="your-secret-api-key" \
         -e SECRETS_ENCRYPTION_KEY="your-32-character-encryption-key" \
         ghcr.io/exospherehost/state-manager:latest
       ```

    2. **Verify the service is running**:
       ```bash
       # Check container status
       docker ps
       
       # Check logs
       docker logs exosphere-state-manager
       
       # Test the API
       curl http://localhost:8000/health
       ```

    The state manager will be available at `http://localhost:8000`

    ### Required Environment Variables

    | Variable | Description | Required |
    |----------|-------------|----------|
    | `MONGO_URI` | MongoDB connection string | Yes |
    | `MONGO_DATABASE_NAME` | Database name | Yes |
    | `STATE_MANAGER_SECRET` | Secret API key for authentication | Yes |
    | `SECRETS_ENCRYPTION_KEY` | 32-character key for data encryption | Yes |

=== "Local Development"

    For development or when you need more control over the environment, you can run the state manager locally using the source code.

    ### Prerequisites

    - Python 3.12 or higher
    - uv package manager
    - Git

    ### Setup Steps

    1. **Clone the repository**:
       ```bash
       git clone https://github.com/exospherehost/exospherehost.git
       cd exospherehost/state-manager
       ```

    2. **Install dependencies**:
       ```bash
       uv sync
       ```

    3. **Set up environment variables**:
       ```bash
       export MONGO_URI="mongodb://localhost:27017/exosphere"
       export MONGO_DATABASE_NAME="exosphere"
       export STATE_MANAGER_SECRET="your-secret-api-key"
       export SECRETS_ENCRYPTION_KEY="your-32-character-encryption-key"
       ```

    4. **Run the state manager**:
       ```bash
       uv run run.py --mode=development
       ```

    The state manager will be available at `http://localhost:8000`

## Production Setup

=== "Exosphere Hosted Platform"

    For production workloads, we recommend using the hosted Exosphere platform. This provides managed infrastructure with high availability, automatic scaling, and enterprise-grade security.

    ### Getting Started

    1. **Get your credentials from the Exosphere dashboard**:
       - State manager URL
       - API key for authentication
       - Namespace configuration

    2. **Contact us for setup assistance**:
       - Email: [nivedit@exosphere.host](mailto:nivedit@exosphere.host)

    3. **Configure your application**:
       ```python
       from exospherehost import Runtime
       
       Runtime(
           namespace="your-namespace",
           name="YourWorkflow",
           nodes=[YourNodes],
           state_manager_uri="https://api.exosphere.host",
           api_key="your-production-api-key"
       ).start()
       ```

=== "Self-Hosted Deployment"

    For organizations that need complete control over their infrastructure, you can deploy the state manager on your own infrastructure.

    ### Prerequisites

    - Kubernetes cluster (recommended) or Docker Swarm
    - MongoDB cluster (Atlas, DocumentDB, or self-hosted)
    - Load balancer and ingress controller
    - SSL certificates for HTTPS

    ### Docker Deployment

    1. **Create a Docker Compose file for production**:
       ```yaml
       version: '3.8'
       
       services:
         state-manager:
           image: ghcr.io/exospherehost/state-manager:latest
           ports:
             - "8000:8000"
           environment:
             - MONGO_URI=mongodb://your-mongodb-cluster:27017/exosphere
             - MONGO_DATABASE_NAME=exosphere
             - STATE_MANAGER_SECRET=${STATE_MANAGER_SECRET}
             - SECRETS_ENCRYPTION_KEY=${SECRETS_ENCRYPTION_KEY}
           deploy:
             replicas: 3
             update_config:
               parallelism: 1
               delay: 10s
             restart_policy:
               condition: on-failure
       ```

    2. **Deploy to your infrastructure**:
       ```bash
       docker-compose -f docker-compose.prod.yml up -d
       ```

    ### Kubernetes Deployment

    1. **Create namespace**:
       ```bash
       kubectl create namespace exosphere
       ```

    2. **Create ConfigMap for configuration**:
       ```yaml
       apiVersion: v1
       kind: ConfigMap
       metadata:
         name: state-manager-config
         namespace: exosphere
       data:
         MONGO_URI: "mongodb://your-mongodb-cluster:27017/exosphere"
         MONGO_DATABASE_NAME: "exosphere"
         LOG_LEVEL: "INFO"
       ```

    3. **Create Secret for sensitive data**:
       ```yaml
       apiVersion: v1
       kind: Secret
       metadata:
         name: state-manager-secrets
         namespace: exosphere
       type: Opaque
       data:
         STATE_MANAGER_SECRET: <base64-encoded-secret-key>
         SECRETS_ENCRYPTION_KEY: <base64-encoded-encryption-key>
       ```

    4. **Deploy the state manager**:
       ```bash
       kubectl apply -f k8s/state-manager-deployment.yaml
       kubectl apply -f k8s/state-manager-service.yaml
       kubectl apply -f k8s/state-manager-ingress.yaml
       ```

## Configuration Reference

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `MONGO_DATABASE_NAME` | Database name | Yes | `exosphere` |
| `STATE_MANAGER_SECRET` | Secret API key for authentication | Yes | - |
| `SECRETS_ENCRYPTION_KEY` | 32-character key for data encryption | Yes | - |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | No | `INFO` |
| `WORKERS` | Number of worker processes | No | CPU count |
| `HOST` | Host to bind to | No | `0.0.0.0` |
| `PORT` | Port to bind to | No | `8000` |

## Monitoring and Health Checks

### Health Check Endpoint

The state manager provides a health check endpoint:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "0.1.0"
}
```

### Getting Help

- **Documentation**: [docs.exosphere.host](https://docs.exosphere.host)
- **GitHub Issues**: [github.com/exospherehost/exospherehost/issues](https://github.com/exospherehost/exospherehost/issues)
- **Discord Community**: [discord.gg/exosphere](https://discord.gg/exosphere)
- **Email Support**: [support@exosphere.host](mailto:support@exosphere.host)

## Next Steps

- **[Dashboard Setup](./dashboard.md)** - Set up the web dashboard for monitoring
- **[Node Development](./register-node.md)** - Learn how to create and register nodes
- **[Graph Creation](./create-graph.md)** - Build workflows using graph templates
- **[Examples](./examples.md)** - See real-world usage examples
