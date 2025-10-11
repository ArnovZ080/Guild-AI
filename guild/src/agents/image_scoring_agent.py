"""
Image Scoring Agent
Uses Gemini Vision to score generated images for quality and brand alignment
Based on Google ADK Image Scoring sample
"""

import os
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import json

logger = logging.getLogger(__name__)

@dataclass
class ImageScore:
    """Image scoring results"""
    overall_score: float  # 0-10
    visual_quality: float
    brand_alignment: float
    audience_appeal: float
    message_clarity: float
    professional_appearance: float
    recommendations: list[str]
    approved: bool  # True if overall_score >= 7.0

class ImageScoringAgent:
    """Score generated images for quality and brand fit using Gemini Vision"""
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Use Gemini Flash Vision (FREE tier!)
        self.model = GenerativeModel("gemini-1.5-flash")
        
        logger.info("Image Scoring Agent initialized with Gemini Vision")
    
    async def score_image(
        self,
        image_url: str,
        business_context: Dict[str, Any],
        purpose: str = "marketing"
    ) -> ImageScore:
        """
        Score an image for quality and brand alignment
        
        Args:
            image_url: URL or GCS path to image
            business_context: User's source of truth data
            purpose: Image purpose (marketing, social, product, etc.)
        
        Returns:
            ImageScore with detailed scoring and recommendations
        """
        try:
            # Load image
            if image_url.startswith("gs://"):
                image_part = Part.from_uri(image_url, mime_type="image/jpeg")
            elif image_url.startswith("http"):
                image_part = Part.from_uri(image_url, mime_type="image/jpeg")
            else:
                # Local file path
                with open(image_url, "rb") as f:
                    image_bytes = f.read()
                image_part = Part.from_data(image_bytes, mime_type="image/jpeg")
            
            # Build scoring prompt with business context
            prompt = self._build_scoring_prompt(business_context, purpose)
            
            # Generate analysis
            response = self.model.generate_content([prompt, image_part])
            
            # Parse scores from response
            scores = self._parse_scores(response.text)
            
            logger.info(f"Image scored: {scores.overall_score}/10")
            return scores
            
        except Exception as e:
            logger.error(f"Image scoring failed: {e}")
            # Return default failing score
            return ImageScore(
                overall_score=0.0,
                visual_quality=0.0,
                brand_alignment=0.0,
                audience_appeal=0.0,
                message_clarity=0.0,
                professional_appearance=0.0,
                recommendations=["Error occurred during scoring", str(e)],
                approved=False
            )
    
    def _build_scoring_prompt(
        self,
        context: Dict[str, Any],
        purpose: str
    ) -> str:
        """Build scoring prompt with business context"""
        
        brand = context.get("brand", {})
        audience = context.get("audience", {})
        business = context.get("business", {})
        
        prompt = f"""You are an expert visual content analyst scoring images for a business.

**Business Context:**
- Business Type: {business.get('type', 'Unknown')}
- Industry: {business.get('industry', 'Unknown')}
- Target Audience: {audience.get('target', 'General')}

**Brand Guidelines:**
- Brand Voice: {brand.get('voice_tone', 'Professional')}
- Brand Colors: {brand.get('colors', 'Not specified')}
- Brand Personality: {brand.get('personality', 'Not specified')}
- Brand Values: {brand.get('values', 'Not specified')}

**Image Purpose:** {purpose}

**Analyze this image and provide scores (0-10) for:**

1. **Visual Quality** (composition, lighting, resolution, technical excellence)
2. **Brand Alignment** (matches brand colors, personality, voice, values)
3. **Audience Appeal** (resonates with target audience)
4. **Message Clarity** (clear message, easy to understand)
5. **Professional Appearance** (polished, publication-ready)

**Provide your response in this exact JSON format:**
{{
    "visual_quality": <score 0-10>,
    "brand_alignment": <score 0-10>,
    "audience_appeal": <score 0-10>,
    "message_clarity": <score 0-10>,
    "professional_appearance": <score 0-10>,
    "overall_score": <average score 0-10>,
    "recommendations": ["recommendation 1", "recommendation 2", ...]
}}

Be specific in your recommendations for improvements."""
        
        return prompt
    
    def _parse_scores(self, response_text: str) -> ImageScore:
        """Parse scores from Gemini response"""
        try:
            # Try to extract JSON from response
            # Look for JSON block
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            elif "{" in response_text and "}" in response_text:
                start = response_text.index("{")
                end = response_text.rindex("}") + 1
                json_str = response_text[start:end]
            else:
                json_str = response_text
            
            data = json.loads(json_str)
            
            overall = float(data.get("overall_score", 0))
            
            return ImageScore(
                overall_score=overall,
                visual_quality=float(data.get("visual_quality", 0)),
                brand_alignment=float(data.get("brand_alignment", 0)),
                audience_appeal=float(data.get("audience_appeal", 0)),
                message_clarity=float(data.get("message_clarity", 0)),
                professional_appearance=float(data.get("professional_appearance", 0)),
                recommendations=data.get("recommendations", []),
                approved=overall >= 7.0
            )
            
        except Exception as e:
            logger.error(f"Failed to parse image scores: {e}")
            logger.debug(f"Response text: {response_text}")
            
            # Return neutral scores if parsing fails
            return ImageScore(
                overall_score=5.0,
                visual_quality=5.0,
                brand_alignment=5.0,
                audience_appeal=5.0,
                message_clarity=5.0,
                professional_appearance=5.0,
                recommendations=["Unable to parse detailed scores"],
                approved=False
            )
    
    async def batch_score_images(
        self,
        image_urls: list[str],
        business_context: Dict[str, Any],
        purpose: str = "marketing"
    ) -> list[ImageScore]:
        """Score multiple images and return best candidates"""
        scores = []
        
        for url in image_urls:
            score = await self.score_image(url, business_context, purpose)
            scores.append(score)
        
        # Sort by overall score
        scores.sort(key=lambda x: x.overall_score, reverse=True)
        
        return scores
    
    def recommend_best_image(
        self,
        scored_images: list[tuple[str, ImageScore]]
    ) -> Optional[tuple[str, ImageScore]]:
        """
        Recommend best image from scored list
        
        Args:
            scored_images: List of (image_url, ImageScore) tuples
        
        Returns:
            Best image tuple or None if no images are approved
        """
        # Filter approved images
        approved = [(url, score) for url, score in scored_images if score.approved]
        
        if not approved:
            logger.warning("No images met approval threshold (7.0)")
            return None
        
        # Return highest scoring
        best = max(approved, key=lambda x: x[1].overall_score)
        logger.info(f"Best image: {best[0]} (score: {best[1].overall_score})")
        
        return best

# Global instance
image_scoring_agent = ImageScoringAgent()

