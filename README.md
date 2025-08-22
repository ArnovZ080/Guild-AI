# Hybrid Storage Workflow System

A comprehensive web application that orchestrates AI agents with connected data sources for automated content creation. This system implements a hybrid storage architecture that seamlessly integrates workspace storage with external cloud providers like Google Drive, Notion, OneDrive, and Dropbox.

## 🚀 Features

### Core Capabilities
- **Multi-Agent Orchestration**: Coordinate specialized AI agents for content creation, fact-checking, and quality assurance
- **Hybrid Storage Integration**: Connect and sync data from multiple sources including workspace storage and cloud providers
- **Workflow Automation**: Plan → Approve → Run → QA pipeline for automated content generation
- **Real-time Collaboration**: OAuth-based connections to external data sources with persistent authentication
- **Quality Control**: Comprehensive evaluation system with fact-checking, brand compliance, and SEO optimization

### Supported Data Sources
- **Workspace Storage**: Local MinIO-based file storage
- **Google Drive**: OAuth-connected cloud storage with folder synchronization
- **Notion**: Database and page content integration
- **OneDrive**: Microsoft cloud storage connectivity
- **Dropbox**: File sharing platform integration

### Content Deliverables
- Project briefs and requirements documentation
- Marketing advertisements and copy
- Content calendars and scheduling
- Product listing packages
- SEO optimization checklists

## 🏗️ Architecture

The system follows a microservices architecture with clear separation between frontend, backend, and data layers:

```
┌─────────────────────────────┐
│           Web UI            │
│ Plan → Approve → Run → QA   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     Outcome Contract        │
│  (objective, deliverables,  │
│   data rooms, rubric, etc.) │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Contract Compiler       │
│   → Workforce DAG (nodes)    │
└──────────────┬──────────────┘
               │
  ┌────────────┴──────────────┐
  ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│ Workforce Orchestrator  │   │     Evaluator League     │
│ (CrewAI + Prefect DAG)  │   │  Fact/Brand/Rubric/SEO   │
└────────────┬────────────┘   └────────────┬────────────┘
             │                             │
             ▼                             ▼
  ┌───────────────────┐        ┌─────────────────────────┐
  │  Storage Abstraction◄──────►│  Provenance & Ledger    │
  │  Layer (Data Rooms) │        │  (artifacts, scores)   │
  └─────────┬──────────┘        └─────────────────────────┘
            │
┌──────────────┼───────────────────────────────────────────────┐
│              │                                               │
▼              ▼                                               ▼
┌───────────┐  ┌───────────┐                             ┌────────────────┐
│ Workspace │  │ Connectors │──► GDrive / Notion / OneDrive / Dropbox ... │
│ (Postgres │  │  (OAuth)   │                                             │
│ + MinIO)  │  └───────────┘                             └────────────────┘
└───────────┘
           ▲
           │
           ▼
    Qdrant + LlamaIndex (embeddings & retrieval)
```

## 📋 Prerequisites

- Python 3.11+
- Node.js 20+
- pnpm (for frontend package management)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-app
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
pnpm install
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database Configuration
DATABASE_URL=sqlite:///app.db

# OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
DROPBOX_CLIENT_ID=your-dropbox-client-id
DROPBOX_CLIENT_SECRET=your-dropbox-client-secret

# MinIO Configuration (for workspace storage)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_SECURE=false

# Qdrant Configuration (for vector storage)
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=your-qdrant-api-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE=https://api.openai.com/v1

# Agent Configuration
AGENT_MAX_ITERATIONS=3
AGENT_TIMEOUT_MINUTES=30
AGENT_QUALITY_THRESHOLD=0.8
AGENT_CONFIDENCE_THRESHOLD=0.55
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend**:
```bash
cd backend
source venv/bin/activate
python src/main.py
```
The backend will be available at `http://localhost:5000`

2. **Start the Frontend**:
```bash
cd frontend
pnpm run dev
```
The frontend will be available at `http://localhost:5173`

### Production Mode

See the [Deployment Guide](docs/deployment.md) for production deployment instructions.

## 📚 API Documentation

### Data Rooms API

#### GET /api/data-rooms
Get all data rooms
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Marketing Assets",
      "provider": "gdrive",
      "config": {"folder_id": "abc123"},
      "read_only": true,
      "last_sync_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/data-rooms
Create a new data room
```json
{
  "name": "Project Documentation",
  "provider": "notion",
  "config": {"database_id": "def456"},
  "read_only": true
}
```

#### POST /api/data-rooms/{id}/sync
Sync a data room with its provider

### OAuth API

#### GET /api/oauth/{provider}/start
Start OAuth flow for a provider (gdrive, notion, onedrive, dropbox)

#### GET /api/oauth/{provider}/callback
Handle OAuth callback from provider

#### GET /api/oauth/credentials
Get all stored OAuth credentials

### Workflows API

#### POST /api/contracts
Create a new outcome contract
```json
{
  "title": "Q1 Marketing Campaign",
  "objective": "Create comprehensive marketing materials for product launch",
  "deliverables": ["brief", "ads", "calendar"],
  "data_rooms": ["room-id-1", "room-id-2"],
  "rubric": {
    "quality_threshold": 0.8,
    "fact_check_required": true,
    "brand_compliance": true,
    "seo_optimization": false
  }
}
```

#### POST /api/contracts/{id}/compile
Compile a contract into an executable workflow

#### POST /api/workflows/{id}/execute
Start workflow execution

#### GET /api/workflows/{id}/deliverables
Get deliverables for a workflow

## 🔧 Configuration

### Agent Configuration

The system supports various agent types with configurable parameters:

```json
{
  "workforce_agents": {
    "brief_generator": {
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000,
      "tools": ["rag_search", "web_search"]
    },
    "ad_copy_writer": {
      "model": "gpt-4",
      "temperature": 0.8,
      "max_tokens": 1500,
      "tools": ["rag_search", "sentiment_analysis"]
    }
  },
  "evaluator_agents": {
    "fact_checker": {
      "model": "gpt-4",
      "temperature": 0.2,
      "confidence_threshold": 0.8,
      "tools": ["rag_search", "web_search", "fact_verification"]
    },
    "brand_checker": {
      "model": "gpt-4",
      "temperature": 0.3,
      "brand_guidelines_weight": 0.9,
      "tools": ["rag_search", "brand_analysis"]
    }
  }
}
```

### Data Source Configuration

Each data source requires specific configuration parameters:

- **Google Drive**: `folder_id` or `drive_id`
- **Notion**: `database_id` or `page_id`
- **OneDrive**: `site_id` and `drive_id`
- **Dropbox**: `folder_path`

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

### Integration Tests
```bash
# Run both backend and frontend, then:
pnpm run test:e2e
```

## 📖 Documentation

- [Agent System Documentation](AGENTS.md) - Detailed information about the agent architecture
- [API Reference](docs/api.md) - Complete API documentation
- [Deployment Guide](docs/deployment.md) - Production deployment instructions
- [Development Guide](docs/development.md) - Development setup and guidelines
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React code
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the [troubleshooting guide](docs/troubleshooting.md)
- Review the [API documentation](docs/api.md)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic workflow orchestration
- ✅ Data room management
- ✅ OAuth integrations
- ✅ Agent system foundation

### Phase 2 (Next)
- [ ] Advanced agent prompts and tools
- [ ] Real-time workflow monitoring
- [ ] Enhanced quality evaluation
- [ ] Performance analytics dashboard

### Phase 3 (Future)
- [ ] Multi-tenant support
- [ ] Advanced scheduling and automation
- [ ] Custom agent development tools
- [ ] Enterprise integrations

## 🏷️ Version History

- **v1.0.0** - Initial release with core functionality
- **v0.9.0** - Beta release with basic features
- **v0.1.0** - Alpha release for testing

---

Built with ❤️ by the development team

