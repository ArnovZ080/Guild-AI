# 🚀 Vertex AI Integration Plan for Guild AI

## Cost-Optimized Multi-Model Strategy

### 1. Text Generation Tier System

```python
# api_server/src/llm/model_router.py

class ModelRouter:
    """Routes tasks to optimal models based on cost and capability"""
    
    TIER_1_FREE = "gemini-1.5-flash"  # Most tasks (FREE tier available)
    TIER_2_STRATEGY = "gemini-1.5-pro"  # Complex strategy (LOW cost)
    TIER_3_PREMIUM = "gpt-4o"  # Premium tasks only (HIGH cost)
    
    def route_task(self, task_type, complexity):
        # Simple chat, orchestration, content creation
        if task_type in ['chat', 'orchestrate', 'content']:
            return self.TIER_1_FREE  # $0 up to limits
        
        # Strategy, analysis, complex reasoning
        if task_type in ['strategy', 'analysis', 'planning']:
            if complexity == 'high':
                return self.TIER_2_STRATEGY  # $1.25/1M tokens
            return self.TIER_1_FREE
        
        # Premium features only
        if task_type == 'premium':
            return self.TIER_3_PREMIUM  # $5/1M tokens
        
        return self.TIER_1_FREE  # Default to free tier
```

### 2. Image Generation Strategy

```python
# api_server/src/media/image_generator.py

class ImageGenerator:
    """Hybrid approach: Cloud + Local"""
    
    async def generate_image(self, prompt, quality='standard'):
        if quality == 'premium':
            # Use Imagen 3 for high-quality marketing materials
            return await self.generate_with_imagen3(prompt)  # $0.020/image
        
        elif quality == 'standard':
            # Use local Stable Diffusion for volume work
            return await self.generate_with_stable_diffusion(prompt)  # FREE
        
        elif quality == 'budget':
            # Use Imagen 2 (cheaper alternative)
            return await self.generate_with_imagen2(prompt)  # $0.008/image
    
    async def generate_with_imagen3(self, prompt):
        """Vertex AI Imagen 3"""
        from google.cloud import aiplatform
        
        client = aiplatform.gapic.PredictionServiceClient()
        endpoint = f"projects/guild-ai-080/locations/us-central1/publishers/google/models/imagegeneration@006"
        
        instance = {"prompt": prompt}
        response = client.predict(endpoint=endpoint, instances=[instance])
        return response.predictions[0]
    
    async def generate_with_stable_diffusion(self, prompt):
        """Local generation - already implemented!"""
        from diffusers import StableDiffusionPipeline
        # Your existing implementation
        pass
```

### 3. Video Generation Options

```python
# api_server/src/media/video_generator.py

class VideoGenerator:
    """Multi-tier video generation"""
    
    async def generate_video(self, config, quality='budget'):
        if quality == 'premium' and config.get('requires_ai_generation'):
            # Reserve for high-value content
            return await self.generate_with_veo2(config)  # ~$0.50/video
        
        elif quality == 'standard':
            # Use Runway ML for AI-generated video
            return await self.generate_with_runway(config)  # ~$0.05/sec
        
        else:  # budget
            # Use MoviePy for assembly (FREE)
            # Generate frames with Imagen, assemble with MoviePy
            frames = await self.generate_frames_with_imagen(config)
            return await self.assemble_with_moviepy(frames)  # FREE
    
    async def assemble_with_moviepy(self, frames):
        """Your existing MoviePy integration"""
        from moviepy.editor import ImageSequenceClip
        # Already implemented!
        pass
```

---

## Vertex AI Agent Builder Integration

### What to Use from Agent Builder:

#### 1. **Data Store for RAG**
```python
# api_server/src/rag/vertex_rag.py

from google.cloud import discoveryengine_v1 as discoveryengine

class VertexRAG:
    """Use Vertex AI Data Store for document grounding"""
    
    def __init__(self):
        self.client = discoveryengine.DocumentServiceClient()
        self.data_store_id = "guild-business-data"
        self.project_id = "guild-ai-080"
    
    async def ingest_onboarding_data(self, user_id, onboarding_data):
        """Store user's source of truth in Vertex AI Data Store"""
        document = {
            "id": f"user-{user_id}-onboarding",
            "content": {
                "mimeType": "application/json",
                "rawBytes": json.dumps(onboarding_data).encode()
            },
            "structData": onboarding_data  # Structured data for better search
        }
        
        parent = f"projects/{self.project_id}/locations/global/dataStores/{self.data_store_id}/branches/default_branch"
        self.client.create_document(parent=parent, document=document)
    
    async def search_business_context(self, query, user_id):
        """Search user's business data for relevant context"""
        search_client = discoveryengine.SearchServiceClient()
        
        request = discoveryengine.SearchRequest(
            serving_config=f"projects/{self.project_id}/locations/global/dataStores/{self.data_store_id}/servingConfigs/default_config",
            query=query,
            filter=f"user_id:{user_id}"  # Only search this user's data
        )
        
        response = search_client.search(request=request)
        return [result.document for result in response.results]
```

#### 2. **Function Calling for Agent Actions**
```python
# api_server/src/agents/vertex_agent_wrapper.py

class VertexAgentWrapper:
    """Wrap Guild agents with Vertex AI function calling"""
    
    def get_function_declarations(self):
        """Declare Guild AI capabilities to Vertex"""
        return [
            {
                "name": "create_marketing_campaign",
                "description": "Creates a complete marketing campaign with copy, images, and schedule",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "campaign_type": {"type": "string", "enum": ["social", "email", "ads"]},
                        "target_audience": {"type": "string"},
                        "budget": {"type": "number"}
                    }
                }
            },
            {
                "name": "analyze_business_metrics",
                "description": "Analyzes business performance and provides strategic insights",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "metrics": {"type": "array", "items": {"type": "string"}},
                        "time_period": {"type": "string"}
                    }
                }
            },
            {
                "name": "generate_customer_avatar",
                "description": "Creates detailed customer persona based on business data",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "industry": {"type": "string"},
                        "product_description": {"type": "string"}
                    }
                }
            }
        ]
    
    async def call_guild_function(self, function_name, arguments):
        """Execute Guild AI agent based on Vertex function call"""
        if function_name == "create_marketing_campaign":
            from guild.src.agents.marketing_campaign_agent import MarketingCampaignAgent
            agent = MarketingCampaignAgent()
            return await agent.create_campaign(**arguments)
        
        # Map other functions to your agents
        # ...
```

#### 3. **Grounding with Google Search**
```python
# Enable Google Search grounding for real-time information
from vertexai.preview.generative_models import GenerativeModel, Tool

def create_grounded_agent():
    """Create agent with Google Search grounding"""
    google_search_tool = Tool.from_google_search_retrieval()
    
    model = GenerativeModel(
        "gemini-1.5-flash",
        tools=[google_search_tool]
    )
    
    # Now agent can search the web for current information
    response = model.generate_content(
        "What are the latest social media marketing trends for 2025?",
        generation_config={"temperature": 0.7}
    )
    
    # Response includes grounding citations
    return response
```

---

## Cost Breakdown (Monthly Estimates)

### Scenario: 100 Active Users

#### **Text Generation:**
- 1000 requests/day × 30 days = 30,000 requests
- Avg 500 tokens/request = 15M tokens/month
- **Using Gemini Flash:** $0 (within free tier!)
- **Fallback to paid:** $1.13/month

#### **Image Generation:**
- 200 images/day × 30 days = 6,000 images
- **Hybrid approach:**
  - 2,000 premium (Imagen 3): $40
  - 4,000 standard (Local SD): $0
- **Total:** $40/month

#### **Video Generation:**
- 50 videos/day × 30 days = 1,500 videos
- **Hybrid approach:**
  - 10% premium (Veo/Runway): $75
  - 90% budget (MoviePy): $0
- **Total:** $75/month

#### **Total Monthly AI Costs:**
- **$116/month** for 100 active users
- **$1.16 per user/month**
- **vs. Hiring team:** $50,000+/month

---

## Implementation Priority

### **Phase 1: Free Tier Maximization (Week 1)**
✅ Already using Vertex AI  
⏳ Implement Gemini Flash as default  
⏳ Set up usage monitoring  
⏳ Implement model router

### **Phase 2: Hybrid Media Generation (Week 2)**
⏳ Keep local Stable Diffusion (already have)  
⏳ Add Imagen 3 for premium images  
⏳ Quality-based routing

### **Phase 3: Vertex AI Data Store (Week 3)**
⏳ Set up Data Store for user business data  
⏳ Ingest onboarding source of truth  
⏳ Enable RAG for all agents

### **Phase 4: Function Calling (Week 4)**
⏳ Wrap Guild agents as functions  
⏳ Enable Vertex AI to call your agents  
⏳ Create agent marketplace

---

## Vertex AI Agent Builder - Specific Features to Use

### **From Agent Garden:**

1. **Customer Service Template**
   - Adapt for Guild AI support
   - Handle user questions about features
   - Guide users through setup

2. **Data Analysis Agent**
   - Use for business metrics analysis
   - Financial reporting
   - Growth opportunity detection

3. **Code Generation Agent**
   - Help users create custom workflows
   - Generate integration code
   - API automation scripts

### **From Extensions:**

1. **Google Search Extension**
   - Real-time market research
   - Competitor analysis
   - Trend identification

2. **Code Execution Extension**
   - Run Python analysis on user data
   - Generate charts and reports
   - Data transformations

3. **Vertex AI Search Data Store**
   - Store user's business documents
   - Enable semantic search across all data
   - Power RAG for all agents

---

## Quick Start Commands

### **1. Enable Vertex AI APIs**
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable discoveryengine.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

### **2. Set Up Data Store**
```bash
# Create data store for user business data
gcloud alpha discovery-engine data-stores create guild-business-data \
  --location=global \
  --project=guild-ai-080 \
  --data-store-id=guild-business-data \
  --industry-vertical=GENERIC
```

### **3. Test Imagen 3**
```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://us-central1-aiplatform.googleapis.com/v1/projects/guild-ai-080/locations/us-central1/publishers/google/models/imagegeneration@006:predict \
  -d '{
    "instances": [{
      "prompt": "Professional marketing banner for AI business automation platform"
    }]
  }'
```

---

## Recommended Next Steps

1. **Implement Model Router** (1 hour)
   - Route tasks to Gemini Flash by default
   - Reserve Pro for complex strategy
   - Monitor usage vs. free tier limits

2. **Set Up Vertex AI Data Store** (2 hours)
   - Create data store
   - Ingest user onboarding data
   - Enable RAG search

3. **Add Imagen 3 Integration** (1 hour)
   - Keep local SD for volume
   - Use Imagen 3 for premium
   - Quality-based routing

4. **Test Agent Builder** (2 hours)
   - Explore pre-built templates
   - Test function calling
   - Evaluate for Guild integration

**Total implementation time: ~6 hours**  
**Monthly cost savings: ~$50,000 vs. hiring team**  
**Cost per user: ~$1.16/month**

---

This keeps your costs incredibly low while leveraging the best AI models! 🚀

