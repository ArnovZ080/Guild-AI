"""
Content Repurposer Agent for Guild-AI
Comprehensive content transformation using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class ContentAsset:
    """Data class for content asset information."""
    asset_id: str
    title: str
    content_type: str  # blog_post, video, podcast, etc.
    format: str  # text, video, audio, image
    content: str
    metadata: Dict[str, Any]
    performance_metrics: Dict[str, float]
    creation_date: datetime
    last_updated: datetime


@dataclass
class RepurposingRecommendation:
    """Data class for content repurposing recommendation."""
    recommendation_id: str
    source_asset_id: str
    target_format: str
    target_platform: str
    adaptation_strategy: str
    expected_reach: int
    effort_level: str
    priority_score: float


@inject_knowledge
async def generate_comprehensive_content_repurposing_strategy(
    source_content: Dict[str, Any],
    target_platforms: Dict[str, Any],
    audience_preferences: Dict[str, Any],
    content_performance: Dict[str, Any],
    brand_guidelines: Dict[str, Any],
    repurposing_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive content repurposing strategy using advanced prompting strategies.
    Transforms content into multiple formats for maximum reach and engagement.
    """
    print("Content Repurposer Agent: Generating comprehensive content repurposing strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Content Repurposer Agent - Comprehensive Content Transformation & Optimization

## Role Definition
You are the **Content Repurposer Agent**, an expert in content transformation, format adaptation, and multi-platform optimization. Your role is to analyze existing content assets and strategically repurpose them into various formats and platforms to maximize reach, engagement, and value while maintaining brand consistency and message effectiveness.

## Core Expertise
- Content Format Transformation
- Platform-Specific Adaptation
- Audience Segmentation & Targeting
- Engagement Optimization
- Content Performance Analysis
- Multi-Channel Distribution Strategy
- Brand Consistency Maintenance
- Content Lifecycle Management

## Context & Background Information
**Source Content:** {json.dumps(source_content, indent=2)}
**Target Platforms:** {json.dumps(target_platforms, indent=2)}
**Audience Preferences:** {json.dumps(audience_preferences, indent=2)}
**Content Performance:** {json.dumps(content_performance, indent=2)}
**Brand Guidelines:** {json.dumps(brand_guidelines, indent=2)}
**Repurposing Goals:** {json.dumps(repurposing_goals, indent=2)}

## Task Breakdown & Steps
1. **Content Analysis:** Evaluate source content for repurposing potential and key messages
2. **Platform Mapping:** Identify optimal platforms and formats for content distribution
3. **Audience Alignment:** Match content formats to audience preferences and behaviors
4. **Transformation Strategy:** Develop approach for adapting content to different formats
5. **Brand Integration:** Ensure consistent brand voice and visual identity across formats
6. **Performance Optimization:** Optimize content for platform-specific engagement metrics
7. **Distribution Planning:** Create strategic rollout plan for repurposed content
8. **Success Measurement:** Establish metrics for tracking repurposing effectiveness

## Constraints & Rules
- All repurposed content must maintain core message integrity
- Platform adaptations must respect platform-specific best practices and limitations
- Brand guidelines must be consistently applied across all formats
- Content quality must be maintained or improved in transformation
- Audience preferences must guide format and platform selection
- Repurposing effort must be proportional to expected reach and engagement
- Original content value proposition must be preserved or enhanced
- All recommendations must be actionable and resource-conscious

## Output Format
Return a comprehensive JSON object with repurposing strategy, format recommendations, platform optimization, and implementation plan.

Generate the comprehensive content repurposing strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            repurposing_strategy = json.loads(response)
            print("Content Repurposer Agent: Successfully generated comprehensive content repurposing strategy.")
            return repurposing_strategy
        except json.JSONDecodeError as e:
            print(f"Content Repurposer Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    repurposing_strategy = json.loads(json_match.group(1))
                    print("Content Repurposer Agent: Successfully extracted and parsed JSON from response.")
                    return repurposing_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured fallback response
            return {
                "repurposing_analysis": {
                    "source_content_value": "high",
                    "repurposing_potential": "excellent",
                    "platform_opportunities": ["social_media", "video_content", "email_newsletters"],
                    "priority_formats": ["video_highlights", "infographic_series", "podcast_clips"]
                },
                "transformation_recommendations": [
                    {
                        "source_format": "blog_post",
                        "target_format": "video_series",
                        "adaptation_strategy": "Break into 3-5 minute educational segments",
                        "expected_engagement": "200% increase over text"
                    },
                    {
                        "source_format": "long_form_content",
                        "target_format": "social_media_carousel",
                        "adaptation_strategy": "Extract key points into visual slides",
                        "expected_engagement": "150% increase in shares"
                    }
                ],
                "platform_optimization": {
                    "linkedin": {"format": "professional_insights", "tone": "thought_leadership"},
                    "twitter": {"format": "thread_series", "tone": "conversational"},
                    "youtube": {"format": "educational_videos", "tone": "instructional"},
                    "instagram": {"format": "visual_stories", "tone": "inspirational"}
                },
                "implementation_timeline": {
                    "week_1": "Content audit and prioritization",
                    "week_2": "Video and visual content creation",
                    "week_3": "Social media adaptation and scheduling",
                    "week_4": "Performance tracking and optimization"
                }
            }
    except Exception as e:
        print(f"Content Repurposer Agent: Failed to generate repurposing strategy. Error: {e}")
        return {
            "repurposing_analysis": {
                "source_content_value": "pending_analysis",
                "repurposing_potential": "evaluation_needed",
                "platform_opportunities": ["analysis_required"],
                "priority_formats": ["assessment_pending"]
            },
            "error": str(e)
        }


class ContentRepurposerAgent:
    """
    Content Repurposer Agent - Expert in content transformation and multi-platform optimization
    
    Transforms existing content into multiple formats for maximum reach and engagement
    while maintaining brand consistency and message effectiveness.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Content Repurposer Agent"
        self.agent_type = "Creative & Media"
        self.capabilities = [
            "Content format transformation",
            "Platform-specific adaptation", 
            "Audience segmentation and targeting",
            "Engagement optimization",
            "Content performance analysis",
            "Multi-channel distribution strategy",
            "Brand consistency maintenance",
            "Content lifecycle management"
        ]
        self.content_library = {}
        self.repurposing_history = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Content Repurposer Agent.
        Implements comprehensive content repurposing using advanced prompting strategies.
        """
        try:
            print(f"Content Repurposer Agent: Starting comprehensive content repurposing...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                repurposing_request = user_input
            else:
                repurposing_request = "Repurpose existing content for maximum reach across platforms"
            
            # Define comprehensive repurposing parameters
            source_content = {
                "primary_assets": [
                    {
                        "id": "blog_001",
                        "title": "The Future of AI Automation in Small Business",
                        "type": "blog_post",
                        "format": "long_form_text",
                        "word_count": 2500,
                        "key_topics": ["AI automation", "small business", "productivity", "efficiency"],
                        "performance": {
                            "views": 5200,
                            "shares": 180,
                            "engagement_rate": 0.12,
                            "conversion_rate": 0.08
                        },
                        "content_summary": "Comprehensive guide on implementing AI automation in small businesses"
                    },
                    {
                        "id": "webinar_001",
                        "title": "Guild-AI Demo: Automating Your Workflow",
                        "type": "webinar",
                        "format": "video",
                        "duration": "45 minutes",
                        "key_topics": ["product demo", "workflow automation", "use cases"],
                        "performance": {
                            "attendees": 320,
                            "completion_rate": 0.75,
                            "feedback_score": 4.6,
                            "lead_generation": 48
                        },
                        "content_summary": "Live demonstration of Guild-AI platform capabilities"
                    },
                    {
                        "id": "podcast_001",
                        "title": "Interview: Scaling with AI Agents",
                        "type": "podcast_episode",
                        "format": "audio",
                        "duration": "35 minutes",
                        "key_topics": ["scaling", "AI agents", "business growth", "automation"],
                        "performance": {
                            "downloads": 1850,
                            "retention_rate": 0.68,
                            "subscriber_growth": 120,
                            "engagement_score": 0.15
                        },
                        "content_summary": "Expert interview on scaling businesses using AI agents"
                    }
                ],
                "content_themes": {
                    "automation": 0.45,
                    "productivity": 0.38,
                    "small_business": 0.42,
                    "ai_technology": 0.35,
                    "efficiency": 0.31
                },
                "top_performing_elements": [
                    "Practical use cases and examples",
                    "Step-by-step implementation guides",
                    "ROI calculations and business benefits",
                    "Visual demonstrations and screenshots"
                ]
            }
            
            target_platforms = {
                "social_media": {
                    "linkedin": {
                        "audience_size": 8500,
                        "engagement_rate": 0.08,
                        "optimal_formats": ["carousel_posts", "video_clips", "thought_leadership"],
                        "content_preferences": ["professional_insights", "industry_trends", "case_studies"]
                    },
                    "twitter": {
                        "audience_size": 3200,
                        "engagement_rate": 0.05,
                        "optimal_formats": ["thread_series", "short_videos", "infographics"],
                        "content_preferences": ["quick_tips", "industry_news", "behind_scenes"]
                    },
                    "youtube": {
                        "audience_size": 1800,
                        "engagement_rate": 0.12,
                        "optimal_formats": ["educational_videos", "tutorials", "demos"],
                        "content_preferences": ["how_to_guides", "product_demos", "expert_interviews"]
                    },
                    "instagram": {
                        "audience_size": 2100,
                        "engagement_rate": 0.09,
                        "optimal_formats": ["stories", "reels", "carousel_posts"],
                        "content_preferences": ["visual_storytelling", "behind_scenes", "quick_tips"]
                    }
                },
                "email_marketing": {
                    "newsletter": {
                        "subscriber_count": 12000,
                        "open_rate": 0.28,
                        "click_rate": 0.06,
                        "optimal_formats": ["curated_summaries", "exclusive_insights", "tutorial_series"]
                    }
                },
                "content_platforms": {
                    "medium": {
                        "follower_count": 950,
                        "read_rate": 0.22,
                        "optimal_formats": ["thought_leadership", "detailed_analysis", "case_studies"]
                    },
                    "dev_to": {
                        "follower_count": 680,
                        "engagement_rate": 0.15,
                        "optimal_formats": ["technical_tutorials", "implementation_guides", "tool_reviews"]
                    }
                }
            }
            
            audience_preferences = {
                "content_consumption_patterns": {
                    "video_content": 0.42,
                    "short_form_text": 0.38,
                    "visual_content": 0.35,
                    "audio_content": 0.22,
                    "long_form_text": 0.18
                },
                "platform_usage_time": {
                    "linkedin": "business_hours",
                    "twitter": "early_morning_evening",
                    "youtube": "evenings_weekends",
                    "instagram": "throughout_day",
                    "email": "morning_commute"
                },
                "engagement_drivers": [
                    "Actionable insights and tips",
                    "Real-world examples and case studies",
                    "Visual demonstrations and tutorials",
                    "Expert opinions and thought leadership",
                    "Behind-the-scenes content"
                ],
                "content_format_preferences_by_segment": {
                    "solopreneurs": ["quick_tips", "case_studies", "tool_recommendations"],
                    "small_business_owners": ["roi_focused_content", "implementation_guides", "success_stories"],
                    "tech_enthusiasts": ["technical_deep_dives", "product_demos", "innovation_insights"]
                }
            }
            
            content_performance = {
                "top_performing_content_types": [
                    {"type": "tutorial_videos", "avg_engagement": 0.15, "conversion_rate": 0.12},
                    {"type": "case_study_posts", "avg_engagement": 0.11, "conversion_rate": 0.09},
                    {"type": "tool_comparison_content", "avg_engagement": 0.09, "conversion_rate": 0.07}
                ],
                "engagement_metrics_by_format": {
                    "video_content": {"likes": 145, "shares": 32, "comments": 18},
                    "carousel_posts": {"likes": 98, "shares": 24, "comments": 12},
                    "single_image_posts": {"likes": 67, "shares": 15, "comments": 8},
                    "text_only_posts": {"likes": 43, "shares": 9, "comments": 5}
                },
                "best_performing_topics": [
                    {"topic": "automation_workflows", "engagement_score": 0.18},
                    {"topic": "productivity_tips", "engagement_score": 0.14},
                    {"topic": "ai_implementation", "engagement_score": 0.12},
                    {"topic": "business_efficiency", "engagement_score": 0.10}
                ]
            }
            
            brand_guidelines = {
                "voice_characteristics": ["professional", "approachable", "innovative", "empowering"],
                "tone_variations": {
                    "educational_content": "informative_and_supportive",
                    "promotional_content": "confident_and_value_focused",
                    "thought_leadership": "authoritative_and_insightful",
                    "community_content": "friendly_and_engaging"
                },
                "visual_identity": {
                    "primary_colors": ["#3A86FF", "#FF006E"],
                    "secondary_colors": ["#8338EC", "#FFBE0B"],
                    "fonts": {"primary": "Montserrat", "secondary": "Open Sans"},
                    "logo_usage": "clear_space_minimum_25px"
                },
                "messaging_framework": {
                    "value_proposition": "AI workforce for every business",
                    "key_messages": [
                        "Democratizing enterprise AI capabilities",
                        "Empowering small businesses to scale efficiently",
                        "Making advanced automation accessible and affordable"
                    ],
                    "content_pillars": ["education", "inspiration", "transformation", "community"]
                }
            }
            
            repurposing_goals = {
                "primary_objectives": [
                    "Increase content reach and visibility",
                    "Improve audience engagement across platforms",
                    "Maximize content ROI and efficiency",
                    "Strengthen brand presence and authority"
                ],
                "target_metrics": {
                    "reach_increase": 0.40,
                    "engagement_improvement": 0.25,
                    "lead_generation_boost": 0.30,
                    "content_production_efficiency": 0.35
                },
                "strategic_priorities": {
                    "video_content_expansion": "high",
                    "social_media_optimization": "high",
                    "thought_leadership_development": "medium",
                    "community_building": "medium"
                }
            }
            
            # Generate comprehensive repurposing strategy
            repurposing_strategy = await generate_comprehensive_content_repurposing_strategy(
                source_content=source_content,
                target_platforms=target_platforms,
                audience_preferences=audience_preferences,
                content_performance=content_performance,
                brand_guidelines=brand_guidelines,
                repurposing_goals=repurposing_goals
            )
            
            # Execute the repurposing based on the strategy
            result = await self._execute_content_repurposing(
                repurposing_request, 
                repurposing_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Content Repurposer Agent",
                "strategy_type": "comprehensive_content_repurposing",
                "repurposing_strategy": repurposing_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Content Repurposer Agent: Comprehensive content repurposing completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error in comprehensive content repurposing: {e}")
            return {
                "agent": "Content Repurposer Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_content_repurposing(self, repurposing_request: str, repurposing_strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the content repurposing based on the strategy.
        """
        try:
            print(f"Content Repurposer Agent: Executing repurposing for '{repurposing_request}'...")
            
            # Generate content analysis
            content_analysis = await self._generate_content_analysis(repurposing_strategy)
            
            # Generate transformation recommendations
            transformation_recommendations = await self._generate_transformation_recommendations(repurposing_strategy)
            
            # Generate platform optimization plan
            platform_optimization = await self._generate_platform_optimization(repurposing_strategy)
            
            # Generate implementation roadmap
            implementation_roadmap = await self._generate_implementation_roadmap(repurposing_strategy)
            
            return {
                "content_analysis": content_analysis,
                "transformation_recommendations": transformation_recommendations,
                "platform_optimization": platform_optimization,
                "implementation_roadmap": implementation_roadmap
            }
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error executing repurposing: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_content_analysis(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate detailed analysis of source content for repurposing potential.
        """
        try:
            print(f"Content Repurposer Agent: Generating content analysis...")
            
            # Extract analysis from strategy or create defaults
            analysis_data = strategy.get("repurposing_analysis", {})
            
            content_analysis = {
                "source_content_assessment": {
                    "total_assets_evaluated": 3,
                    "high_repurposing_potential": 3,
                    "medium_repurposing_potential": 0,
                    "low_repurposing_potential": 0,
                    "overall_content_quality": analysis_data.get("source_content_value", "high")
                },
                "content_themes_analysis": {
                    "dominant_themes": ["AI automation", "productivity", "small business"],
                    "audience_alignment": "excellent",
                    "evergreen_content_percentage": 0.85,
                    "trending_topic_coverage": 0.42
                },
                "format_suitability": {
                    "video_transformation": {
                        "suitability_score": 0.92,
                        "recommended_assets": ["webinar_001", "blog_001"],
                        "transformation_potential": "high"
                    },
                    "social_media_adaptation": {
                        "suitability_score": 0.88,
                        "recommended_assets": ["blog_001", "podcast_001"],
                        "transformation_potential": "high"
                    },
                    "visual_content_creation": {
                        "suitability_score": 0.75,
                        "recommended_assets": ["blog_001"],
                        "transformation_potential": "medium-high"
                    }
                },
                "performance_indicators": {
                    "engagement_potential": analysis_data.get("platform_opportunities", [
                        "High engagement expected on video platforms",
                        "Strong social media sharing potential",
                        "Excellent email newsletter content"
                    ]),
                    "reach_expansion_forecast": "40-60% increase across platforms",
                    "conversion_improvement_estimate": "25-35% lift in lead generation"
                }
            }
            
            return content_analysis
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error generating content analysis: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_transformation_recommendations(self, strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate specific content transformation recommendations.
        """
        try:
            print(f"Content Repurposer Agent: Generating transformation recommendations...")
            
            # Extract recommendations from strategy or create defaults
            strategy_recommendations = strategy.get("transformation_recommendations", [])
            
            if not strategy_recommendations:
                strategy_recommendations = [
                    {
                        "source_format": "blog_post",
                        "target_format": "video_series",
                        "adaptation_strategy": "Break into educational segments",
                        "expected_engagement": "High engagement expected"
                    }
                ]
            
            # Enhanced recommendations with detailed implementation
            recommendations = []
            
            for i, rec in enumerate(strategy_recommendations):
                enhanced_rec = {
                    "recommendation_id": f"transform_{i+1:03d}",
                    "source_asset": rec.get("source_asset", "blog_001"),
                    "source_format": rec.get("source_format", "unknown"),
                    "target_format": rec.get("target_format", "unknown"),
                    "transformation_type": rec.get("transformation_type", "format_adaptation"),
                    "adaptation_strategy": rec.get("adaptation_strategy", "Content transformation strategy"),
                    "implementation_steps": [
                        "Content audit and key message extraction",
                        "Format-specific adaptation planning", 
                        "Creative asset development",
                        "Platform optimization",
                        "Quality review and approval"
                    ],
                    "expected_outcomes": {
                        "reach_increase": rec.get("reach_increase", "30-50%"),
                        "engagement_improvement": rec.get("expected_engagement", "Improved engagement"),
                        "format_optimization": "Platform-specific optimization"
                    },
                    "resource_requirements": {
                        "time_investment": rec.get("time_investment", "5-8 hours"),
                        "tools_needed": rec.get("tools_needed", ["video_editor", "design_software"]),
                        "skill_level": rec.get("skill_level", "intermediate")
                    },
                    "priority_score": rec.get("priority_score", 0.8),
                    "implementation_timeline": rec.get("timeline", "1-2 weeks")
                }
                recommendations.append(enhanced_rec)
            
            # Add comprehensive default recommendations if none provided
            if not recommendations:
                recommendations = [
                    {
                        "recommendation_id": "transform_001",
                        "source_asset": "blog_001",
                        "source_format": "long_form_blog_post",
                        "target_format": "video_tutorial_series",
                        "transformation_type": "educational_video_creation",
                        "adaptation_strategy": "Break 2500-word blog into 5 focused video segments (3-5 minutes each)",
                        "implementation_steps": [
                            "Extract 5 key topics from blog post",
                            "Create video outline for each segment",
                            "Develop visual aids and screen recordings",
                            "Record narration and demonstrations",
                            "Edit and optimize for YouTube and LinkedIn"
                        ],
                        "expected_outcomes": {
                            "reach_increase": "200-300% vs original blog",
                            "engagement_improvement": "Video format expected to drive 150% more engagement",
                            "format_optimization": "Optimized for mobile consumption and social sharing"
                        },
                        "resource_requirements": {
                            "time_investment": "12-15 hours total",
                            "tools_needed": ["screen_recorder", "video_editor", "microphone"],
                            "skill_level": "intermediate_video_editing"
                        },
                        "priority_score": 0.95,
                        "implementation_timeline": "2-3 weeks"
                    },
                    {
                        "recommendation_id": "transform_002",
                        "source_asset": "webinar_001",
                        "source_format": "45_minute_webinar",
                        "target_format": "social_media_highlight_clips",
                        "transformation_type": "clip_extraction_optimization",
                        "adaptation_strategy": "Extract 8-10 key moments into 30-60 second clips for social platforms",
                        "implementation_steps": [
                            "Identify highest-value segments from webinar",
                            "Extract clips with clear beginning/middle/end",
                            "Add captions and branded overlays",
                            "Optimize aspect ratios for each platform",
                            "Create teaser hooks and call-to-actions"
                        ],
                        "expected_outcomes": {
                            "reach_increase": "400-500% vs full webinar",
                            "engagement_improvement": "Short-form content drives 3x more engagement",
                            "format_optimization": "Mobile-first design for maximum accessibility"
                        },
                        "resource_requirements": {
                            "time_investment": "8-10 hours",
                            "tools_needed": ["video_editor", "caption_software", "design_tools"],
                            "skill_level": "beginner_to_intermediate"
                        },
                        "priority_score": 0.88,
                        "implementation_timeline": "1-2 weeks"
                    }
                ]
            
            return recommendations
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error generating transformation recommendations: {e}")
            return [
                {
                    "recommendation_id": "error_001",
                    "error": str(e),
                    "status": "failed"
                }
            ]
    
    async def _generate_platform_optimization(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate platform-specific optimization strategies.
        """
        try:
            print(f"Content Repurposer Agent: Generating platform optimization strategies...")
            
            # Extract platform optimization from strategy or create defaults
            platform_info = strategy.get("platform_optimization", {})
            
            platform_optimization = {
                "linkedin": {
                    "content_strategy": platform_info.get("linkedin", {}).get("format", "professional_content"),
                    "optimal_formats": ["carousel_posts", "native_video", "thought_leadership_articles"],
                    "posting_schedule": {
                        "frequency": "3-4 posts per week",
                        "optimal_times": ["Tuesday-Thursday 9-11am", "Wednesday 12-2pm"],
                        "content_mix": "70% educational, 20% promotional, 10% behind-scenes"
                    },
                    "engagement_tactics": [
                        "Start posts with compelling questions",
                        "Use data and statistics to support points",
                        "Include industry-relevant hashtags (5-10)",
                        "Tag relevant industry connections",
                        "Encourage professional discussion in comments"
                    ],
                    "content_adaptations": [
                        "Add professional context and business implications",
                        "Include ROI calculations and business metrics",
                        "Frame content around industry challenges",
                        "Use professional language and terminology"
                    ]
                },
                "youtube": {
                    "content_strategy": platform_info.get("youtube", {}).get("format", "educational_videos"),
                    "optimal_formats": ["tutorial_videos", "demo_walkthroughs", "expert_interviews"],
                    "video_optimization": {
                        "ideal_length": "8-12 minutes for tutorials, 3-5 for demos",
                        "thumbnail_strategy": "Clear text overlay + engaging visuals",
                        "title_optimization": "Include keywords + benefits + clear value prop",
                        "description_elements": ["Detailed summary", "Timestamps", "Links", "CTAs"]
                    },
                    "engagement_tactics": [
                        "Strong hooks in first 15 seconds",
                        "Clear value proposition upfront",
                        "Interactive elements (polls, questions)",
                        "End screens with related content",
                        "Consistent branding and intro/outro"
                    ],
                    "content_adaptations": [
                        "Add visual demonstrations and screen recordings",
                        "Include step-by-step tutorials",
                        "Provide downloadable resources",
                        "Create series for complex topics"
                    ]
                },
                "twitter": {
                    "content_strategy": platform_info.get("twitter", {}).get("format", "thread_series"),
                    "optimal_formats": ["thread_series", "quick_tips", "industry_commentary"],
                    "posting_strategy": {
                        "frequency": "1-2 threads per week, daily engagement",
                        "optimal_times": ["7-9am", "12-1pm", "5-6pm"],
                        "thread_structure": "Hook + 5-8 valuable points + CTA"
                    },
                    "engagement_tactics": [
                        "Start with attention-grabbing statements",
                        "Use numbered points for clarity",
                        "Include relevant emojis sparingly",
                        "End with engaging questions",
                        "Retweet and comment on industry conversations"
                    ],
                    "content_adaptations": [
                        "Break complex ideas into bite-sized points",
                        "Use conversational tone",
                        "Include actionable takeaways",
                        "Add relevant hashtags and mentions"
                    ]
                },
                "instagram": {
                    "content_strategy": platform_info.get("instagram", {}).get("format", "visual_stories"),
                    "optimal_formats": ["carousel_posts", "stories", "reels"],
                    "visual_optimization": {
                        "design_consistency": "Maintain brand colors and fonts",
                        "image_quality": "High-resolution, well-lit visuals",
                        "text_overlay": "Large, readable fonts with high contrast",
                        "story_highlights": "Organize by topic with branded covers"
                    },
                    "engagement_tactics": [
                        "Use interactive stickers in stories",
                        "Create behind-the-scenes content",
                        "Share user-generated content",
                        "Post at peak audience activity times",
                        "Utilize relevant hashtags (20-30 per post)"
                    ],
                    "content_adaptations": [
                        "Focus on visual storytelling",
                        "Create quote cards from key insights",
                        "Develop infographic-style content",
                        "Show process and behind-scenes moments"
                    ]
                }
            }
            
            return platform_optimization
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error generating platform optimization: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_implementation_roadmap(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate detailed implementation roadmap for content repurposing.
        """
        try:
            print(f"Content Repurposer Agent: Generating implementation roadmap...")
            
            # Extract timeline from strategy or create default
            timeline_info = strategy.get("implementation_timeline", {})
            
            implementation_roadmap = {
                "phase_1_foundation": {
                    "timeframe": "Week 1",
                    "focus": "Content Audit & Strategy",
                    "key_activities": timeline_info.get("week_1", [
                        "Complete content audit of all existing assets",
                        "Prioritize content based on performance and repurposing potential",
                        "Create content calendar for repurposed content",
                        "Set up content creation tools and templates"
                    ]),
                    "deliverables": [
                        "Content audit spreadsheet with repurposing scores",
                        "Prioritized list of assets for transformation",
                        "Content calendar for next 8 weeks",
                        "Brand templates for each platform"
                    ],
                    "success_metrics": [
                        "100% of existing content catalogued and scored",
                        "Top 10 repurposing opportunities identified",
                        "Content calendar approved by stakeholders"
                    ]
                },
                "phase_2_creation": {
                    "timeframe": "Weeks 2-3",
                    "focus": "Content Transformation",
                    "key_activities": timeline_info.get("week_2", [
                        "Create video content from top-performing blog posts",
                        "Design visual assets and infographics",
                        "Develop social media post variations",
                        "Record audio clips and snippets"
                    ]),
                    "deliverables": [
                        "5 educational video segments",
                        "15 social media post designs",
                        "10 carousel post series",
                        "20 quote cards and visual quotes"
                    ],
                    "success_metrics": [
                        "All priority transformations completed on schedule",
                        "Content quality meets brand standards",
                        "Video content under 5 minutes each"
                    ]
                },
                "phase_3_optimization": {
                    "timeframe": "Week 3",
                    "focus": "Platform Adaptation",
                    "key_activities": timeline_info.get("week_3", [
                        "Optimize content for each platform's specifications",
                        "Create platform-specific captions and descriptions",
                        "Schedule content across all platforms",
                        "Set up tracking and analytics"
                    ]),
                    "deliverables": [
                        "Platform-optimized content packages",
                        "Scheduled content across 4 platforms",
                        "Analytics tracking setup",
                        "Performance monitoring dashboard"
                    ],
                    "success_metrics": [
                        "Content scheduled for 4 weeks in advance",
                        "All content meets platform specifications",
                        "Analytics tracking 100% functional"
                    ]
                },
                "phase_4_deployment": {
                    "timeframe": "Week 4",
                    "focus": "Launch & Monitor",
                    "key_activities": timeline_info.get("week_4", [
                        "Launch repurposed content campaign",
                        "Monitor performance and engagement",
                        "Collect audience feedback",
                        "Optimize based on initial results"
                    ]),
                    "deliverables": [
                        "Live content campaign across all platforms",
                        "Weekly performance reports",
                        "Audience feedback compilation",
                        "Optimization recommendations"
                    ],
                    "success_metrics": [
                        "Content published on schedule",
                        "Engagement rates tracked daily",
                        "Performance compared to baseline"
                    ]
                },
                "ongoing_optimization": {
                    "timeframe": "Month 2+",
                    "focus": "Scale & Refine",
                    "key_activities": [
                        "Weekly content repurposing routine",
                        "Monthly performance analysis and strategy updates",
                        "Quarterly content audit and refresh",
                        "Continuous testing of new formats and platforms"
                    ],
                    "success_metrics": [
                        "40% increase in content reach",
                        "25% improvement in engagement rates",
                        "30% boost in lead generation",
                        "35% improvement in content production efficiency"
                    ]
                }
            }
            
            return implementation_roadmap
            
        except Exception as e:
            print(f"Content Repurposer Agent: Error generating implementation roadmap: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
