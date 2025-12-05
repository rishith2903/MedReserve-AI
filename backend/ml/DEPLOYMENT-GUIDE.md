# MedReserve AI ML Service - Production Deployment Guide

This guide provides comprehensive instructions for deploying the MedReserve AI ML Service to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Platform Deployment](#cloud-platform-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All models are trained and tested
- [ ] Environment variables are configured
- [ ] Security measures are implemented
- [ ] Logging is configured properly
- [ ] Health checks are working
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

## Docker Deployment

### Build Production Image

```bash
# Build the optimized production image
docker build -f Dockerfile.production -t medreserve-ml:v1.0.0 .

# Tag for registry
docker tag medreserve-ml:v1.0.0 your-registry.com/medreserve-ml:v1.0.0

# Push to registry
docker push your-registry.com/medreserve-ml:v1.0.0
```

### Run Container

```bash
# Basic deployment
docker run -d \
  --name medreserve-ml \
  -p 5001:5001 \
  -e LOG_LEVEL=INFO \
  -e PORT=5001 \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:5001/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  medreserve-ml:v1.0.0
```

### Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  medreserve-ml:
    image: medreserve-ml:v1.0.0
    container_name: medreserve-ml
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - LOG_LEVEL=INFO
      - PYTHONUNBUFFERED=1
    volumes:
      - ./models:/app/models:ro
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - medreserve-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

networks:
  medreserve-network:
    driver: bridge
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Cloud Platform Deployment

### AWS Elastic Container Service (ECS)

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name medreserve-ml
```

2. **Push Image to ECR**
```bash
# Get login credentials
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag medreserve-ml:v1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/medreserve-ml:v1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/medreserve-ml:v1.0.0
```

3. **Create ECS Task Definition** (task-definition.json)
```json
{
  "family": "medreserve-ml",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "medreserve-ml",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/medreserve-ml:v1.0.0",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "LOG_LEVEL",
          "value": "INFO"
        },
        {
          "name": "PORT",
          "value": "5001"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5001/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/medreserve-ml",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

4. **Create ECS Service**
```bash
aws ecs create-service \
  --cluster your-cluster \
  --service-name medreserve-ml \
  --task-definition medreserve-ml \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/medreserve-ml

# Deploy to Cloud Run
gcloud run deploy medreserve-ml \
  --image gcr.io/PROJECT-ID/medreserve-ml \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars LOG_LEVEL=INFO,PORT=5001
```

### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name medreserve-rg --location eastus

# Create container registry
az acr create --resource-group medreserve-rg --name medreserveacr --sku Basic

# Push image
az acr login --name medreserveacr
docker tag medreserve-ml:v1.0.0 medreserveacr.azurecr.io/medreserve-ml:v1.0.0
docker push medreserveacr.azurecr.io/medreserve-ml:v1.0.0

# Deploy container
az container create \
  --resource-group medreserve-rg \
  --name medreserve-ml \
  --image medreserveacr.azurecr.io/medreserve-ml:v1.0.0 \
  --cpu 2 \
  --memory 2 \
  --registry-login-server medreserveacr.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --dns-name-label medreserve-ml \
  --ports 5001 \
  --environment-variables LOG_LEVEL=INFO PORT=5001
```

### Render.com

Create `render.yaml`:

```yaml
services:
  - type: web
    name: medreserve-ml
    env: docker
    dockerfilePath: ./Dockerfile.production
    region: oregon
    plan: starter
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 5001
      - key: LOG_LEVEL
        value: INFO
      - key: PYTHON_VERSION
        value: 3.11
```

## Environment Configuration

### Required Environment Variables

```bash
# Service Configuration
PORT=5001
LOG_LEVEL=INFO
DEBUG=false

# Python Configuration
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# NLTK Configuration
NLTK_DATA=/app/nltk_data

# Application Path
PYTHONPATH=/app
```

### Optional Environment Variables

```bash
# Gunicorn Workers
GUNICORN_WORKERS=2
GUNICORN_THREADS=4
GUNICORN_TIMEOUT=120

# Model Configuration
MODEL_DIR=/app/models
DATASET_DIR=/app/dataset
```

## Security Hardening

### 1. Use HTTPS

Configure your reverse proxy (Nginx/Traefik) with SSL:

**Nginx Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.medreserve.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. API Authentication

Implement API key authentication:

```python
# Add to api/ml_api.py
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != os.environ.get('API_KEY'):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/predict/specialization', methods=['POST'])
@require_api_key
def predict_specialization():
    # ... existing code
```

### 3. Rate Limiting

Use a reverse proxy or add Flask-Limiter:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/predict/specialization', methods=['POST'])
@limiter.limit("10 per minute")
def predict_specialization():
    # ... existing code
```

### 4. Security Headers

Add security headers:

```python
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

## Monitoring & Maintenance

### Health Monitoring

```bash
# Manual health check
curl https://api.medreserve.com/health

# Automated monitoring with cron
*/5 * * * * curl -f https://api.medreserve.com/health || alert@example.com
```

### Log Monitoring

```bash
# View logs
docker logs -f medreserve-ml

# With timestamp
docker logs -f --timestamps medreserve-ml

# Last 100 lines
docker logs --tail 100 medreserve-ml
```

### Prometheus Metrics (Optional)

Add metrics endpoint:

```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='1.0.0')
```

### Backup Strategy

```bash
# Backup models
tar -czf models-backup-$(date +%Y%m%d).tar.gz models/

# Backup to S3
aws s3 cp models-backup-$(date +%Y%m%d).tar.gz s3://your-bucket/backups/
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs medreserve-ml

# Inspect container
docker inspect medreserve-ml

# Check resource usage
docker stats medreserve-ml
```

### High Memory Usage

```bash
# Monitor memory
docker stats --no-stream medreserve-ml

# Reduce Gunicorn workers
docker run -e GUNICORN_WORKERS=1 ...
```

### Model Loading Failures

```bash
# Check model files
docker exec medreserve-ml ls -la /app/models/

# Retrain models
docker exec medreserve-ml python train_all_models.py
```

### Network Issues

```bash
# Test connectivity
docker exec medreserve-ml curl -I https://www.google.com

# Check DNS
docker exec medreserve-ml nslookup google.com

# Test health endpoint
docker exec medreserve-ml curl -f http://localhost:5001/health
```

## Performance Tuning

### Optimize Workers

```bash
# Formula: (2 x CPU cores) + 1
# For 2 CPU cores: (2 x 2) + 1 = 5 workers
GUNICORN_WORKERS=5
```

### Enable Response Compression

```python
from flask_compress import Compress

Compress(app)
```

### Database Connection Pooling (if using DB)

```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

## Rollback Strategy

```bash
# Tag previous version
docker tag medreserve-ml:v1.0.0 medreserve-ml:v1.0.0-backup

# Rollback
docker stop medreserve-ml
docker rm medreserve-ml
docker run -d --name medreserve-ml medreserve-ml:v0.9.0
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -f Dockerfile.production -t medreserve-ml:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push medreserve-ml:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull medreserve-ml:${{ github.sha }}
            docker stop medreserve-ml || true
            docker rm medreserve-ml || true
            docker run -d --name medreserve-ml medreserve-ml:${{ github.sha }}
```

## Support

For production support:
- Email: support@medreserve.com
- Docs: https://docs.medreserve.com
- Status: https://status.medreserve.com

---

**Last Updated:** October 2024
