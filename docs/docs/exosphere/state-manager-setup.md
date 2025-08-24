# State Manager Setup Guide

This guide provides step-by-step instructions for setting up the Exosphere state manager in both local and production environments.

## Overview

The Exosphere state manager is the core backend service that handles workflow execution, state management, and coordination between nodes. It provides a REST API for managing graph templates, registered nodes, and workflow execution states.

## Local Setup Options

### Option 1: Docker Container (Recommended)

The easiest way to run the state manager locally is using Docker. This approach ensures consistent environments and minimal setup.

#### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

#### Setup Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/exospherehost/exospherehost.git
   cd exospherehost
   ```

2. **Navigate to the state-manager directory**:
   ```bash
   cd state-manager
   ```

3. **Create environment configuration**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the state manager**:
   ```bash
   docker-compose up -d
   ```

5. **Verify the service is running**:
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs -f api-server
   
   # Test the API
   curl http://localhost:8000/health
   ```

The state manager will be available at:
- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs

#### Configuration Options

Edit the `.env` file to configure your environment:

```bash
# Database configuration
MONGODB_URI=mongodb://localhost:27017/exosphere
DATABASE_NAME=exosphere

# API configuration
API_KEY=your-secret-api-key
NAMESPACE=your-namespace

# Logging
LOG_LEVEL=INFO

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Option 2: Local Development with exospherehost

For development or when you need more control over the environment, you can run the state manager locally using the exospherehost Python package.

#### Prerequisites

- Python 3.12 or higher
- uv package manager (recommended) or pip
- MongoDB (local or cloud instance)

#### Setup Steps

1. **Install uv** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Navigate to the state-manager directory**:
   ```bash
   cd state-manager
   ```

3. **Install dependencies**:
   ```bash
   uv sync
   ```

4. **Set up environment variables**:
   ```bash
   export MONGODB_URI="mongodb://localhost:27017/exosphere"
   export DATABASE_NAME="exosphere"
   export API_KEY="your-secret-api-key"
   export NAMESPACE="your-namespace"
   export ENCRYPTION_KEY="your-32-character-encryption-key"
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or using your system's package manager
   # Ubuntu/Debian: sudo systemctl start mongod
   # macOS: brew services start mongodb-community
   ```

6. **Run the state manager**:
   ```bash
   # Development mode (with auto-reload)
   uv run run.py --mode development
   
   # Production mode
   uv run run.py --mode production --workers 4
   ```

The state manager will be available at `http://localhost:8000`

## Production Setup Options

### Option 1: Exosphere API/Key (Recommended)

For production workloads, we recommend using the hosted Exosphere platform. This provides:

- **Managed infrastructure** with high availability
- **Automatic scaling** based on workload
- **Built-in monitoring** and alerting
- **Global edge locations** for low latency
- **Enterprise-grade security** and compliance

#### Getting Started

1. **Contact us for private preview access**:
   - Email: [contact@exosphere.host](mailto:contact@exosphere.host)
   - Discord: [Join our community](https://discord.gg/exosphere)
   - GitHub: [Open an issue](https://github.com/exospherehost/exospherehost/issues)

2. **Receive your credentials**:
   - API endpoint URL
   - API key for authentication
   - Namespace configuration

3. **Configure your environment**:
   ```bash
   export EXOSPHERE_STATE_MANAGER_URI="https://api.exosphere.host"
   export EXOSPHERE_API_KEY="your-production-api-key"
   export EXOSPHERE_NAMESPACE="your-namespace"
   ```

4. **Update your application configuration**:
   ```python
   from exospherehost import Runtime
   
   # Note: Ensure EXOSPHERE_STATE_MANAGER_URI and EXOSPHERE_API_KEY environment variables are set
   Runtime(
       namespace="your-namespace",
       name="YourWorkflow",
       nodes=[YourNodes],
       state_manager_uri="https://api.exosphere.host",
       api_key="your-production-api-key"
   ).start()
   ```

### Option 2: Self-Hosted Deployment

For organizations that need complete control over their infrastructure, you can deploy the state manager on your own infrastructure.

#### Prerequisites

- Kubernetes cluster (recommended) or Docker Swarm
- MongoDB cluster (Atlas, DocumentDB, or self-hosted)
- Load balancer and ingress controller
- SSL certificates for HTTPS

#### Kubernetes Deployment

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
     MONGODB_URI: "mongodb://your-mongodb-cluster:27017/exosphere"
     DATABASE_NAME: "exosphere"
     NAMESPACE: "your-namespace"
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
     API_KEY: <base64-encoded-api-key>
     ENCRYPTION_KEY: <base64-encoded-encryption-key>
   ```

4. **Deploy the state manager**:
   ```bash
   kubectl apply -f k8s/state-manager-deployment.yaml
   kubectl apply -f k8s/state-manager-service.yaml
   kubectl apply -f k8s/state-manager-ingress.yaml
   ```

#### Docker Swarm Deployment

1. **Create a Docker Compose file for production**:
   ```yaml
   version: '3.8'
   
   services:
     state-manager:
       image: ghcr.io/exospherehost/state-manager:latest
       ports:
         - "8000:8000"
       environment:
         - MONGODB_URI=mongodb://your-mongodb-cluster:27017/exosphere
         - DATABASE_NAME=exosphere
         - API_KEY=${API_KEY}
         - NAMESPACE=${NAMESPACE}
         - ENCRYPTION_KEY=${ENCRYPTION_KEY}
       deploy:
         replicas: 3
         update_config:
           parallelism: 1
           delay: 10s
         restart_policy:
           condition: on-failure
   ```

2. **Deploy to swarm**:
   ```bash
   docker stack deploy -c docker-compose.prod.yml exosphere
   ```

## Configuration Reference

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `DATABASE_NAME` | Database name | Yes | `exosphere` |
| `API_KEY` | Secret API key for authentication | Yes | - |
| `NAMESPACE` | Default namespace for operations | Yes | - |
| `ENCRYPTION_KEY` | 32-character key for data encryption | Yes | - |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | No | `INFO` |
| `WORKERS` | Number of worker processes | No | CPU count |
| `HOST` | Host to bind to | No | `0.0.0.0` |
| `PORT` | Port to bind to | No | `8000` |

### Security Considerations

1. **API Key Management**:
   - Use strong, randomly generated API keys
   - Rotate keys regularly
   - Store keys securely (environment variables, secrets management)

2. **Database Security**:
   - Use MongoDB authentication
   - Enable SSL/TLS for database connections
   - Restrict network access to database

3. **Network Security**:
   - Use HTTPS in production
   - Implement proper firewall rules
   - Consider using a reverse proxy (nginx, traefik)

4. **Encryption**:
   - Use a strong 32-character encryption key
   - Store encryption keys securely
   - Never commit keys to version control

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

### Logging

The state manager uses structured logging with the following levels:
- `DEBUG`: Detailed debugging information
- `INFO`: General operational information
- `WARNING`: Warning messages
- `ERROR`: Error messages

### Metrics

Consider implementing monitoring with:
- Prometheus for metrics collection
- Grafana for visualization
- AlertManager for alerting

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**:
   - Verify MongoDB is running
   - Check connection string format
   - Ensure network connectivity

2. **API key authentication failed**:
   - Verify API key is correct
   - Check environment variable is set
   - Ensure key has proper permissions

3. **Encryption key errors**:
   - Verify encryption key is exactly 32 characters
   - Check for special characters in the key
   - Ensure key is properly encoded

4. **Port already in use**:
   - Check if another service is using port 8000
   - Change the port in configuration
   - Stop conflicting services

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
