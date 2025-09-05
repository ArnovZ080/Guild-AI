# Guild AI - Your Autonomous AI Workforce

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Guild is an AI Workforce platform designed specifically for solopreneurs and lean teams. It uses a multi-agent architecture with specialized roles for research, marketing, content creation, and more, all coordinated by a powerful workflow engine. The goal is to automate the vast majority of a solopreneur's tasks, allowing them to focus on their core business and strategic growth.

## ✨ Key Features

-   **Autonomous AI Agents:** A full suite of specialized agents including Content Creators, Researchers, Marketers, Sales Agents, and more.
-   **Visual Workflow Builder:** A drag-and-drop interface to create, manage, and execute complex business processes.
-   **Dynamic & Adaptive UI:** A psychologically-optimized dashboard that provides at-a-glance business intelligence and motivational feedback.
-   **Multi-source Data Integration:** A powerful RAG pipeline that connects to local files, Google Drive, Notion, and more.
-   **Visual Automation:** Agents can see and interact with applications on your screen, just like a human assistant.
-   **Comprehensive Monitoring:** A full monitoring stack with Prometheus and Grafana to observe system health.

## 🛠️ Tech Stack

-   **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Flow
-   **Backend & AI:** Python, FastAPI, LangChain, Celery
-   **Core AI Models:** Ollama, Sentence Transformers
-   **Databases:** PostgreSQL (Primary), Redis (Caching & Queues)
-   **Vector Store:** Qdrant
-   **Infrastructure:** Docker, MinIO (Object Storage)

### Advanced Integrations
- **Web Scraping**: Scrapy-based lead generation with data enrichment
- **Lead Personalization**: Sales psychology-based outreach automation
- **Financial Automation**: Accounting reports and financial health analysis
- **Content Creation**: AI-powered image, video, and audio generation
- **Visual Automation**: PyAutoGUI + Selenium for any application automation
- **Document Processing**: MarkItDown for handling non-LLM-ready formats

### Specialized AI Agents
- **🎯 Executive Layer**: Chief of Staff, Strategy, and Business Strategist agents
- **🎨 Content Creation**: Brief Generator, Ad Copy, Content Strategist, Social Media, and Writer agents
- **🔍 Research & Data**: Research, Advanced Scraper, Lead Personalization, and Data Enrichment agents
- **💰 Financial & Business**: Accounting and Analytics agents
- **🎨 Creative & Media**: Image Generation, Voice, Video Editor, and Document Processing agents
- **🤖 Automation**: Unified Automation, Visual Automation, and Selenium Automation agents
- **🔍 Evaluator League**: Judge, Fact Checker, Brand Checker, and SEO Evaluator agents
- **🎛️ Orchestration**: Workflow Manager, Pre-flight Planner, Contract Compiler, and Quality Controller agents

## 🏗️ Architecture

## 🚀 Getting Started

Follow these steps to get the Guild AI platform running on your local machine.

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
    + MarkItDown (document conversion & transcription)
```

### Prerequisites

-   Git
-   Docker & Docker Compose
-   Python 3.11+
-   Node.js 18+ & pnpm

### 1. Clone the Repository

```bash
git clone <your-repo-url> guild-ai
cd guild-ai
```

### 2. Create Environment File

Create a `.env` file in the root of the project by copying the example below. This file contains all the necessary credentials and configuration for the services.

```env
# .env

# PostgreSQL
POSTGRES_USER=guild
POSTGRES_PASSWORD=guild
POSTGRES_DB=guild
DATABASE_URL=postgresql+psycopg://guild:guild@localhost:5432/guild

# Redis
REDIS_URL=redis://localhost:6379/0

# Qdrant
QDRANT_URL=http://localhost:6333

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_URL=http://localhost:9000

# LLM (local default)
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434

# MarkItDown Configuration (for document conversion & transcription)
MARKITDOWN_ENABLE_PLUGINS=true
MARKITDOWN_MAX_FILE_SIZE_MB=100
MARKITDOWN_AUDIO_TRANSCRIPTION=true
MARKITDOWN_YOUTUBE_TRANSCRIPTION=true

# Agent Configuration
AGENT_MAX_ITERATIONS=3
AGENT_TIMEOUT_MINUTES=30
AGENT_QUALITY_THRESHOLD=0.8
AGENT_CONFIDENCE_THRESHOLD=0.55

# CORS (for frontend)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Run the Application

With Docker running, start all the services using Docker Compose:

```bash
# Note: You may need to run this with sudo depending on your Docker setup
docker compose up -d
```

This command will build the necessary images and start all services in detached mode. This may take a few minutes on the first run as it downloads the service images.

### 4. Accessing the Application

Once all services are running, you can access the different parts of the platform:

-   **Frontend Application:** `http://localhost:3000`
-   **Backend API Docs:** `http://localhost:5001/docs`
-   **MinIO Console:** `http://localhost:9001` (Use the credentials from your `.env` file)
-   **Grafana Dashboard:** `http://localhost:3001`

## 🧪 Running Tests

To run the backend test suite, first ensure you have the Python dependencies installed locally.

```bash
# From the project root
pip install -e ./guild
pip install -e ./api_server
pip install pytest httpx

# Run the tests
python -m pytest api_server/tests/
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

## 📄 License

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the [troubleshooting guide](docs/troubleshooting.md)
- Review the [API documentation](docs/api.md)

## 🗺️ Roadmap

### Phase 1 (Completed)
- ✅ Basic workflow orchestration
- ✅ Data room management
- ✅ OAuth integrations
- ✅ Agent system foundation
- ✅ MarkItDown document processing integration
- ✅ Advanced web scraping with Scrapy
- ✅ Data enrichment and lead validation
- ✅ Enhanced agent prompts and guidelines
- ✅ Creative media generation (images, video, audio)
- ✅ Financial automation and accounting reports
- ✅ Visual and web automation capabilities

### Phase 2 (Current - Backend Complete)
- ✅ Advanced agent prompts and tools
- ✅ Lead personalization and sales psychology
- ✅ Content strategy and calendar generation
- ✅ Multi-format document processing
- ✅ Local AI model integration (no API costs)
- ✅ Comprehensive automation framework
- [ ] Real-time workflow monitoring dashboard
- [ ] Performance analytics and reporting
- [ ] Frontend integration and user interface

### Phase 3 (Next - Frontend Integration)
- [ ] Complete web application interface
- [ ] Real-time agent execution monitoring
- [ ] Interactive workflow builder
- [ ] Advanced scheduling and automation
- [ ] User management and authentication
- [ ] Multi-tenant support

### Phase 4 (Future)
- [ ] Custom agent development tools
- [ ] Enterprise integrations
- [ ] Advanced AI model fine-tuning
- [ ] Marketplace for custom agents
- [ ] API ecosystem and third-party integrations

## 🏷️ Version History

- **v2.0.0** - Complete backend with advanced integrations (Current)
  - Advanced web scraping with Scrapy
  - Lead personalization and sales psychology
  - Creative media generation (images, video, audio)
  - Financial automation and accounting
  - Visual and web automation
  - Enhanced agent prompts and guidelines
  - MarkItDown document processing
- **v1.5.0** - Enhanced agent capabilities
  - Advanced scraper agent with ethical guidelines
  - Content strategist with multi-platform planning
  - Lead personalization with sales psychology
  - Creative media generation agents
- **v1.0.0** - Initial release with core functionality
  - Basic workflow orchestration
  - Data room management
  - OAuth integrations
  - Agent system foundation
- **v0.9.0** - Beta release with basic features
- **v0.1.0** - Alpha release for testing

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the development team
