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

## 🚀 Getting Started

Follow these steps to get the Guild AI platform running on your local machine.

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

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
