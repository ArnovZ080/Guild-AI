# API Reference

This document provides comprehensive documentation for the Hybrid Storage Workflow System API.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://yourdomain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Data Rooms API

### List Data Rooms

```http
GET /api/data-rooms
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Marketing Assets",
      "provider": "gdrive",
      "config": {
        "folder_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      },
      "read_only": true,
      "last_sync_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Data Room

```http
POST /api/data-rooms
```

**Request Body:**
```json
{
  "name": "Project Documentation",
  "provider": "notion",
  "config": {
    "database_id": "32d6e2b0-4bd6-4e7d-a890-123456789abc"
  },
  "read_only": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Project Documentation",
    "provider": "notion",
    "config": {
      "database_id": "32d6e2b0-4bd6-4e7d-a890-123456789abc"
    },
    "read_only": true,
    "last_sync_at": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Data Room

```http
GET /api/data-rooms/{id}
```

**Parameters:**
- `id` (string): Data room UUID

### Update Data Room

```http
PUT /api/data-rooms/{id}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "config": {
    "folder_id": "new-folder-id"
  },
  "read_only": false
}
```

### Delete Data Room

```http
DELETE /api/data-rooms/{id}
```

### Sync Data Room

```http
POST /api/data-rooms/{id}/sync
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Data room sync initiated",
    "last_sync_at": "2024-01-15T10:30:00Z",
    "sync_id": "sync-550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Get Data Room Documents

```http
GET /api/data-rooms/{id}/documents
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `status` (string): Filter by status (indexed, stale, error)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "source_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        "data_room_id": "550e8400-e29b-41d4-a716-446655440000",
        "provider": "gdrive",
        "path": "/Marketing/Campaign Brief.docx",
        "mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "updated_at": "2024-01-15T09:00:00Z",
        "hash": "sha256:abc123...",
        "status": "indexed",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Available Providers

```http
GET /api/providers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workspace",
      "name": "Workspace",
      "oauth_required": false,
      "description": "Local workspace storage"
    },
    {
      "id": "gdrive",
      "name": "Google Drive",
      "oauth_required": true,
      "description": "Google Drive cloud storage"
    },
    {
      "id": "notion",
      "name": "Notion",
      "oauth_required": true,
      "description": "Notion workspace and databases"
    },
    {
      "id": "onedrive",
      "name": "OneDrive",
      "oauth_required": true,
      "description": "Microsoft OneDrive cloud storage"
    },
    {
      "id": "dropbox",
      "name": "Dropbox",
      "oauth_required": true,
      "description": "Dropbox file sharing platform"
    }
  ]
}
```

## OAuth API

### Start OAuth Flow

```http
GET /api/oauth/{provider}/start
```

**Parameters:**
- `provider` (string): Provider ID (gdrive, notion, onedrive, dropbox)

**Query Parameters:**
- `redirect_uri` (string): Optional custom redirect URI

**Response:**
```json
{
  "success": true,
  "data": {
    "auth_url": "https://accounts.google.com/oauth/authorize?client_id=...",
    "state": "random-state-string"
  }
}
```

### OAuth Callback

```http
GET /api/oauth/{provider}/callback
```

**Query Parameters:**
- `code` (string): Authorization code from provider
- `state` (string): State parameter for CSRF protection

**Response:**
```json
{
  "success": true,
  "data": {
    "credential_id": 1,
    "provider": "gdrive",
    "account_id": "user@gmail.com",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

### List OAuth Credentials

```http
GET /api/oauth/credentials
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider": "gdrive",
      "account_id": "user@gmail.com",
      "expires_at": "2024-12-31T23:59:59Z",
      "scopes": ["https://www.googleapis.com/auth/drive.readonly"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Delete OAuth Credential

```http
DELETE /api/oauth/credentials/{id}
```

**Parameters:**
- `id` (integer): Credential ID

## Workflows API

### List Outcome Contracts

```http
GET /api/contracts
```

**Query Parameters:**
- `status` (string): Filter by status (draft, approved, executing, completed, failed)
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Q1 Marketing Campaign",
        "objective": "Create comprehensive marketing materials for product launch",
        "deliverables": ["brief", "ads", "calendar"],
        "data_rooms": ["room-id-1", "room-id-2"],
        "rubric": {
          "quality_threshold": 0.8,
          "fact_check_required": true,
          "brand_compliance": true,
          "seo_optimization": false
        },
        "status": "draft",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Create Outcome Contract

```http
POST /api/contracts
```

**Request Body:**
```json
{
  "title": "Q1 Marketing Campaign",
  "objective": "Create comprehensive marketing materials for product launch including briefs, ad copy, and content calendar",
  "deliverables": ["brief", "ads", "calendar"],
  "data_rooms": ["550e8400-e29b-41d4-a716-446655440000"],
  "rubric": {
    "quality_threshold": 0.8,
    "fact_check_required": true,
    "brand_compliance": true,
    "seo_optimization": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Q1 Marketing Campaign",
    "objective": "Create comprehensive marketing materials for product launch including briefs, ad copy, and content calendar",
    "deliverables": ["brief", "ads", "calendar"],
    "data_rooms": ["550e8400-e29b-41d4-a716-446655440000"],
    "rubric": {
      "quality_threshold": 0.8,
      "fact_check_required": true,
      "brand_compliance": true,
      "seo_optimization": false
    },
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Outcome Contract

```http
GET /api/contracts/{id}
```

### Update Outcome Contract

```http
PUT /api/contracts/{id}
```

**Request Body:** Same as create contract

### Compile Workflow

```http
POST /api/contracts/{id}/compile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "workflow-550e8400-e29b-41d4-a716-446655440000",
    "contract_id": "550e8400-e29b-41d4-a716-446655440001",
    "dag_definition": {
      "nodes": [
        {
          "id": "research",
          "type": "agent",
          "name": "Research Agent",
          "dependencies": []
        },
        {
          "id": "content",
          "type": "agent",
          "name": "Content Creator",
          "dependencies": ["research"]
        },
        {
          "id": "fact_check",
          "type": "evaluator",
          "name": "Fact Checker",
          "dependencies": ["content"]
        },
        {
          "id": "brand_check",
          "type": "evaluator",
          "name": "Brand Checker",
          "dependencies": ["content"]
        },
        {
          "id": "final",
          "type": "orchestrator",
          "name": "Final Review",
          "dependencies": ["fact_check", "brand_check"]
        }
      ]
    },
    "status": "pending",
    "estimated_duration": "15-30 minutes",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Workflow

```http
GET /api/workflows/{id}
```

### Execute Workflow

```http
POST /api/workflows/{id}/execute
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Workflow execution started",
    "workflow_id": "workflow-550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "execution_id": "exec-550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Pause Workflow

```http
POST /api/workflows/{id}/pause
```

### Resume Workflow

```http
POST /api/workflows/{id}/resume
```

### Stop Workflow

```http
POST /api/workflows/{id}/stop
```

### Get Workflow Deliverables

```http
GET /api/workflows/{id}/deliverables
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "workflow_id": "workflow-550e8400-e29b-41d4-a716-446655440000",
      "type": "brief",
      "title": "Marketing Brief Q1 2024",
      "content": "# Marketing Brief\n\n## Objective\n...",
      "metadata": {
        "word_count": 1500,
        "reading_time": "6 minutes"
      },
      "quality_score": 0.92,
      "status": "draft",
      "file_path": "/deliverables/brief_20240115_103000.md",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Deliverables API

### Get Deliverable

```http
GET /api/deliverables/{id}
```

### Evaluate Deliverable

```http
POST /api/deliverables/{id}/evaluate
```

**Request Body:**
```json
{
  "evaluator_type": "fact_checker",
  "score": 0.85,
  "feedback": "Most facts are verified, but need to check the market share statistics.",
  "criteria": {
    "accuracy": 0.9,
    "completeness": 0.8,
    "relevance": 0.85
  },
  "source_citations": [
    {
      "provider": "gdrive",
      "data_room_id": "550e8400-e29b-41d4-a716-446655440000",
      "source_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      "path": "/Marketing/Market Research.pdf",
      "confidence": 0.9
    }
  ]
}
```

### Approve Deliverable

```http
POST /api/deliverables/{id}/approve
```

### Reject Deliverable

```http
POST /api/deliverables/{id}/reject
```

**Request Body:**
```json
{
  "reason": "Content does not meet brand guidelines",
  "feedback": "Please revise the tone to match our brand voice",
  "regenerate": true
}
```

## Users API

### List Users

```http
GET /api/users
```

### Create User

```http
POST /api/users
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Get User

```http
GET /api/users/{id}
```

### Update User

```http
PUT /api/users/{id}
```

### Delete User

```http
DELETE /api/users/{id}
```

## Search API

### RAG Search

```http
POST /api/search/rag
```

**Request Body:**
```json
{
  "query": "What are our brand guidelines for social media?",
  "data_room_ids": ["550e8400-e29b-41d4-a716-446655440000"],
  "top_k": 5,
  "confidence_threshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "Our social media brand guidelines emphasize authentic engagement...",
        "score": 0.92,
        "source_provenance": {
          "provider": "gdrive",
          "data_room_id": "550e8400-e29b-41d4-a716-446655440000",
          "source_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          "path": "/Brand/Social Media Guidelines.pdf",
          "chunk_ids": ["chunk_1", "chunk_2"],
          "confidence": 0.92
        }
      }
    ],
    "validation": {
      "status": "sufficient",
      "average_confidence": 0.87,
      "message": "Search results have sufficient confidence"
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate name) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `EXTERNAL_SERVICE_ERROR` | External service (OAuth provider, etc.) error |
| `WORKFLOW_ERROR` | Workflow execution error |
| `SYNC_ERROR` | Data synchronization error |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per minute per IP
- **OAuth endpoints**: 10 requests per minute per IP
- **Workflow execution**: 5 requests per minute per user
- **Search endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

### Workflow Status Updates

Register webhook URLs to receive workflow status updates:

```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/workflow-status",
  "events": ["workflow.started", "workflow.completed", "workflow.failed"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload:**
```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "workflow_id": "workflow-550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "deliverables_count": 3,
    "execution_time": 1800
  }
}
```

## SDK Examples

### Python SDK

```python
import requests

class WorkflowAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_data_room(self, name, provider, config):
        response = requests.post(
            f'{self.base_url}/data-rooms',
            json={
                'name': name,
                'provider': provider,
                'config': config
            },
            headers=self.headers
        )
        return response.json()
    
    def create_contract(self, title, objective, deliverables, data_rooms):
        response = requests.post(
            f'{self.base_url}/contracts',
            json={
                'title': title,
                'objective': objective,
                'deliverables': deliverables,
                'data_rooms': data_rooms
            },
            headers=self.headers
        )
        return response.json()

# Usage
api = WorkflowAPI('https://api.example.com/api', 'your-api-key')
contract = api.create_contract(
    title='Marketing Campaign',
    objective='Create marketing materials',
    deliverables=['brief', 'ads'],
    data_rooms=['room-id-1']
)
```

### JavaScript SDK

```javascript
class WorkflowAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async createDataRoom(name, provider, config) {
    const response = await fetch(`${this.baseUrl}/data-rooms`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name, provider, config })
    });
    return response.json();
  }

  async executeWorkflow(workflowId) {
    const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.headers
    });
    return response.json();
  }
}

// Usage
const api = new WorkflowAPI('https://api.example.com/api', 'your-api-key');
const result = await api.executeWorkflow('workflow-id');
```

## Testing

### API Testing with curl

```bash
# Create data room
curl -X POST https://api.example.com/api/data-rooms \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "provider": "workspace",
    "config": {}
  }'

# Start OAuth flow
curl -X GET "https://api.example.com/api/oauth/gdrive/start" \
  -H "Authorization: Bearer your-api-key"

# Create and execute workflow
curl -X POST https://api.example.com/api/contracts \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Campaign",
    "objective": "Test workflow execution",
    "deliverables": ["brief"],
    "data_rooms": ["room-id"]
  }'
```

### Postman Collection

A Postman collection is available for testing all API endpoints. Import the collection from `docs/postman/workflow-api.json`.

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Data rooms management
- OAuth integrations
- Workflow orchestration
- Deliverables management

### v0.9.0 (2024-01-01)
- Beta API release
- Basic CRUD operations
- Authentication system

For the latest API updates, check the [changelog](../CHANGELOG.md).

