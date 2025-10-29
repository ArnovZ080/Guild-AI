"""
SEO Brand Optimizer Agent
Optimizes content for search engines while maintaining brand consistency
Based on Google ADK Brand Search Optimization sample
"""

import os
import logging
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import vertexai
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.preview.generative_models import grounding

logger = logging.getLogger(__name__)

@dataclass
class SEORecommendations:
    """SEO optimization recommendations"""
    keyword_suggestions: list[str]
    meta_description: str
    title_tag: str
    heading_structure: list[str]
    internal_links: list[str]
    content_improvements: list[str]
    competitor_insights: list[str]
    overall_seo_score: float  # 0-100

class SEOBrandOptimizer:
    """Optimize content for search and brand visibility"""
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Model with Google Search grounding (for real-time SEO trends!)
        try:
            self.model_with_search = GenerativeModel(
                "gemini-1.5-flash",
                tools=[Tool.from_google_search_retrieval(grounding.GoogleSearchRetrieval())]
            )
            self.has_search = True
            logger.info("SEO Optimizer initialized with Google Search grounding")
        except Exception as e:
            logger.warning(f"Google Search grounding not available: {e}")
            self.model_with_search = GenerativeModel("gemini-1.5-flash")
            self.has_search = False
        
        # Standard model for non-search tasks
        self.model = GenerativeModel("gemini-1.5-flash")
    
    async def optimize_content(
        self,
        content: str,
        target_keywords: List[str],
        business_context: Dict[str, Any],
        content_type: str = "blog"
    ) -> SEORecommendations:
        """
        Full SEO optimization with current best practices
        
        Args:
            content: Content to optimize
            target_keywords: Target keywords for SEO
            business_context: User's source of truth
            content_type: Type of content (blog, landing_page, product, etc.)
        
        Returns:
            SEORecommendations with actionable improvements
        """
        try:
            brand = business_context.get("brand", {})
            audience = business_context.get("audience", {})
            industry = business_context.get("business", {}).get("industry", "general")
            
            prompt = f"""You are an SEO expert optimizing content for a {industry} business.

**Business Context:**
- Brand Voice: {brand.get('voice_tone', 'Professional')}
- Target Audience: {audience.get('target', 'General')}
- Industry: {industry}

**Target Keywords:** {', '.join(target_keywords)}
**Content Type:** {content_type}

**Content to Optimize:**
{content}

**Search the web for current SEO best practices for {industry} and {content_type} content in 2025.**

**Provide detailed SEO recommendations in this JSON format:**
{{
    "keyword_suggestions": ["primary keyword", "secondary keyword", "long-tail keyword"],
    "meta_description": "Optimized meta description (150-160 chars)",
    "title_tag": "SEO-optimized title tag (50-60 chars)",
    "heading_structure": ["H1: Main heading", "H2: Section 1", "H2: Section 2"],
    "internal_links": ["Suggested internal link 1", "Suggested internal link 2"],
    "content_improvements": ["improvement 1", "improvement 2"],
    "competitor_insights": ["what competitors are doing well"],
    "overall_seo_score": <score 0-100>
}}

**Make sure recommendations maintain the {brand.get('voice_tone')} brand voice!**"""
            
            # Use model with search if available
            model = self.model_with_search if self.has_search else self.model
            response = model.generate_content(prompt)
            
            # Parse recommendations
            recommendations = self._parse_recommendations(response.text)
            
            logger.info(f"SEO optimization complete. Score: {recommendations.overall_seo_score}/100")
            return recommendations
            
        except Exception as e:
            logger.error(f"SEO optimization failed: {e}")
            return SEORecommendations(
                keyword_suggestions=target_keywords,
                meta_description="",
                title_tag="",
                heading_structure=[],
                internal_links=[],
                content_improvements=["Error during optimization"],
                competitor_insights=[],
                overall_seo_score=0.0
            )
    
    async def analyze_competitors(
        self,
        industry: str,
        business_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Real-time competitor analysis using Google Search
        
        Args:
            industry: Business industry
            business_context: User's source of truth
        
        Returns:
            Competitor insights and strategies
        """
        try:
            business_type = business_context.get("business", {}).get("type", "business")
            differentiation = business_context.get("brand", {}).get("differentiation", "")
            
            prompt = f"""Search the web for information about competitors in the {industry} industry, specifically for {business_type}.

**Our Differentiation:** {differentiation}

**Provide a competitor analysis:**
1. Who are the top 3-5 competitors?
2. What SEO strategies are they using?
3. What keywords are they ranking for?
4. What content types perform well for them?
5. What gaps can we exploit?

Provide current, real-time information from your search."""
            
            # Use model with Google Search
            model = self.model_with_search if self.has_search else self.model
            response = model.generate_content(prompt)
            
            return {
                "analysis": response.text,
                "grounded": self.has_search,
                "timestamp": "2025-10-11T14:00:00Z"
            }
            
        except Exception as e:
            logger.error(f"Competitor analysis failed: {e}")
            return {
                "analysis": "Competitor analysis unavailable",
                "error": str(e)
            }
    
    async def suggest_keywords(
        self,
        topic: str,
        business_context: Dict[str, Any]
    ) -> List[str]:
        """
        Suggest SEO keywords using Google Search trends
        
        Args:
            topic: Content topic
            business_context: User's source of truth
        
        Returns:
            List of keyword suggestions
        """
        try:
            industry = business_context.get("business", {}).get("industry", "general")
            
            prompt = f"""Search for trending keywords related to "{topic}" in the {industry} industry.

Provide a list of:
1. High-volume keywords (good traffic)
2. Long-tail keywords (easy to rank)
3. Question-based keywords (featured snippets)

Response format: {{"keywords": ["keyword 1", "keyword 2", ...]}}"""
            
            model = self.model_with_search if self.has_search else self.model
            response = model.generate_content(prompt)
            
            # Extract keywords
            data = self._extract_json(response.text)
            return data.get("keywords", [topic])
            
        except Exception as e:
            logger.error(f"Keyword suggestion failed: {e}")
            return [topic]
    
    def _parse_recommendations(self, response_text: str) -> SEORecommendations:
        """Parse SEO recommendations from response"""
        try:
            data = self._extract_json(response_text)
            
            return SEORecommendations(
                keyword_suggestions=data.get("keyword_suggestions", []),
                meta_description=data.get("meta_description", ""),
                title_tag=data.get("title_tag", ""),
                heading_structure=data.get("heading_structure", []),
                internal_links=data.get("internal_links", []),
                content_improvements=data.get("content_improvements", []),
                competitor_insights=data.get("competitor_insights", []),
                overall_seo_score=float(data.get("overall_seo_score", 50))
            )
            
        except Exception as e:
            logger.error(f"Failed to parse recommendations: {e}")
            return SEORecommendations(
                keyword_suggestions=[],
                meta_description="",
                title_tag="",
                heading_structure=[],
                internal_links=[],
                content_improvements=[],
                competitor_insights=[],
                overall_seo_score=0.0
            )
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response text"""
        try:
            # Try to find JSON block
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
            elif "{" in text:
                start = text.index("{")
                end = text.rindex("}") + 1
                json_str = text[start:end]
            else:
                return {}
            
            return json.loads(json_str)
            
        except Exception as e:
            logger.debug(f"JSON extraction failed: {e}")
            return {}
    
    def _extract_score(self, text: str, default: float = 0.5) -> float:
        """Extract numerical score from text"""
        try:
            data = self._extract_json(text)
            score = float(data.get("score", default))
            return max(0.0, min(1.0, score))
        except:
            return default

# Global instance
seo_optimizer = SEOBrandOptimizer()

