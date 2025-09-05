# Guild: Your AI Workforce

Guild transforms solopreneurs and lean teams into fully equipped companies by providing an **on-demand AI workforce**.  
Instead of juggling multiple AI tools or hiring across disciplines, Guild dynamically builds you a specialized AI team — researchers, marketers, copywriters, campaign planners, scrapers, evaluators, and automation specialists — that execute tasks from end to end.

**🚀 Backend Complete - Ready for Frontend Integration!**

---

## 1. Architecture Implementation

Guild is built on a **multi-agent orchestration architecture** with the following layers:

- **Orchestrator Layer (Workflow Manager + Contract Compiler)**  
  Expands a single user instruction into a project plan. Determines which agents are required, delegates tasks, and manages workflow execution.

- **Specialized Agents (29+ Agents across 8 Categories)**  
  - **🎯 Executive Layer**: Chief of Staff, Strategy, Business Strategist
  - **🎨 Content Creation**: Brief Generator, Ad Copy, Content Strategist, Social Media, Writer
  - **🔍 Research & Data**: Research, Advanced Scraper, Lead Personalization, Data Enrichment
  - **💰 Financial & Business**: Accounting, Analytics
  - **🎨 Creative & Media**: Image Generation, Voice, Video Editor, Document Processing
  - **🤖 Automation**: Unified Automation, Visual Automation, Selenium Automation
  - **🔍 Evaluator League**: Judge, Fact Checker, Brand Checker, SEO Evaluator
  - **🎛️ Orchestration**: Workflow Manager, Pre-flight Planner, Contract Compiler, Quality Controller

- **Advanced Integrations**
  - **Web Scraping**: Scrapy-based lead generation with data enrichment
  - **Lead Personalization**: Sales psychology-based outreach automation
  - **Financial Automation**: Accounting reports and financial health analysis
  - **Creative Media Generation**: AI-powered image, video, and audio creation
  - **Visual Automation**: PyAutoGUI + Selenium for any application automation
  - **Document Processing**: MarkItDown for handling non-LLM-ready formats

- **DataRooms**  
  Structured storage for all outputs:  
  - `/research/` → market reports.  
  - `/content/` → copy, blogs, posts.  
  - `/campaigns/` → strategy docs, calendars.  
  - `/lead_generation/` → scraped leads.  
  - `/evaluation/` → rubrics and scored outputs.  

- **Transparency Layer**  
  Every workflow logs its reasoning, produces a pre-flight summary, and requests user approval before execution. Users can pause, modify, or resume at any step.

---

## 2. Project Structure

```
guild/
├── src/
│   ├── agents/
│   │   ├── research_agent.py
│   │   ├── copywriter_agent.py
│   │   ├── marketing_agent.py
│   │   ├── scraper_agent.py
│   │   ├── judge_agent.py
│   │   ├── campaign_planner_agent.py
│   │   ├── lead_personalization_agent.py
│   │   ├── accounting_agent.py
│   │   ├── image_generation_agent.py
│   │   ├── voice_agent.py
│   │   ├── video_editor_agent.py
│   │   └── unified_automation_agent.py
│   ├── core/
│   │   ├── markitdown_processor.py
│   │   ├── scraping/
│   │   │   └── advanced_scraper.py
│   │   ├── data_enrichment.py
│   │   └── automation/
│   │       └── selenium_automation.py
│   │   ├── orchestrator.py
│   │   ├── rubric.py
│   │   ├── dataroom.py
│   │   └── transparency.py
│   ├── data/
│   │   ├── research/
│   │   ├── content/
│   │   ├── campaigns/
│   │   ├── lead_generation/
│   │   └── evaluation/
│   └── integrations/
│       ├── google_drive.py
│       ├── notion.py
│       ├── onedrive.py
│       └── dropbox.py
├── tests/
│   ├── test_agents.py
│   ├── test_rubric.py
│   ├── test_scraper.py
│   └── test_end_to_end.py
├── AGENTS.md
├── PROJECT_SUMMARY.md
└── README.md
```

---

## 3. Key Features

- **Instruction → Workforce**  
  One instruction expands into a full project plan with specialized agents.

- **Judge Agent & Rubric System**  
  Every workflow begins with a rubric (defining quality) and ends with evaluation against it.

- **Scraper Agent with Audience Clarification**  
  Before scraping, the agent confirms product and ICP (ideal customer profile).  
  If unclear, it asks the user before proceeding. Leads are always filtered.

- **Human-in-the-Loop Transparency**  
  - Logs of reasoning steps visible in UI.  
  - Pre-flight summary for approval before execution.  
  - Pause/modify/resume functionality.  

- **RAG Integration with External Knowledge Bases**  
  Supports Google Drive, Notion, OneDrive, Dropbox as knowledge sources.  

- **DataRooms**  
  Centralized, structured outputs — makes assets reusable across workflows.

---

## 4. Technical Implementation Details

- **Language & Frameworks**:  
  - Python backend (agents, orchestration).  
  - CrewAI + Prefect for multi-agent orchestration.  
  - React + Tailwind frontend (user-friendly input/output interface).  

- **Storage & RAG**:  
  - Supabase (Postgres) for metadata and embeddings.  
  - Pinecone/Weaviate option for larger scale semantic search.  
  - File storage in structured DataRooms.  

- **Webscraping**:  
  - Playwright/Puppeteer for dynamic sites.  
  - BeautifulSoup/Requests for static pages.  
  - Lead filtering rules embedded in scraper pipeline.  

- **Evaluation**:  
  - Judge Agent generates rubric JSON.  
  - Evaluator League applies scoring (fact-checker, brand consistency, SEO).  
  - Results stored alongside deliverables.  

- **Security**:  
  - API keys stored in environment variables (not hard-coded).  
  - OAuth2 for third-party integrations (Google Drive, Dropbox, etc.).  
  - RBAC (role-based access control) for multi-user version (future).  

---

## 5. Testing and Quality Assurance

- **Unit Tests**  
  For each agent (input/output validation, rubric creation, scraper filtering).  

- **Integration Tests**  
  End-to-end workflows (instruction → plan → execution → judged output).  

- **Quality Loops**  
  If Judge Agent score < threshold, trigger auto-revision cycle.  

- **User Acceptance Testing**  
  Beta testers (property agents, solopreneurs) validate workflows.  

---

## 6. Documentation Provided

- **README.md** → Human overview, quick start, contribution guidelines.  
- **AGENTS.md** → Machine-readable agent definitions (clear instructions for coding agents).  
- **PROJECT_SUMMARY.md** → Full architecture and technical reference (this file).  
- **Examples/** → Sample workflows, prompts, outputs.  

---

## 7. Security Implementation

- Environment variables (`.env`) for secrets.  
- OAuth2 tokens scoped to minimum permissions.  
- Sandbox environment for scraping (compliance and rate limiting).  
- Local caching of outputs to prevent unnecessary re-calls.  

---

## 8. Deployment Options

- **Local Development**: Docker-compose for backend + frontend.  
- **Cloud Deployment**:  
  - Backend on Render/Fly.io/AWS.  
  - Frontend (React) on Vercel/Netlify.  
  - Supabase handles Postgres + authentication.  
- **Scaling**: Horizontal scaling via Prefect worker pools.  

---

## 9. Next Steps and Roadmap

### ✅ **Completed (v2.0.0 - Backend Complete)**
- ✅ All 29+ AI agents with enhanced prompts
- ✅ Advanced web scraping with Scrapy
- ✅ Lead personalization with sales psychology
- ✅ Creative media generation (images, video, audio)
- ✅ Financial automation and accounting
- ✅ Visual and web automation capabilities
- ✅ Document processing with MarkItDown
- ✅ Enhanced RAG pipeline
- ✅ Comprehensive documentation

### 🚧 **Current Phase (v2.1.0 - Frontend Integration)**
- **Frontend Integration**: Connect React frontend to enhanced backend
- **API Testing**: Verify all new endpoints work correctly
- **User Interface Updates**: Update UI to reflect new agent capabilities
- **Workflow Builder Integration**: Connect visual workflow builder to new agents

### 🔮 **Next Phase (v2.2.0 - Production Ready)**
- **Real-time Monitoring**: Enhanced workflow execution monitoring
- **Performance Analytics**: Dashboard for agent performance metrics
- **User Testing**: Validate complete user experience
- **Performance Optimization**: Fine-tune for production

### 🌟 **Future (v3.0.0+)**
- **Agent Marketplace**: Prebuilt workflows and templates
- **Multi-tenant Organizations**: RBAC and team management
- **Mobile + Desktop Apps**: Native applications
- **Advanced Analytics**: Performance dashboards and insights
- **Enterprise Integrations**: CRM, ERP, and business tool connections

**The backend is now a comprehensive, production-ready AI workforce platform. Ready for frontend integration!** 🚀  
