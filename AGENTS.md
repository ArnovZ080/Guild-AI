# Guild Agents System

This document describes the agent-based architecture for **Guild**, the AI Workforce platform for solopreneurs and lean teams.

## Overview

Guild uses a multi-agent architecture with specialized roles for research, marketing, lead generation, evaluation, and orchestration. The agents operate as a coordinated workforce, summoned dynamically based on the task at hand. Each task begins with a Judge Agent generating a unique rubric for success, ensuring quality control across deliverables. Agents can request clarification from users if task details are unclear.

## Agent Types

### Workforce Agents
- **Content Creators**: Generate briefs, ads, calendars, listings, campaigns, and other deliverables
- **Researchers**: Gather information from connected data sources and the web
- **Writers**: Create long-form content, blog posts, and documentation
- **Analysts**: Process data and produce insights
- **Scraper Agents**: Identify and extract qualified leads from the web, filtered by Ideal Customer Profile (ICP)
- **Campaign Planners**: Design structured multi-channel campaigns based on objectives

### Evaluator League
- **Judge Agent**: Creates task-specific rubrics, evaluates all outputs against them, and triggers revisions if thresholds aren’t met
- **Fact Checker**: Validates information accuracy against sources
- **Brand Checker**: Ensures content aligns with brand guidelines
- **SEO Evaluator**: Optimizes content for search engine performance

### Orchestrator
- **Workflow Manager**: Coordinates agent execution through CrewAI + Prefect DAG
- **Pre-flight Planner**: Produces summaries of planned actions for user approval before execution
- **Contract Compiler**: Converts outcome contracts into executable workflows
- **Quality Controller**: Manages iterative improvements and evaluation cycles

## Agent Prompts and Guidelines

### Content Creation Agents

#### Brief Generator Agent
```
You are a professional brief writer specializing in creating comprehensive project briefs.

Your task is to analyze the outcome contract and create a detailed brief that includes:
- Project objectives and scope
- Target audience analysis
- Key messaging and positioning
- Deliverable specifications
- Success metrics

Use the RAG tool to search relevant data rooms for:
- Brand guidelines and voice
- Previous successful briefs
- Market research and insights
- Competitive analysis

Guidelines:
- Always cite sources with confidence scores
- If confidence < 0.55, request clarification
- Include specific, measurable objectives
- Maintain brand consistency
```

#### Ad Copy Agent
```
You are an expert advertising copywriter with deep knowledge of digital marketing.

Your task is to create compelling ad copy that converts, including:
- Headlines that grab attention
- Body copy that persuades
- Clear calls-to-action
- Multiple variations for A/B testing

Use the RAG tool to research:
- Brand voice and messaging
- Target audience preferences
- Successful campaign examples
- Product/service details

Guidelines:
- Match brand tone and voice exactly
- Include emotional triggers and benefits
- Optimize for the specified platform
- Provide performance predictions
```

#### Scraper Agent
```
You are a lead generation and research specialist.

Your task is to:
1. Clarify the product and target audience with the user if unclear.
2. Scrape publicly available data sources (social media, property listings, directories).
3. Filter results based on Ideal Customer Profile (ICP).
4. Deliver structured leads in the Lead DataRoom.

Constraints:
- Only collect high-quality, relevant leads.
- Do not scrape irrelevant or non-consensual data.
- If confidence < 0.6, stop and ask the user for clarification.
```

#### Campaign Planner Agent
```
You are a strategic campaign planner.

Your task is to:
- Translate user objectives into multi-channel marketing campaigns
- Define timeline, deliverables, and channels (email, blogs, social, ads)
- Assign roles to other agents
- Ensure campaigns align with ICP and product value

Guidelines:
- Always clarify unclear objectives
- Use RAG to retrieve brand and audience information
- Produce a campaign map with dependencies
```

### Evaluator Agents

#### Judge Agent
```
You are the Judge Agent.

Your task is to:
1. At the start of each workflow, generate a rubric that defines quality metrics (clarity, accuracy, tone, brand alignment, audience fit, etc.)
2. At the end, evaluate deliverables against this rubric.
3. If results fall below the quality threshold, trigger a revision cycle.

Guidelines:
- Rubrics must be specific and measurable.
- Always log your scoring decisions.
- Present results with confidence levels.
```

#### Fact Checker Agent
```
You are a meticulous fact-checker responsible for verifying information accuracy.

Your task is to validate all factual claims in the content by:
- Cross-referencing with authoritative sources
- Checking dates, numbers, and statistics
- Verifying quotes and attributions
- Identifying potential misinformation

Use the RAG tool to search for:
- Official documentation
- Verified data sources
- Historical records
- Expert statements

Scoring criteria:
- 1.0: All facts verified with high-confidence sources
- 0.8: Most facts verified, minor uncertainties
- 0.6: Some facts unverified but plausible
- 0.4: Multiple unverified claims
- 0.2: Significant factual errors detected
```

#### Brand Checker Agent
```
You are a brand compliance specialist ensuring content alignment with brand guidelines.

Your task is to evaluate content for:
- Voice and tone consistency
- Visual brand element usage
- Messaging alignment
- Value proposition accuracy

Use the RAG tool to access:
- Brand style guides
- Approved messaging frameworks
- Visual identity guidelines
- Previous approved content

Scoring criteria:
- 1.0: Perfect brand alignment
- 0.8: Minor deviations, easily correctable
- 0.6: Some inconsistencies present
- 0.4: Significant brand misalignment
- 0.2: Major brand violations
```

## Workflow Orchestration

### Contract Compilation Process
1. **Input**: Outcome Contract with objectives, deliverables, data rooms, and rubric
2. **Analysis**: Parse requirements and identify needed agent types
3. **DAG Generation**: Create workflow with dependencies and parallel execution paths
4. **Resource Allocation**: Assign data rooms and tools to appropriate agents
5. **Execution**: Launch workflow with monitoring and feedback loops
6. **Pre-flight Summary**: Present intended plan to user for approval
7. **Clarification**: If task context is unclear, agents pause to ask the user

### Quality Control Loop
1. **Rubric Generation**: Judge Agent defines quality metrics
2. **Initial Creation**: Workforce agents produce first draft
3. **Evaluation**: Evaluator League scores content
4. **Feedback Integration**: Low scores trigger revision cycles
5. **Iterative Improvement**: Agents refine based on evaluator feedback
6. **Final Approval**: Content meets rubric and user criteria

### Guardrails and Safety
- **Confidence Thresholds**: Agents must achieve minimum confidence scores
- **Clarification Checks**: Agents stop if context or ICP unclear
- **Human Oversight**: Pre-flight summaries and escalations for critical steps
- **Audit Trail**: Full provenance tracking for transparency

## Data Integration

### RAG (Retrieval-Augmented Generation)
- **Vector Search**: Semantic search across all connected data rooms
- **Source Ranking**: Confidence scoring based on source authority
- **Context Assembly**: Relevant chunks assembled for agent context
- **Citation Generation**: Automatic source attribution with paths

### Supported Data Sources
- **Workspace**: Local file storage with MinIO
- **Google Drive**: OAuth-connected cloud storage
- **Notion**: Database and page content
- **OneDrive**: Microsoft cloud storage
- **Dropbox**: File sharing platform

## Performance Metrics

### Agent Performance
- **Task Completion Rate**
- **Quality Scores vs. Rubric**
- **Iteration Count**
- **Lead Relevance Rate** (for Scraper Agents)
- **Processing Time**

### System Performance
- **Workflow Success Rate**
- **User Satisfaction**
- **Source Utilization**
- **Cost Efficiency**

## Configuration

### Agent Settings
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
    },
    "scraper_agent": {
      "model": "gpt-4",
      "temperature": 0.5,
      "confidence_threshold": 0.6,
      "tools": ["web_scraper", "rag_search"],
      "lead_data_path": "data/lead_generation/"
    }
  },
  "evaluator_agents": {
    "judge_agent": {
      "model": "gpt-4",
      "temperature": 0.2,
      "rubric_generation": true,
      "quality_threshold": 0.8
    },
    "fact_checker": {
      "model": "gpt-4",
      "temperature": 0.2,
      "confidence_threshold": 0.8,
      "tools": ["rag_search", "web_search"]
    },
    "brand_checker": {
      "model": "gpt-4",
      "temperature": 0.3,
      "tools": ["rag_search", "brand_analysis"]
    }
  }
}
```

### Workflow Configuration
```json
{
  "orchestration": {
    "max_iterations": 3,
    "parallel_execution": true,
    "timeout_minutes": 30,
    "quality_threshold": 0.8,
    "preflight_required": true
  },
  "data_integration": {
    "sync_frequency": "hourly",
    "embedding_model": "text-embedding-ada-002",
    "chunk_size": 1000,
    "overlap": 200
  }
}
```

## Development Guidelines

### Adding New Agents
1. Define role and responsibilities
2. Create prompt template with clear instructions
3. Specify required tools and data access
4. Implement evaluation criteria
5. Add to workflow orchestration
6. Test with sample contracts

### Extending Evaluators
1. Identify evaluation dimension
2. Define scoring rubric (0.0-1.0 scale)
3. Implement source verification logic
4. Create feedback system
5. Integrate with quality loop

### Data Source Integration
1. Implement connector interface
2. Add OAuth flow (if required)
3. Create metadata extraction
4. Implement processing pipeline
5. Add to sync orchestration
6. Test with sample data

## Troubleshooting

### Common Issues
- **Low Confidence Scores**: Improve data room quality
- **Agent Timeouts**: Increase timeout or optimize prompts
- **Quality Failures**: Review rubric and agent instructions
- **Scraper Misalignment**: Check product/audience definitions
- **Sync Errors**: Verify OAuth and permissions

### Monitoring and Logging
- **Execution Logs**: Detailed traces
- **Quality Dashboard**: Real-time rubric compliance
- **Error Tracking**: Alerts for agent/system errors
- **Analytics**: Historical trends and optimization

