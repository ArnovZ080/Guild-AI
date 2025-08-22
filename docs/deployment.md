# Deployment Guide

This guide covers deploying the Hybrid Storage Workflow System to various environments including development, staging, and production.

## Prerequisites

- Docker and Docker Compose (recommended for production)
- Python 3.11+ and Node.js 20+ (for manual deployment)
- Access to external services (MinIO, Qdrant, OAuth providers)

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Update the following critical variables for production:

```env
# Production Configuration
FLASK_ENV=production
SECRET_KEY=your-strong-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/workflow_db

# OAuth Credentials (obtain from respective providers)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... other OAuth credentials

# External Services
MINIO_ENDPOINT=your-minio-endpoint
QDRANT_HOST=your-qdrant-host
OPENAI_API_KEY=your-openai-api-key
```

### 2. OAuth Provider Setup

#### Google Drive Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `https://yourdomain.com/api/oauth/gdrive/callback`

#### Notion Integration
1. Go to [Notion Developers](https://developers.notion.com/)
2. Create a new integration
3. Configure OAuth settings
4. Add redirect URI: `https://yourdomain.com/api/oauth/notion/callback`

#### Microsoft OneDrive Integration
1. Go to [Azure App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
2. Register a new application
3. Configure API permissions for Microsoft Graph
4. Add redirect URI: `https://yourdomain.com/api/oauth/onedrive/callback`

#### Dropbox Integration
1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Create a new app
3. Configure OAuth settings
4. Add redirect URI: `https://yourdomain.com/api/oauth/dropbox/callback`

## Docker Deployment (Recommended)

### 1. Create Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/workflow_db
      - MINIO_ENDPOINT=minio:9000
      - QDRANT_HOST=qdrant
    env_file:
      - .env
    depends_on:
      - db
      - minio
      - qdrant
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=workflow_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # MinIO (Object Storage)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped

  # Qdrant (Vector Database)
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

  # Redis (Optional - for caching and task queues)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
  qdrant_data:
  redis_data:
```

### 2. Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "src/main.py"]
```

### 3. Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4. Create Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

### 5. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull
docker-compose up -d --build
```

## Manual Deployment

### 1. Backend Deployment

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up database
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"

# Run with Gunicorn (production WSGI server)
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 src.main:app
```

### 2. Frontend Deployment

```bash
cd frontend

# Install dependencies
pnpm install

# Build for production
pnpm run build

# Serve with a static file server
npx serve -s dist -l 3000
```

### 3. Process Management with PM2

Install PM2 for process management:

```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'workflow-backend',
      cwd: './backend',
      script: 'venv/bin/gunicorn',
      args: '--bind 0.0.0.0:5000 --workers 4 src.main:app',
      env: {
        FLASK_ENV: 'production'
      }
    },
    {
      name: 'workflow-frontend',
      cwd: './frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000'
    }
  ]
}
EOF

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Build and push Docker images to ECR**:

```bash
# Create ECR repositories
aws ecr create-repository --repository-name workflow-backend
aws ecr create-repository --repository-name workflow-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
docker build -t workflow-backend ./backend
docker tag workflow-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-backend:latest

docker build -t workflow-frontend ./frontend
docker tag workflow-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-frontend:latest
```

2. **Create ECS task definition**:

```json
{
  "family": "workflow-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/workflow-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/workflow-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Using AWS Lambda (Serverless)

For the backend API, you can deploy using AWS Lambda with the Serverless Framework:

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml
cat > serverless.yml << EOF
service: workflow-system

provider:
  name: aws
  runtime: python3.11
  region: us-east-1
  environment:
    FLASK_ENV: production
    DATABASE_URL: \${env:DATABASE_URL}

functions:
  app:
    handler: src.lambda_handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-python-requirements
  - serverless-wsgi

custom:
  wsgi:
    app: src.main.app
  pythonRequirements:
    dockerizePip: true
EOF

# Deploy
serverless deploy
```

### Google Cloud Platform Deployment

#### Using Cloud Run

```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT-ID/workflow-backend ./backend
gcloud run deploy workflow-backend --image gcr.io/PROJECT-ID/workflow-backend --platform managed --region us-central1 --allow-unauthenticated

# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/workflow-frontend ./frontend
gcloud run deploy workflow-frontend --image gcr.io/PROJECT-ID/workflow-frontend --platform managed --region us-central1 --allow-unauthenticated
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name workflow-system --location eastus

# Create container group
az container create \
  --resource-group workflow-system \
  --name workflow-system \
  --image your-registry/workflow-backend:latest \
  --dns-name-label workflow-system \
  --ports 5000
```

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Monitoring

```bash
# Install monitoring tools
pip install prometheus-flask-exporter
npm install @prometheus/client

# Add to backend main.py
from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)
```

### Log Aggregation

```yaml
# Add to docker-compose.yml
  logging:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres workflow_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -h localhost -U postgres workflow_db < backup_20240115_120000.sql
```

### MinIO Backup

```bash
# Install MinIO client
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc

# Configure client
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Backup
mc mirror myminio/workspace-bucket ./backup/workspace/
```

## Performance Optimization

### Backend Optimization

1. **Database Connection Pooling**:
```python
# Add to config.py
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 20,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

2. **Caching with Redis**:
```python
# Install redis
pip install redis flask-caching

# Add to main.py
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'redis'})
```

### Frontend Optimization

1. **Build Optimization**:
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
}
```

2. **CDN Configuration**:
```nginx
# Add to nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

1. **OAuth Redirect URI Mismatch**:
   - Ensure redirect URIs in OAuth provider settings match your deployment URL
   - Check for HTTP vs HTTPS mismatches

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check network connectivity between services
   - Ensure database is initialized with proper schema

3. **CORS Issues**:
   - Verify CORS configuration in Flask app
   - Check that frontend is making requests to correct backend URL

4. **File Upload Issues**:
   - Ensure upload directories have proper permissions
   - Check MinIO connectivity and credentials

### Health Check Endpoints

Add health check endpoints for monitoring:

```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/ready')
def readiness_check():
    # Check database connectivity
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'ready'})
    except Exception as e:
        return jsonify({'status': 'not ready', 'error': str(e)}), 503
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **HTTPS**: Always use HTTPS in production
3. **Authentication**: Implement proper user authentication and authorization
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Security Headers**: Configure appropriate security headers
7. **Regular Updates**: Keep dependencies updated

For additional security measures, refer to the [Security Guide](security.md).

