# Guild-AI Agent Capabilities Reference

This document provides a comprehensive overview of all available agents in Guild-AI and their complete capabilities. Guild-AI features a multi-layered agent architecture with specialized roles for different business functions.

## 🏗️ Agent Architecture Overview

Guild-AI uses a sophisticated multi-agent system organized into several layers:

- **Executive Layer**: Strategic planning and coordination
- **Workforce Agents**: Content creation, research, and execution
- **Evaluator League**: Quality control and validation
- **Specialized Agents**: Advanced capabilities for specific domains
- **Orchestrator**: Workflow management and coordination

---

## 📋 Complete Agent Inventory

### 🎯 Executive Layer Agents

#### 1. Chief of Staff Agent
**Location**: `guild/src/agents/chief_of_staff_agent.py`

**Core Capabilities**:
- Strategic task prioritization and delegation
- Cross-functional coordination across all agents
- Workflow optimization and resource allocation
- Executive decision support and planning
- Performance monitoring and reporting
- Opportunity identification and strategic recommendations

**Tools & Integrations**:
- RAG search across all data rooms
- Workflow orchestration (CrewAI + Prefect)
- Performance analytics and KPI tracking
- Strategic planning frameworks

**Output Formats**:
- Executive summaries and strategic reports
- Task delegation plans with DAG structures
- Performance dashboards and analytics
- Opportunity identification reports

---

#### 2. Strategy Agent
**Location**: `guild/src/agents/strategy_agent.py`

**Core Capabilities**:
- Long-term strategic planning and vision alignment
- Market analysis and competitive intelligence
- SWOT analysis and strategic decision frameworks
- Scenario planning and risk assessment
- Business model innovation and optimization
- Strategic recommendation generation

**Tools & Integrations**:
- Market research and competitive analysis
- Financial modeling and forecasting
- Strategic planning frameworks (Porter's Five Forces, etc.)
- RAG search for historical strategic data

**Output Formats**:
- Strategic analysis reports
- Business model canvases
- Competitive positioning maps
- Strategic implementation roadmaps

---

#### 3. Business Strategist Agent
**Location**: `guild/src/agents/business_strategist_agent.py`

**Core Capabilities**:
- High-level strategic thinking and planning
- Market and competitive analysis
- SWOT analysis and strategic recommendations
- Scenario planning and risk assessment
- Business model innovation
- Strategic implementation guidance

**Tools & Integrations**:
- Strategic planning frameworks
- Market research and analysis
- Competitive intelligence
- Risk assessment tools

**Output Formats**:
- Strategic analysis reports
- Business model recommendations
- Implementation roadmaps
- Risk assessment documents

---

### 🎨 Content Creation Agents

#### 4. Brief Generator Agent
**Location**: `guild/src/agents/brief_generator_agent.py`

**Core Capabilities**:
- Comprehensive project brief creation
- Target audience analysis and segmentation
- Key messaging and positioning development
- Deliverable specifications and requirements
- Success metrics definition and tracking
- Brand guideline compliance

**Tools & Integrations**:
- RAG search for brand guidelines and previous briefs
- Market research integration
- Competitive analysis tools
- Brand voice and tone analysis

**Output Formats**:
- Detailed project briefs (Markdown/PDF)
- Audience personas and profiles
- Messaging frameworks
- Success metrics dashboards

---

#### 5. Ad Copy Agent
**Location**: `guild/src/agents/copywriter_agent.py`

**Core Capabilities**:
- High-converting ad copy creation
- Multi-platform optimization (Google, Facebook, LinkedIn, etc.)
- A/B testing variant generation
- Emotional trigger integration
- Call-to-action optimization
- Performance prediction and analysis

**Tools & Integrations**:
- Platform-specific optimization tools
- Sentiment analysis and emotional triggers
- Performance prediction models
- Brand voice consistency checking

**Output Formats**:
- Platform-optimized ad copy
- A/B testing variants
- Performance predictions
- Creative briefs for designers

---

#### 6. Content Strategist Agent
**Location**: `guild/src/agents/content_strategist.py`

**Core Capabilities**:
- Holistic content strategy development
- Multi-platform content calendar creation
- Content theme and topic ideation
- Distribution channel optimization
- Performance metrics and KPI definition
- Content gap analysis and recommendations

**Tools & Integrations**:
- RAG search for brand guidelines and audience insights
- Competitive content analysis
- Market trend identification
- Content performance analytics

**Output Formats**:
- Comprehensive content strategies
- Multi-platform content calendars
- Content performance dashboards
- Strategic recommendations

---

#### 7. Social Media Agent
**Location**: `guild/src/agents/social_media_agent.py`

**Core Capabilities**:
- Platform-specific content creation (LinkedIn, Twitter, Instagram, Facebook)
- Hashtag research and optimization
- Engagement strategy development
- Visual content suggestions
- Community management guidelines
- Social media campaign planning

**Tools & Integrations**:
- Platform-specific optimization tools
- Hashtag research and trending analysis
- Visual content generation integration
- Engagement analytics

**Output Formats**:
- Platform-optimized social media posts
- Hashtag recommendations
- Visual content briefs
- Engagement strategies

---

### 🔍 Research & Data Agents

#### 8. Research Agent
**Location**: `guild/src/agents/research_agent.py`

**Core Capabilities**:
- Web research and information gathering
- Market analysis and trend identification
- Competitive intelligence gathering
- Data synthesis and analysis
- Source validation and fact-checking
- Research report generation

**Tools & Integrations**:
- Web scraping and data collection
- RAG search across connected data sources
- Source validation and credibility checking
- Data analysis and visualization

**Output Formats**:
- Comprehensive research reports
- Market analysis documents
- Competitive intelligence briefs
- Data visualizations and charts

---

#### 9. Advanced Scraper Agent
**Location**: `guild/src/agents/scraper_agent.py`

**Core Capabilities**:
- Advanced web scraping with Scrapy framework
- Lead generation and prospecting
- ICP (Ideal Customer Profile) filtering
- Data enrichment and validation
- Ethical scraping with rate limiting
- Multi-format data export (JSON, CSV, Excel)

**Tools & Integrations**:
- Scrapy for robust web scraping
- Data enrichment pipeline (phone/email validation)
- ICP filtering and lead scoring
- Export to multiple formats

**Output Formats**:
- Structured lead databases
- Enriched contact information
- ICP-filtered prospect lists
- Data quality reports

---

#### 10. Lead Personalization Agent
**Location**: `guild/src/agents/lead_personalization_agent.py`

**Core Capabilities**:
- Sales psychology-based message generation
- Hyper-personalized outreach creation
- Multi-platform message optimization (email, LinkedIn, cold calls)
- Psychological principle application (reciprocity, authority, social proof)
- Personalization scoring and optimization
- A/B testing variant generation

**Tools & Integrations**:
- Sales psychology frameworks
- Lead data enrichment
- Platform-specific optimization
- Personalization scoring algorithms

**Output Formats**:
- Personalized outreach messages
- Multi-platform campaign variants
- Personalization effectiveness scores
- A/B testing recommendations

---

#### 11. Data Enrichment Agent
**Location**: `guild/src/core/data_enrichment.py`

**Core Capabilities**:
- Lead data validation and cleaning
- Phone number and email validation
- Text standardization and formatting
- HTML content extraction
- Data quality scoring
- Synthetic data generation (development)

**Tools & Integrations**:
- Data validation libraries (phonenumbers, email-validator)
- Text processing tools (BeautifulSoup, pandas)
- Data quality assessment algorithms
- Synthetic data generation frameworks

**Output Formats**:
- Enriched and validated datasets
- Data quality reports
- Validation and cleaning logs
- Standardized data formats

---

### 💰 Financial & Business Agents

#### 12. Accounting Agent
**Location**: `guild/src/agents/accounting_agent.py`

**Core Capabilities**:
- Financial data processing and validation
- Multiple report generation (P&L, cash flow, expense reports)
- Excel/CSV export with professional formatting
- Financial health analysis and recommendations
- Budget template creation and management
- Automated calculations and summaries

**Tools & Integrations**:
- Pandas for data processing
- OpenPyXL for Excel formatting
- Financial analysis algorithms
- Budget planning frameworks

**Output Formats**:
- Professional financial reports (Excel/PDF)
- Financial health dashboards
- Budget templates and forecasts
- Financial recommendations

---

#### 13. Bookkeeping Agent
**Location**: `guild/src/agents/bookkeeping_agent.py`

**Core Capabilities**:
- Transaction processing and categorization
- Financial reporting and analysis
- Account reconciliation and matching
- Expense tracking and management
- Compliance and audit support
- Data validation and error detection

**Tools & Integrations**:
- Transaction processing algorithms
- Financial reporting templates
- Compliance frameworks
- Error detection systems

**Output Formats**:
- Transaction reports
- Reconciliation statements
- Expense analyses
- Compliance documentation

---

#### 14. Analytics Agent
**Location**: `guild/src/agents/analytics/analytics_agent.py`

**Core Capabilities**:
- Performance analytics and reporting
- KPI tracking and monitoring
- Trend analysis and forecasting
- Data visualization and dashboard creation
- Business intelligence and insights
- Predictive analytics

**Tools & Integrations**:
- Data analysis libraries (pandas, numpy)
- Visualization tools (matplotlib, plotly)
- Statistical analysis frameworks
- Business intelligence platforms

**Output Formats**:
- Analytics dashboards and reports
- KPI tracking documents
- Trend analysis and forecasts
- Business intelligence insights

---

#### 15. Investor Relations Agent
**Location**: `guild/src/agents/investor_relations_agent.py`

**Core Capabilities**:
- Investor pitch deck creation
- Financial projection modeling
- Due diligence preparation
- Funding strategy development
- Investor communication planning
- Valuation analysis

**Tools & Integrations**:
- Financial modeling tools
- Pitch deck templates
- Due diligence frameworks
- Investor communication systems

**Output Formats**:
- Professional pitch decks
- Financial projections
- Due diligence documentation
- Investor communication plans

---

### 🎨 Creative & Media Agents

#### 16. Image Generation Agent
**Location**: `guild/src/agents/image_generation_agent.py`

**Core Capabilities**:
- Local image generation using Hugging Face diffusers
- Social media optimized image creation
- Product mockup generation
- Infographic creation and design
- Brand-consistent visual content
- Batch image processing

**Tools & Integrations**:
- Hugging Face diffusers (Stable Diffusion)
- Social media platform optimization
- Brand style guide integration
- Image quality assessment

**Output Formats**:
- High-quality generated images (PNG/JPG)
- Social media optimized graphics
- Product mockups and visualizations
- Brand-consistent visual assets

---

#### 17. Voice Agent
**Location**: `guild/src/agents/voice_agent.py`

**Core Capabilities**:
- Text-to-speech using transformers
- Speech-to-text with Whisper
- Meeting transcription with speaker identification
- Voiceover creation with background music
- Audio processing and enhancement
- Multi-language support

**Tools & Integrations**:
- Hugging Face transformers for TTS
- OpenAI Whisper for STT
- Audio processing libraries (librosa, soundfile)
- Meeting analysis tools

**Output Formats**:
- High-quality audio files (WAV/MP3)
- Meeting transcriptions with speaker identification
- Voiceover content with music
- Audio analysis reports

---

#### 18. Video Editor Agent
**Location**: `guild/src/agents/video_editor_agent.py`

**Core Capabilities**:
- Slideshow creation from images
- Social media video generation
- Text overlay addition and styling
- Video trimming and editing
- Audio synchronization
- Platform-specific optimization

**Tools & Integrations**:
- MoviePy for video editing
- Social media platform optimization
- Audio processing integration
- Text overlay and styling tools

**Output Formats**:
- Professional video content (MP4)
- Social media optimized videos
- Video editing projects
- Platform-specific video variants

---

#### 19. Document Processing Agent
**Location**: `guild/src/core/markitdown_processor.py`

**Core Capabilities**:
- Multi-format document processing (PDF, DOCX, PPTX, etc.)
- Audio and video transcription
- YouTube video content extraction
- Document conversion to Markdown
- Content structure analysis
- Metadata extraction

**Tools & Integrations**:
- MarkItDown for document conversion
- Audio/video transcription services
- YouTube API integration
- Document analysis tools

**Output Formats**:
- Converted Markdown documents
- Audio/video transcriptions
- Document metadata and structure
- Content analysis reports

---

### 🤖 Automation Agents

#### 20. Unified Automation Agent
**Location**: `guild/src/agents/unified_automation_agent.py`

**Core Capabilities**:
- Visual automation using PyAutoGUI and OpenCV
- Web automation using Selenium WebDriver
- Form filling and data extraction
- Screenshot capture and analysis
- Cross-platform automation
- Automation script generation

**Tools & Integrations**:
- PyAutoGUI for desktop automation
- Selenium for web automation
- OpenCV for computer vision
- Tesseract OCR for text recognition

**Output Formats**:
- Automation scripts and workflows
- Screenshots and visual analysis
- Data extraction reports
- Automation performance metrics

---

#### 21. Visual Automation Tool
**Location**: `guild/src/core/vision/visual_automation_tool.py`

**Core Capabilities**:
- Computer vision-based UI interaction
- Element detection and recognition
- Screen state analysis
- Automated UI navigation
- Visual pattern recognition
- Error handling and recovery

**Tools & Integrations**:
- PyAutoGUI for UI control
- OpenCV for image processing
- Visual element detection algorithms
- Screen state management

**Output Formats**:
- UI state reports
- Visual element maps
- Automation action logs
- Error and recovery reports

---

### 🔍 Evaluator League

#### 22. Judge Agent
**Location**: `guild/src/agents/evaluation/judge_agent.py`

**Core Capabilities**:
- Task-specific rubric generation
- Quality evaluation and scoring
- Revision cycle triggering
- Performance benchmarking
- Quality threshold enforcement
- Comprehensive evaluation reporting

**Tools & Integrations**:
- Rubric generation algorithms
- Quality scoring frameworks
- Performance analytics
- Revision management systems

**Output Formats**:
- Custom evaluation rubrics
- Quality scores and reports
- Revision recommendations
- Performance benchmarks

---

#### 23. Fact Checker Agent
**Location**: `guild/src/agents/evaluation/fact_checker_agent.py`

**Core Capabilities**:
- Information accuracy validation
- Source verification and credibility checking
- Factual claim verification
- Misinformation detection
- Source attribution and citation
- Confidence scoring for claims

**Tools & Integrations**:
- Web search and verification
- Source credibility analysis
- Fact-checking databases
- Citation and attribution tools

**Output Formats**:
- Fact-checking reports
- Source verification documents
- Accuracy scores and confidence levels
- Citation and attribution lists

---

#### 24. Brand Checker Agent
**Location**: `guild/src/agents/evaluation/brand_checker_agent.py`

**Core Capabilities**:
- Brand voice and tone consistency checking
- Visual brand element validation
- Messaging alignment verification
- Brand guideline compliance
- Brand consistency scoring
- Brand violation detection

**Tools & Integrations**:
- Brand guideline databases
- Voice and tone analysis
- Visual brand recognition
- Consistency scoring algorithms

**Output Formats**:
- Brand compliance reports
- Voice and tone analysis
- Brand consistency scores
- Violation detection alerts

---

#### 25. SEO Evaluator Agent
**Location**: `guild/src/agents/evaluation/seo_evaluator_agent.py`

**Core Capabilities**:
- SEO optimization analysis
- Keyword research and optimization
- Content structure evaluation
- Meta tag and description optimization
- Search engine ranking factors
- SEO performance scoring

**Tools & Integrations**:
- SEO analysis tools
- Keyword research databases
- Search engine optimization frameworks
- Performance tracking tools

**Output Formats**:
- SEO analysis reports
- Keyword optimization recommendations
- Content structure suggestions
- SEO performance scores

---

### 🎛️ Orchestration & Management

#### 26. Workflow Manager Agent
**Location**: `guild/src/agents/orchestration/workflow_manager_agent.py`

**Core Capabilities**:
- Multi-agent workflow orchestration
- Task dependency management
- Resource allocation and optimization
- Workflow execution monitoring
- Performance tracking and analytics
- Error handling and recovery

**Tools & Integrations**:
- CrewAI for agent orchestration
- Prefect for workflow management
- Performance monitoring systems
- Error tracking and recovery tools

**Output Formats**:
- Workflow execution plans
- Performance monitoring dashboards
- Resource allocation reports
- Error handling documentation

---

#### 27. Pre-flight Planner Agent
**Location**: `guild/src/agents/orchestration/preflight_planner_agent.py`

**Core Capabilities**:
- Workflow plan generation and summarization
- User approval request management
- Plan modification and optimization
- Risk assessment and mitigation
- Resource requirement analysis
- Timeline estimation and planning

**Tools & Integrations**:
- Workflow planning algorithms
- Risk assessment frameworks
- Resource estimation tools
- Timeline planning systems

**Output Formats**:
- Pre-flight approval summaries
- Workflow execution plans
- Risk assessment reports
- Resource requirement documents

---

#### 28. Contract Compiler Agent
**Location**: `guild/src/agents/orchestration/contract_compiler_agent.py`

**Core Capabilities**:
- Outcome contract analysis and parsing
- Executable workflow generation
- Agent selection and assignment
- Resource allocation planning
- Contract compliance monitoring
- Workflow optimization

**Tools & Integrations**:
- Contract parsing and analysis
- Workflow generation algorithms
- Agent capability matching
- Resource optimization tools

**Output Formats**:
- Executable workflow definitions
- Agent assignment plans
- Resource allocation schedules
- Contract compliance reports

---

#### 29. Quality Controller Agent
**Location**: `guild/src/agents/orchestration/quality_controller_agent.py`

**Core Capabilities**:
- Quality control loop management
- Iterative improvement coordination
- Quality threshold enforcement
- Performance monitoring and analytics
- Quality improvement recommendations
- Continuous optimization

**Tools & Integrations**:
- Quality monitoring systems
- Performance analytics
- Improvement recommendation engines
- Continuous optimization algorithms

**Output Formats**:
- Quality control reports
- Performance improvement recommendations
- Quality threshold compliance
- Continuous optimization plans

---

### 🏢 Business Operations Agents

#### 30. CRM Agent
**Location**: `guild/src/agents/crm_agent.py`

**Core Capabilities**:
- CRM platform selection and setup
- Marketing automation workflow design
- Lead scoring and qualification
- Customer segmentation and targeting
- Sales pipeline management
- Customer lifecycle optimization

**Tools & Integrations**:
- CRM system integration
- Marketing automation platforms
- Lead scoring algorithms
- Customer segmentation tools

**Output Formats**:
- CRM strategy documents
- Automation workflow diagrams
- Customer segment reports
- Pipeline management plans

---

#### 31. Outbound Sales Agent
**Location**: `guild/src/agents/outbound_sales_agent.py`

**Core Capabilities**:
- Lead research and data scraping
- Personalized outreach message creation
- Multi-channel campaign management
- Lead qualification and scoring
- Sales pipeline management
- Follow-up automation and sequence optimization

**Tools & Integrations**:
- Lead research tools
- Outreach message templates
- Campaign management systems
- Lead scoring algorithms

**Output Formats**:
- Outreach message templates
- Campaign management plans
- Lead qualification frameworks
- Sales pipeline reports

---

#### 32. Project Manager Agent
**Location**: `guild/src/agents/project_manager_agent.py`

**Core Capabilities**:
- Project planning and scope definition
- Resource allocation and management
- Timeline creation and milestone tracking
- Risk assessment and mitigation planning
- Quality control and standards enforcement
- Stakeholder communication planning

**Tools & Integrations**:
- Project management methodologies
- Resource allocation algorithms
- Timeline planning tools
- Risk assessment frameworks

**Output Formats**:
- Project plans and timelines
- Resource allocation matrices
- Risk management plans
- Quality control frameworks

---

### 🔮 Additional Specialized Agents

#### 33. Training Agent
**Location**: `guild/src/agents/training_agent.py`

**Core Capabilities**:
- Training material development
- Standard Operating Procedure (SOP) creation
- Learning path design
- Knowledge assessment creation
- Training program evaluation
- Skill development planning

**Tools & Integrations**:
- Learning management systems
- SOP templates and frameworks
- Assessment creation tools
- Training evaluation methodologies

**Output Formats**:
- Training modules and materials
- Comprehensive SOPs
- Learning assessments
- Skill development plans

---

#### 34. Onboarding Agent
**Location**: `guild/src/agents/onboarding_agent.py`

**Core Capabilities**:
- User onboarding flow design
- Personalized welcome experiences
- System feature introduction
- User preference collection
- Initial setup automation
- Onboarding success measurement

**Tools & Integrations**:
- Onboarding flow templates
- User preference collection tools
- Feature introduction frameworks
- Success measurement metrics

**Output Formats**:
- Onboarding flow diagrams
- Welcome message templates
- Feature introduction guides
- User preference forms

---

## 🔧 Agent Integration & Workflow

### Cross-Agent Collaboration

Agents are designed to work together seamlessly:

1. **Executive Layer** coordinates strategic direction
2. **Workforce Agents** execute specialized tasks
3. **Evaluator League** ensures quality and compliance
4. **Orchestrator** manages workflow execution
5. **Data Agents** provide insights and analysis

### Quality Control Flow

1. **Judge Agent** generates task-specific rubrics
2. **Workforce Agents** produce initial deliverables
3. **Evaluator League** scores and validates outputs
4. **Quality Controller** manages revision cycles
5. **Final approval** when quality thresholds are met

### Data Flow Architecture

```
User Request → Contract Compiler → Workflow Manager → Agent Execution → Evaluation → Quality Control → Final Output
```

---

## 🚀 Advanced Capabilities

### Multi-Modal Processing
- **Text**: All agents support natural language processing
- **Images**: Image Generation Agent creates visual content
- **Audio**: Voice Agent handles speech processing
- **Video**: Video Editor Agent creates multimedia content
- **Documents**: Document Processing Agent handles various formats

### Real-Time Processing
- **Live monitoring** of agent performance
- **Real-time quality control** and feedback
- **Dynamic workflow adjustment** based on results
- **Immediate escalation** for quality issues

### Scalability Features
- **Parallel execution** of independent tasks
- **Resource optimization** and load balancing
- **Horizontal scaling** through agent pools
- **Performance monitoring** and optimization

---

## 📈 Performance Metrics

### Agent Performance Indicators
- **Task completion rate**: 95%+ target
- **Quality scores**: 0.8+ average
- **Processing time**: Optimized per agent type
- **Error rate**: <2% target
- **User satisfaction**: 4.5+ rating

### System Performance Metrics
- **Workflow success rate**: 90%+ target
- **End-to-end processing time**: Optimized for user experience
- **Resource utilization**: Efficient allocation
- **Cost efficiency**: Local processing optimization

---

## 🔒 Security & Compliance

### Data Protection
- **Encryption** of sensitive data
- **Access control** and authentication
- **Audit trails** for all operations
- **Privacy compliance** (GDPR, CCPA)

### Quality Assurance
- **Multi-layer validation** and verification
- **Human oversight** for critical decisions
- **Transparency** in all operations
- **Continuous monitoring** and improvement

---

## 🎯 Getting Started

### Agent Selection Guide
1. **Identify your primary need** (content, research, automation, etc.)
2. **Review agent capabilities** in this document
3. **Consider workflow requirements** and dependencies
4. **Start with core agents** and expand as needed

### Best Practices
- **Begin with simple workflows** and gradually increase complexity
- **Use the Judge Agent** for quality control from the start
- **Monitor performance metrics** and optimize accordingly
- **Leverage cross-agent collaboration** for comprehensive solutions

---

*This document is continuously updated as new agents and capabilities are added to Guild-AI. For the most current information, refer to the latest version in the repository.*