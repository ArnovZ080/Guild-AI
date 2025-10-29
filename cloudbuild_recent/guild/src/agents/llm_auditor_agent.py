"""
LLM Auditor Agent
Automated quality control for all AI-generated content
Based on Google ADK LLM Auditor sample
"""

import os
import logging
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger(__name__)

@dataclass
class ContentAudit:
    """Content audit results"""
    overall_score: float  # 0-1
    brand_alignment: float
    factual_accuracy: float
    tone_consistency: float
    seo_score: float
    engagement_potential: float
    recommendations: list[str]
    approved: bool  # True if overall_score >= 0.8
    issues: list[str]

class LLMAuditorAgent:
    """Automated quality control for all AI outputs"""
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Use Gemini Flash for cost-effective auditing
        self.model = GenerativeModel("gemini-1.5-flash")
        
        logger.info("LLM Auditor Agent initialized")
    
    async def audit_content(
        self,
        content: str,
        content_type: str,
        business_context: Dict[str, Any]
    ) -> ContentAudit:
        """
        Comprehensive content audit
        
        Args:
            content: Content to audit
            content_type: Type (blog, social, email, ad, etc.)
            business_context: User's source of truth
        
        Returns:
            ContentAudit with scores and recommendations
        """
        try:
            # Run all audit checks
            brand_score = await self.check_brand_alignment(content, business_context)
            fact_score = await self.check_factual_accuracy(content)
            tone_score = await self.check_tone_consistency(content, business_context)
            seo_score = await self.check_seo(content, content_type)
            engagement_score = await self.predict_engagement(content, content_type)
            
            # Calculate overall score
            overall = (
                brand_score * 0.25 +
                fact_score * 0.20 +
                tone_score * 0.20 +
                seo_score * 0.20 +
                engagement_score * 0.15
            )
            
            # Collect issues
            issues = []
            if brand_score < 0.7:
                issues.append(f"Brand alignment low ({brand_score:.2f})")
            if fact_score < 0.7:
                issues.append(f"Factual accuracy concerns ({fact_score:.2f})")
            if tone_score < 0.7:
                issues.append(f"Tone inconsistency ({tone_score:.2f})")
            if seo_score < 0.7:
                issues.append(f"SEO optimization needed ({seo_score:.2f})")
            
            recommendations = await self.generate_improvements(
                content, business_context, {
                    "brand": brand_score,
                    "facts": fact_score,
                    "tone": tone_score,
                    "seo": seo_score,
                    "engagement": engagement_score
                }
            )
            
            return ContentAudit(
                overall_score=overall,
                brand_alignment=brand_score,
                factual_accuracy=fact_score,
                tone_consistency=tone_score,
                seo_score=seo_score,
                engagement_potential=engagement_score,
                recommendations=recommendations,
                approved=overall >= 0.8,
                issues=issues
            )
            
        except Exception as e:
            logger.error(f"Content audit failed: {e}")
            return ContentAudit(
                overall_score=0.0,
                brand_alignment=0.0,
                factual_accuracy=0.0,
                tone_consistency=0.0,
                seo_score=0.0,
                engagement_potential=0.0,
                recommendations=["Audit failed", str(e)],
                approved=False,
                issues=["Audit error"]
            )
    
    async def check_brand_alignment(
        self,
        content: str,
        context: Dict[str, Any]
    ) -> float:
        """Check if content matches brand voice and values"""
        brand = context.get("brand", {})
        
        prompt = f"""Analyze this content for brand alignment:

**Brand Guidelines:**
- Voice: {brand.get('voice_tone', 'Professional')}
- Values: {brand.get('values', 'Not specified')}
- Differentiation: {brand.get('differentiation', 'Not specified')}
- Personality: {brand.get('personality', 'Not specified')}

**Content to analyze:**
{content}

**Provide a score 0-1 for brand alignment and explain.**
Response format: {{"score": 0.85, "explanation": "..."}}"""
        
        response = self.model.generate_content(prompt)
        return self._extract_score(response.text, default=0.5)
    
    async def check_factual_accuracy(self, content: str) -> float:
        """Check content for factual accuracy"""
        prompt = f"""Analyze this content for factual accuracy:

{content}

Check for:
1. Verifiable claims
2. Accurate statistics
3. Correct information
4. No misleading statements

Provide a score 0-1 for factual accuracy.
Response format: {{"score": 0.9, "explanation": "..."}}"""
        
        response = self.model.generate_content(prompt)
        return self._extract_score(response.text, default=0.8)
    
    async def check_tone_consistency(
        self,
        content: str,
        context: Dict[str, Any]
    ) -> float:
        """Check if tone matches brand voice"""
        brand_voice = context.get("brand", {}).get("voice_tone", "Professional")
        
        prompt = f"""Analyze this content for tone consistency:

**Required Brand Voice:** {brand_voice}

**Content:**
{content}

**Does the tone match the brand voice?**
Score 0-1 for tone consistency.
Response format: {{"score": 0.75, "explanation": "..."}}"""
        
        response = self.model.generate_content(prompt)
        return self._extract_score(response.text, default=0.7)
    
    async def check_seo(self, content: str, content_type: str) -> float:
        """Check SEO optimization"""
        prompt = f"""Analyze this {content_type} content for SEO:

{content}

Check for:
1. Keyword usage (natural, not stuffed)
2. Readability
3. Structure (headings, paragraphs)
4. Meta description potential
5. Link opportunities

Score 0-1 for SEO quality.
Response format: {{"score": 0.7, "explanation": "..."}}"""
        
        response = self.model.generate_content(prompt)
        return self._extract_score(response.text, default=0.6)
    
    async def predict_engagement(
        self,
        content: str,
        content_type: str
    ) -> float:
        """Predict engagement potential"""
        prompt = f"""Predict engagement potential for this {content_type}:

{content}

Consider:
1. Hook strength
2. Value proposition clarity
3. Call-to-action effectiveness
4. Emotional appeal
5. Shareability

Score 0-1 for engagement potential.
Response format: {{"score": 0.65, "explanation": "..."}}"""
        
        response = self.model.generate_content(prompt)
        return self._extract_score(response.text, default=0.5)
    
    async def generate_improvements(
        self,
        content: str,
        context: Dict[str, Any],
        scores: Dict[str, float]
    ) -> list[str]:
        """Generate specific improvement recommendations"""
        recommendations = []
        
        # Identify weak areas
        if scores["brand"] < 0.7:
            recommendations.append(
                f"Strengthen brand voice to match '{context.get('brand', {}).get('voice_tone', 'your brand')}'"
            )
        
        if scores["tone"] < 0.7:
            recommendations.append("Adjust tone for better consistency with brand personality")
        
        if scores["seo"] < 0.7:
            recommendations.append("Optimize for SEO: add relevant keywords naturally")
        
        if scores["engagement"] < 0.6:
            recommendations.append("Enhance hook and call-to-action for better engagement")
        
        if not recommendations:
            recommendations.append("Content meets quality standards!")
        
        return recommendations
    
    def _extract_score(self, response_text: str, default: float = 0.5) -> float:
        """Extract score from Gemini response"""
        try:
            # Try to parse JSON
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "{" in response_text:
                start = response_text.index("{")
                end = response_text.rindex("}") + 1
                json_str = response_text[start:end]
            else:
                return default
            
            data = json.loads(json_str)
            score = float(data.get("score", default))
            
            # Ensure score is in valid range
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            logger.debug(f"Failed to extract score: {e}")
            return default

# Global instance
llm_auditor = LLMAuditorAgent()

