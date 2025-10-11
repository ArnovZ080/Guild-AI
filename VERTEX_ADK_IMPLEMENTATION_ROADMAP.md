# 🚀 Vertex AI ADK Integration Roadmap for Guild AI

Based on [Google's Agent Development Kit (ADK) samples](https://github.com/google/adk-samples), here's the implementation plan for Guild AI.

---

## Phase 1: Foundation (Week 1) ✅ Priority

### **1.1 RAG Enhancement with Vertex AI Data Store**
**Reference:** [bit.ly/rag-adk](https://bit.ly/rag-adk)  
**Status:** Already have MarkItDown ✅  
**Effort:** 4 hours

```python
# api_server/src/rag/vertex_datastore.py

from google.cloud import discoveryengine_v1 as discoveryengine

class VertexRAGEnhancement:
    """Enhance existing MarkItDown pipeline with Vertex AI Data Store"""
    
    def __init__(self):
        self.data_store_id = "guild-business-documents"
        self.project_id = "guild-ai-080"
        self.location = "global"
    
    async def ingest_from_markitdown(self, markdown_content, metadata):
        """Take MarkItDown output and store in Vertex AI Data Store"""
        document_client = discoveryengine.DocumentServiceClient()
        
        document = {
            "id": metadata.get("document_id"),
            "content": {
                "mimeType": "text/markdown",
                "rawBytes": markdown_content.encode()
            },
            "structData": {
                "user_id": metadata.get("user_id"),
                "source": metadata.get("provider"),
                "original_format": metadata.get("original_format"),
                "processed_date": datetime.utcnow().isoformat()
            }
        }
        
        parent = f"projects/{self.project_id}/locations/{self.location}/dataStores/{self.data_store_id}/branches/default_branch"
        response = document_client.create_document(parent=parent, document=document)
        return response
    
    async def search_with_citations(self, query, user_id, top_k=5):
        """Search with automatic citation tracking"""
        search_client = discoveryengine.SearchServiceClient()
        
        serving_config = f"projects/{self.project_id}/locations/{self.location}/dataStores/{self.data_store_id}/servingConfigs/default_search"
        
        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query,
            filter=f"user_id:\"{user_id}\"",
            page_size=top_k,
            # Enable extractive answers
            content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                    max_extractive_answer_count=3
                )
            )
        )
        
        response = search_client.search(request=request)
        
        # Format results with citations
        results = []
        for result in response.results:
            results.append({
                "content": result.document.derived_struct_data.get("extractive_answers", []),
                "source": result.document.name,
                "relevance_score": result.relevance_score,
                "citations": result.document.derived_struct_data.get("link", "")
            })
        
        return results
```

**Benefits:**
- Better search than vector store
- Automatic citation tracking
- Multi-hop reasoning
- No vector embedding management

**Cost:** FREE for first 1,000 queries/month, then $0.50 per 1,000

---

### **1.2 Model Router Implementation**
**Effort:** 2 hours

```python
# api_server/src/llm/model_router.py

class SmartModelRouter:
    """Route to cheapest model that can handle the task"""
    
    FREE_TIER_LIMITS = {
        "gemini-1.5-flash": {"requests_per_min": 15, "tokens_per_day": 1000000},
        "gemini-1.5-pro": {"requests_per_min": 2, "tokens_per_day": 32000}
    }
    
    def __init__(self):
        self.usage_tracker = UsageTracker()
    
    def route_request(self, task_type, complexity, user_tier):
        """Smart routing based on task requirements and user tier"""
        
        # Always try free tier first
        if self.usage_tracker.within_limits("gemini-1.5-flash"):
            if task_type in ["chat", "simple_content", "orchestration"]:
                return "gemini-1.5-flash"  # FREE
        
        # Strategy and analysis
        if task_type in ["strategy", "analysis", "planning"]:
            if complexity == "high" or user_tier == "enterprise":
                return "gemini-1.5-pro"  # $1.25/1M tokens
            return "gemini-1.5-flash"
        
        # Premium features
        if user_tier in ["professional", "enterprise"]:
            return "gemini-1.5-pro"
        
        return "gemini-1.5-flash"  # Default to free
```

---

## Phase 2: Financial Intelligence (Week 2)

### **2.1 Financial Advisor Agent Adaptation**
**Reference:** [bit.ly/financial-advisor-adk](https://bit.ly/financial-advisor-adk)  
**Effort:** 6 hours

```python
# guild/src/agents/enhanced_accounting_agent.py

class EnhancedAccountingAgent:
    """Adapt Google's Financial Advisor ADK for Guild AI"""
    
    async def analyze_business_finances(self, user_id):
        """Comprehensive financial analysis using Gemini Pro"""
        
        # Get source of truth
        onboarding_data = await self.get_source_of_truth(user_id)
        
        # Get financial data
        financial_data = {
            "current_revenue": onboarding_data.get("revenue_current"),
            "target_6m": onboarding_data.get("revenue_goal_6m"),
            "target_12m": onboarding_data.get("revenue_goal_12m"),
            "expenses": await self.get_expenses(user_id),
            "pricing": onboarding_data.get("pricing_strategy")
        }
        
        prompt = f"""As a financial advisor for a {onboarding_data['business_type']} business:

Current Financial State:
- Monthly Revenue: {financial_data['current_revenue']}
- 6-Month Target: {financial_data['target_6m']}
- 12-Month Target: {financial_data['target_12m']}

Provide:
1. P&L analysis
2. Cash flow projections
3. Investment recommendations
4. Risk assessment
5. Action plan to reach targets

Format as a professional financial report."""
        
        response = await self.call_gemini_pro(prompt)
        return self.parse_financial_report(response)
```

---

## Phase 3: Marketing Enhancement (Week 3)

### **3.1 Marketing Agency Agent Adaptation**
**Reference:** [bit.ly/marketing-agency-adk](https://bit.ly/marketing-agency-adk)  
**Effort:** 8 hours

```python
# guild/src/agents/enhanced_marketing_agent.py

class EnhancedMarketingAgent:
    """Adapt Google's Marketing Agency ADK"""
    
    async def create_comprehensive_campaign(self, user_id, campaign_type):
        """Full campaign with strategy, content, and schedule"""
        
        # Get business context
        context = await self.get_source_of_truth(user_id)
        
        # Multi-step campaign creation
        campaign = {
            "strategy": await self.generate_strategy(context, campaign_type),
            "content": await self.generate_content(context, campaign_type),
            "schedule": await self.generate_schedule(context),
            "targeting": await self.generate_targeting(context),
            "budget_allocation": await self.optimize_budget(context)
        }
        
        # Generate assets
        if campaign_type == "social":
            campaign["images"] = await self.generate_images(campaign["content"])
            campaign["videos"] = await self.generate_videos(campaign["content"])
        
        return campaign
    
    async def generate_strategy(self, context, campaign_type):
        """Use Gemini Pro for strategic planning"""
        prompt = f"""As a marketing strategist for {context['brand_voice_tone']} brand:

Business: {context['business_description']}
Audience: {context['target_audience']}
Budget: {context['marketing_budget']}

Create a {campaign_type} campaign strategy including:
1. Objectives and KPIs
2. Messaging framework
3. Channel mix
4. Timeline
5. Success metrics"""
        
        return await self.call_gemini_pro(prompt)
```

---

## Phase 4: Quality Control (Week 4)

### **4.1 LLM Auditor Implementation**
**Reference:** [bit.ly/llm-auditor](https://bit.ly/llm-auditor)  
**Effort:** 4 hours

```python
# guild/src/agents/llm_auditor_agent.py

class LLMAuditorAgent:
    """Automated quality control for all AI outputs"""
    
    async def audit_content(self, content, content_type, user_id):
        """Comprehensive content audit"""
        
        context = await self.get_source_of_truth(user_id)
        
        audits = {
            "brand_alignment": await self.check_brand_alignment(content, context),
            "factual_accuracy": await self.check_facts(content),
            "tone_consistency": await self.check_tone(content, context["brand_voice_tone"]),
            "seo_score": await self.check_seo(content, content_type),
            "engagement_potential": await self.predict_engagement(content)
        }
        
        overall_score = self.calculate_overall_score(audits)
        
        return {
            "score": overall_score,
            "audits": audits,
            "recommendations": await self.generate_improvements(audits),
            "approved": overall_score >= 0.8
        }
    
    async def check_brand_alignment(self, content, context):
        """Check if content matches brand voice and values"""
        prompt = f"""Analyze this content for brand alignment:

Brand Voice: {context['brand_voice_tone']}
Brand Values: {context['brand_values']}
Brand Differentiation: {context['brand_differentiation']}

Content: {content}

Score 0-1 for brand alignment and explain."""
        
        response = await self.call_gemini_flash(prompt)
        return self.parse_score(response)
```

---

### **4.2 Image Scoring Agent**
**Reference:** bitly.cx/UkgFy  
**Effort:** 3 hours

```python
# guild/src/agents/image_scoring_agent.py

class ImageScoringAgent:
    """Score generated images for quality and brand fit"""
    
    async def score_image(self, image_url, context):
        """Use Gemini Vision to score images"""
        
        # Use Gemini 1.5 Flash Vision (FREE tier!)
        model = GenerativeModel("gemini-1.5-flash")
        
        image = Part.from_uri(image_url, mime_type="image/jpeg")
        
        prompt = f"""Analyze this image for a {context['business_type']} business:

Brand Colors: {context['brand_colors']}
Brand Personality: {context['brand_personality']}
Target Audience: {context['target_audience']}

Score 0-10 on:
1. Visual quality
2. Brand alignment
3. Audience appeal
4. Message clarity
5. Professional appearance

Provide scores and recommendations."""
        
        response = model.generate_content([prompt, image])
        return self.parse_image_scores(response.text)
```

---

## Phase 5: SEO & Brand Optimization (Week 5)

### **5.1 Brand Search Optimization**
**Reference:** [bit.ly/brand-search-optimization](https://bit.ly/brand-search-optimization)  
**Effort:** 5 hours

```python
# guild/src/agents/seo_brand_optimizer.py

class SEOBrandOptimizer:
    """Optimize content for search and brand visibility"""
    
    async def optimize_content(self, content, target_keywords, user_id):
        """Full SEO optimization using Google Search grounding"""
        
        # Use Gemini with Google Search grounding
        model = GenerativeModel(
            "gemini-1.5-flash",
            tools=[Tool.from_google_search_retrieval()]
        )
        
        context = await self.get_source_of_truth(user_id)
        
        prompt = f"""Optimize this content for SEO:

Target Keywords: {target_keywords}
Brand: {context['brand_voice_tone']}
Industry: {context['industry']}

Content: {content}

Provide:
1. Keyword optimization suggestions
2. Meta description
3. Title tags
4. Internal linking suggestions
5. Content structure improvements
6. Competitor analysis

Use current SEO best practices (search the web for latest trends)."""
        
        response = model.generate_content(prompt)
        return self.parse_seo_recommendations(response.text)
    
    async def analyze_competitors(self, industry, user_id):
        """Real-time competitor analysis with Google Search"""
        # Use Google Search grounding for current info
        pass
```

---

## Implementation Priority Matrix

| Feature | ADK Source | Effort | Impact | Priority | Cost |
|---------|-----------|--------|--------|----------|------|
| **Model Router** | Custom | 2h | High | 🔴 P0 | $0 |
| **Vertex RAG** | [RAG ADK](https://bit.ly/rag-adk) | 4h | High | 🔴 P0 | $0.50/1K |
| **LLM Auditor** | [LLM Auditor](https://bit.ly/llm-auditor) | 4h | High | 🟡 P1 | $0 (Flash) |
| **Image Scoring** | bitly.cx/UkgFy | 3h | Medium | 🟡 P1 | $0 (Flash Vision) |
| **Financial Agent** | [Financial ADK](https://bit.ly/financial-advisor-adk) | 6h | Medium | 🟢 P2 | $1.25/1M (Pro) |
| **Marketing Agent** | [Marketing ADK](https://bit.ly/marketing-agency-adk) | 8h | High | 🟢 P2 | $0 (Flash) |
| **SEO Optimizer** | [Brand Search](https://bit.ly/brand-search-optimization) | 5h | Medium | 🟢 P2 | $0 (Flash+Search) |

**Total Implementation Time:** ~32 hours (~1 week of focused work)  
**Total Monthly Cost (100 users):** ~$125/month

---

## Quick Start After Onboarding Fix

### Step 1: Enable APIs (5 minutes)
```bash
gcloud services enable discoveryengine.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### Step 2: Create Data Store (10 minutes)
```bash
gcloud alpha discovery-engine data-stores create guild-business-documents \
  --location=global \
  --project=guild-ai-080 \
  --industry-vertical=GENERIC
```

### Step 3: Implement Model Router (2 hours)
- Create `api_server/src/llm/model_router.py`
- Update orchestrator to use router
- Test with free tier limits

### Step 4: Integrate Vertex RAG (4 hours)
- Connect MarkItDown → Vertex Data Store
- Update ingestion pipeline
- Test search with citations

### Step 5: Add Quality Control (4 hours)
- Implement LLM Auditor
- Add Image Scoring
- Create approval workflow

---

## Testing Plan

### Phase 1 Tests
```python
# Test model routing
def test_model_router():
    router = SmartModelRouter()
    
    # Should use free tier
    model = router.route_request("chat", "low", "starter")
    assert model == "gemini-1.5-flash"
    
    # Should use Pro for strategy
    model = router.route_request("strategy", "high", "enterprise")
    assert model == "gemini-1.5-pro"

# Test Vertex RAG
def test_vertex_rag():
    rag = VertexRAGEnhancement()
    
    # Ingest from MarkItDown
    markdown = """# Business Plan
    Our strategy focuses on..."""
    
    result = await rag.ingest_from_markitdown(markdown, {
        "user_id": "test_user",
        "document_id": "business_plan_v1"
    })
    
    # Search with citations
    results = await rag.search_with_citations(
        "what is our strategy",
        "test_user"
    )
    
    assert len(results) > 0
    assert "citations" in results[0]
```

---

## Success Metrics

### Technical Metrics
- ✅ 95% of requests use free tier (Gemini Flash)
- ✅ Average response time < 2 seconds
- ✅ Content approval rate > 80%
- ✅ SEO score improvement > 30%

### Business Metrics
- ✅ Cost per user stays under $1.50/month
- ✅ User satisfaction with content quality > 4.5/5
- ✅ Time saved per user > 10 hours/week
- ✅ Revenue per user > $99/month (profitable at all tiers)

---

## Resources

### Google ADK Samples
- [RAG Agent](https://bit.ly/rag-adk)
- [Financial Advisor](https://bit.ly/financial-advisor-adk)
- [Marketing Agency](https://bit.ly/marketing-agency-adk)
- [Customer Service](https://bit.ly/customer-service-adk)
- [LLM Auditor](https://bit.ly/llm-auditor)
- [Brand Search Optimization](https://bit.ly/brand-search-optimization)
- [Image Scoring](https://bitly.cx/UkgFy)

### Guild AI Docs
- MarkItDown Integration: `guild/docs/MARKITDOWN_INTEGRATION.md`
- Vertex AI Plan: `VERTEX_AI_INTEGRATION_PLAN.md`
- Source of Truth: `SOURCE_OF_TRUTH_IMPLEMENTATION.md`

---

**Ready to implement after onboarding/signup is fully working!** 🚀

