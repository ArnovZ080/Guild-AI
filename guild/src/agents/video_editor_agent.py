"""
Video Editor Agent for Guild-AI
Comprehensive video production and editing using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from pathlib import Path
import tempfile
import json
import numpy as np
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio

# Conditional imports for MoviePy
try:
    from moviepy.editor import (
        VideoFileClip, ImageClip, AudioFileClip, TextClip, CompositeVideoClip,
        concatenate_videoclips, concatenate_audioclips, ColorClip
    )
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    print("Warning: MoviePy not available. Install with: pip install moviepy")

logger = logging.getLogger(__name__)

@inject_knowledge
async def generate_comprehensive_video_production_strategy(
    video_request: Dict[str, Any],
    production_type: str,
    target_platform: str,
    content_requirements: Dict[str, Any],
    brand_guidelines: Dict[str, Any],
    technical_specifications: Dict[str, Any],
    audience_profile: Dict[str, Any],
    creative_direction: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates comprehensive video production strategy using advanced prompting strategies.
    Implements the full Video Editor Agent specification from AGENT_PROMPTS.md.
    """
    print("Video Editor Agent: Generating comprehensive video production strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Video Editor Agent - Comprehensive Video Production & Editing

## Role Definition
You are the **Video Production Agent**, a skilled video editor and content creator. Your role is to create short-form videos for social media, marketing, and other business needs by combining images, video clips, and audio. You excel at producing high-quality, engaging video content that aligns with brand guidelines and platform requirements.

## Core Expertise
- Video Creation & Editing
- Social Media Video Production
- Marketing Video Development
- Audio-Visual Synchronization
- Brand-Consistent Content Creation
- Platform-Specific Optimization
- Creative Visual Storytelling

## Context & Background Information
**Video Request:** {json.dumps(video_request, indent=2)}
**Production Type:** {production_type}
**Target Platform:** {target_platform}
**Content Requirements:** {json.dumps(content_requirements, indent=2)}
**Brand Guidelines:** {json.dumps(brand_guidelines, indent=2)}
**Technical Specifications:** {json.dumps(technical_specifications, indent=2)}
**Audience Profile:** {json.dumps(audience_profile, indent=2)}
**Creative Direction:** {json.dumps(creative_direction or {}, indent=2)}

## Task Breakdown & Steps
1. **Content Analysis:** Analyze video requirements and extract key elements
2. **Platform Optimization:** Optimize video for target platform specifications
3. **Asset Compilation:** Gather and organize required media assets
4. **Video Assembly:** Combine assets into cohesive video content
5. **Brand Integration:** Ensure brand consistency throughout
6. **Quality Assurance:** Implement quality checks and validation
7. **Output Optimization:** Optimize for delivery and performance

## Constraints & Rules
- Video style must align with brand guidelines
- Platform optimization is required for target platform
- Content must be engaging and professional
- Technical specifications must be precisely followed
- Brand consistency must be maintained throughout
- Quality standards must meet professional requirements
- Accessibility considerations must be included

## Output Format
Return a comprehensive JSON object with the following structure:

```json
{{
  "video_production_analysis": {{
    "production_type": "{production_type}",
    "target_platform": "{target_platform}",
    "content_purpose": "marketing",
    "video_quality_score": 9.0,
    "brand_alignment": "excellent",
    "platform_optimization": "optimized",
    "production_complexity": "medium",
    "estimated_production_time": "15-20 minutes",
    "resource_requirements": "moderate"
  }},
  "creative_strategy": {{
    "visual_style": {{
      "style_type": "modern_professional",
      "color_palette": ["#2C3E50", "#3498DB", "#FFFFFF"],
      "typography": "Arial-Bold",
      "visual_elements": ["clean_graphics", "subtle_animations", "professional_transitions"],
      "brand_consistency": "high"
    }},
    "content_structure": {{
      "opening_hook": "attention_grabbing_visual",
      "main_content_flow": "logical_progression",
      "call_to_action": "clear_and_compelling",
      "closing_impact": "memorable_brand_moment"
    }},
    "engagement_factors": {{
      "visual_interest": "high",
      "pacing": "dynamic_but_clear",
      "emotional_connection": "professional_yet_approachable",
      "retention_elements": ["visual_variety", "clear_messaging", "strong_branding"]
    }}
  }},
  "technical_production": {{
    "video_specifications": {{
      "resolution": "1920x1080",
      "aspect_ratio": "16:9",
      "frame_rate": 30,
      "bitrate": "high_quality",
      "format": "MP4",
      "codec": "H.264"
    }},
    "audio_specifications": {{
      "sample_rate": 44100,
      "bit_depth": 16,
      "channels": 2,
      "audio_codec": "AAC",
      "volume_level": "normalized"
    }},
    "production_pipeline": [
      "Asset collection and validation",
      "Video composition and editing",
      "Audio synchronization",
      "Brand element integration",
      "Quality review and optimization",
      "Platform-specific formatting",
      "Final export and delivery"
    ]
  }},
  "platform_optimization": {{
    "platform_requirements": {{
      "instagram": {{
        "aspect_ratio": "1:1",
        "max_duration": 60,
        "resolution": "1080x1080",
        "file_size_limit": "100MB"
      }},
      "tiktok": {{
        "aspect_ratio": "9:16",
        "max_duration": 180,
        "resolution": "1080x1920",
        "file_size_limit": "287MB"
      }},
      "youtube": {{
        "aspect_ratio": "16:9",
        "max_duration": "unlimited",
        "resolution": "1920x1080",
        "file_size_limit": "256GB"
      }},
      "linkedin": {{
        "aspect_ratio": "16:9",
        "max_duration": 600,
        "resolution": "1280x720",
        "file_size_limit": "5GB"
      }}
    }},
    "optimization_strategy": {{
      "format_adaptation": "platform_specific",
      "quality_optimization": "balanced",
      "loading_optimization": "compressed",
      "mobile_optimization": "responsive"
    }}
  }},
  "asset_management": {{
    "required_assets": [
      "Background images or video clips",
      "Audio track or voiceover",
      "Text overlays and graphics",
      "Brand elements and logos",
      "Transition effects"
    ],
    "asset_organization": {{
      "folder_structure": "organized_by_type",
      "naming_convention": "descriptive_and_consistent",
      "version_control": "maintained",
      "backup_strategy": "redundant"
    }},
    "asset_quality_standards": {{
      "image_resolution": "minimum_1920x1080",
      "audio_quality": "professional_grade",
      "brand_consistency": "strict_adherence",
      "copyright_compliance": "verified"
    }}
  }},
  "brand_integration": {{
    "visual_branding": {{
      "logo_placement": "strategic_and_visible",
      "color_consistency": "brand_palette_only",
      "typography": "brand_fonts",
      "visual_style": "brand_guidelines_compliant"
    }},
    "messaging_alignment": {{
      "tone_of_voice": "brand_consistent",
      "key_messages": "clearly_communicated",
      "call_to_action": "brand_aligned",
      "value_proposition": "prominently_featured"
    }},
    "brand_consistency_checklist": [
      "Logo visibility and placement",
      "Color palette adherence",
      "Typography consistency",
      "Messaging alignment",
      "Visual style compliance"
    ]
  }},
  "quality_assurance": {{
    "technical_quality": {{
      "video_quality": "high_definition",
      "audio_quality": "clear_and_balanced",
      "synchronization": "perfect_audio_video_sync",
      "export_quality": "optimized_for_platform"
    }},
    "content_quality": {{
      "message_clarity": "clear_and_compelling",
      "visual_appeal": "engaging_and_professional",
      "brand_alignment": "consistent_throughout",
      "engagement_potential": "high"
    }},
    "platform_compliance": {{
      "specification_adherence": "fully_compliant",
      "file_format": "correct",
      "size_requirements": "within_limits",
      "quality_standards": "exceeds_minimum"
    }}
  }},
  "alternative_approaches": [
    {{
      "approach": "Minimalist style",
      "rationale": "Clean and focused messaging",
      "visual_characteristics": {{
        "style": "minimalist",
        "color_palette": ["#FFFFFF", "#000000", "#CCCCCC"],
        "typography": "simple_and_clean"
      }},
      "technical_settings": {{
        "transitions": "subtle",
        "effects": "minimal",
        "pacing": "deliberate"
      }}
    }},
    {{
      "approach": "Dynamic and energetic",
      "rationale": "High engagement and excitement",
      "visual_characteristics": {{
        "style": "dynamic",
        "color_palette": ["#E74C3C", "#F39C12", "#FFFFFF"],
        "typography": "bold_and_energetic"
      }},
      "technical_settings": {{
        "transitions": "fast_and_dynamic",
        "effects": "energetic",
        "pacing": "fast"
      }}
    }}
  ],
  "performance_optimization": {{
    "rendering_efficiency": {{
      "hardware_utilization": "optimized",
      "memory_management": "efficient",
      "processing_speed": "accelerated",
      "export_optimization": "platform_specific"
    }},
    "quality_optimization": {{
      "compression_strategy": "balanced",
      "quality_preservation": "maximum",
      "file_size_optimization": "efficient",
      "loading_performance": "optimized"
    }},
    "scalability_considerations": {{
      "batch_processing": "supported",
      "template_reusability": "high",
      "automation_potential": "moderate",
      "resource_scaling": "flexible"
    }}
  }},
  "accessibility_considerations": {{
    "inclusive_features": [
      "Clear visual contrast",
      "Readable typography",
      "Audio descriptions available",
      "Captions and subtitles"
    ],
    "accessibility_compliance": {{
      "wcag_2_1_aa": "compliant",
      "section_508": "compliant",
      "visual_accessibility": "optimized",
      "audio_accessibility": "clear"
    }},
    "inclusive_design": {{
      "color_contrast": "sufficient",
      "text_readability": "high",
      "visual_clarity": "excellent",
      "audio_clarity": "professional"
    }}
  }},
  "delivery_and_distribution": {{
    "output_formats": [
      "Platform-specific optimized versions",
      "High-quality master file",
      "Compressed versions for web",
      "Mobile-optimized versions"
    ],
    "distribution_strategy": {{
      "primary_platform": "{target_platform}",
      "secondary_platforms": ["web", "mobile"],
      "file_naming": "descriptive_and_organized",
      "metadata_inclusion": "comprehensive"
    }},
    "performance_monitoring": {{
      "engagement_tracking": "enabled",
      "quality_metrics": "monitored",
      "delivery_success": "tracked",
      "user_feedback": "collected"
    }}
  }},
  "follow_up_recommendations": [
    "Create platform-specific variations",
    "Develop A/B testing versions",
    "Create template for future videos",
    "Implement performance tracking"
  ]
}}
```

## Evaluation Criteria
- Video quality meets professional standards
- Brand guidelines are consistently applied
- Platform optimization is correctly implemented
- Content is engaging and effective
- Technical specifications are precisely followed
- Accessibility requirements are met
- Production efficiency is optimized

Generate the comprehensive video production strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            video_production_strategy = json.loads(response)
            print("Video Editor Agent: Successfully generated comprehensive video production strategy.")
            return video_production_strategy
        except json.JSONDecodeError as e:
            print(f"Video Editor Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "video_production_analysis": {
                    "production_type": production_type,
                    "target_platform": target_platform,
                    "content_purpose": "general",
                    "video_quality_score": 8.5,
                    "brand_alignment": "good",
                    "platform_optimization": "optimized",
                    "production_complexity": "medium",
                    "estimated_production_time": "15-20 minutes",
                    "resource_requirements": "moderate"
                },
                "creative_strategy": {
                    "visual_style": {
                        "style_type": "professional",
                        "color_palette": ["#2C3E50", "#3498DB", "#FFFFFF"],
                        "typography": "Arial-Bold",
                        "brand_consistency": "high"
                    },
                    "content_structure": {
                        "opening_hook": "attention_grabbing",
                        "main_content_flow": "logical",
                        "call_to_action": "clear",
                        "closing_impact": "memorable"
                    }
                },
                "technical_production": {
                    "video_specifications": {
                        "resolution": "1920x1080",
                        "aspect_ratio": "16:9",
                        "frame_rate": 30,
                        "format": "MP4"
                    },
                    "audio_specifications": {
                        "sample_rate": 44100,
                        "bit_depth": 16,
                        "channels": 2
                    }
                },
                "platform_optimization": {
                    "platform_requirements": {
                        target_platform: {
                            "aspect_ratio": "16:9",
                            "resolution": "1920x1080"
                        }
                    }
                },
                "quality_assurance": {
                    "technical_quality": {
                        "video_quality": "high_definition",
                        "audio_quality": "clear_and_balanced"
                    },
                    "content_quality": {
                        "message_clarity": "clear",
                        "visual_appeal": "professional"
                    }
                },
                "alternative_approaches": [],
                "accessibility_considerations": {
                    "inclusive_features": ["Clear visual contrast", "Readable typography"]
                },
                "follow_up_recommendations": ["Create variations", "Monitor performance"]
            }
    except Exception as e:
        print(f"Video Editor Agent: Failed to generate video production strategy. Error: {e}")
        # Return minimal fallback
        return {
            "video_production_analysis": {
                "production_type": production_type,
                "target_platform": target_platform,
                "content_purpose": "general",
                "video_quality_score": 7.5,
                "brand_alignment": "basic",
                "platform_optimization": "basic",
                "production_complexity": "low",
                "estimated_production_time": "10-15 minutes",
                "resource_requirements": "low"
            },
            "error": str(e)
        }

class VideoEditorAgent:
    """
    Comprehensive Video Editor Agent implementing advanced prompting strategies.
    Provides expert video production, editing, and content creation capabilities.
    """
    
    def __init__(self, user_input=None):
        """
        Initialize the video editor agent.
        """
        if not MOVIEPY_AVAILABLE:
            raise ImportError("MoviePy is required for video editing. Install with: pip install moviepy")
        
        self.user_input = user_input
        self.agent_name = "Video Editor Agent"
        self.capabilities = [
            "Video creation and editing",
            "Social media video production",
            "Marketing video development",
            "Audio-visual synchronization",
            "Brand-consistent content creation",
            "Platform-specific optimization",
            "Creative visual storytelling"
        ]
        
        logger.info("Video Editor Agent initialized")
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Video Editor Agent.
        Implements comprehensive video production using advanced prompting strategies.
        """
        try:
            print(f"Video Editor Agent: Starting comprehensive video production...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                # Parse user input for video production requirements
                video_request = {
                    "content": user_input,
                    "production_type": "social_media_video",
                    "target_platform": "instagram",
                    "style": "modern"
                }
            else:
                video_request = {
                    "content": "Welcome to Guild-AI - Your AI Workforce Platform",
                    "production_type": "social_media_video",
                    "target_platform": "instagram",
                    "style": "modern"
                }
            
            # Define comprehensive production parameters
            production_type = video_request.get("production_type", "social_media_video")
            target_platform = video_request.get("target_platform", "instagram")
            content_requirements = {
                "content_type": "marketing",
                "duration": 15.0,
                "style": video_request.get("style", "modern"),
                "message": video_request.get("content", ""),
                "call_to_action": "Learn more about Guild-AI"
            }
            
            brand_guidelines = {
                "brand_colors": ["#2C3E50", "#3498DB", "#FFFFFF"],
                "typography": "Arial-Bold",
                "visual_style": "professional_modern",
                "tone": "professional_yet_approachable"
            }
            
            technical_specifications = {
                "video_format": "MP4",
                "codec": "H.264",
                "audio_codec": "AAC",
                "quality": "high_definition"
            }
            
            audience_profile = {
                "demographics": "solopreneurs and lean teams",
                "platform_preference": target_platform,
                "content_consumption": "mobile_first",
                "engagement_style": "visual_and_concise"
            }
            
            creative_direction = {
                "visual_approach": "clean_and_professional",
                "pacing": "dynamic_but_clear",
                "engagement_strategy": "attention_grabbing_opening"
            }
            
            # Generate comprehensive video production strategy
            video_production_strategy = await generate_comprehensive_video_production_strategy(
                video_request=video_request,
                production_type=production_type,
                target_platform=target_platform,
                content_requirements=content_requirements,
                brand_guidelines=brand_guidelines,
                technical_specifications=technical_specifications,
                audience_profile=audience_profile,
                creative_direction=creative_direction
            )
            
            # Execute the video production based on the strategy
            if production_type == "social_media_video":
                result = await self._execute_social_media_video_production(video_request, video_production_strategy)
            elif production_type == "slideshow_video":
                result = await self._execute_slideshow_video_production(video_request, video_production_strategy)
            elif production_type == "marketing_video":
                result = await self._execute_marketing_video_production(video_request, video_production_strategy)
            else:
                result = {
                    "status": "error",
                    "message": f"Unsupported production type: {production_type}"
                }
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Video Editor Agent",
                "production_type": production_type,
                "target_platform": target_platform,
                "video_production_strategy": video_production_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Video Editor Agent: Comprehensive video production completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Video Editor Agent: Error in comprehensive video production: {e}")
            return {
                "agent": "Video Editor Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_social_media_video_production(self, video_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute social media video production based on comprehensive strategy."""
        try:
            content = video_request.get("content", "")
            platform = video_request.get("target_platform", "instagram")
            style = video_request.get("style", "modern")
            
            creative_strategy = strategy.get("creative_strategy", {})
            technical_production = strategy.get("technical_production", {})
            platform_optimization = strategy.get("platform_optimization", {})
            
            # Use existing create_social_media_video method
            result = self.create_social_media_video(
                content=content,
                platform=platform,
                style=style,
                duration=15.0
            )
            
            if result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Social media video production completed successfully",
                    "output_file": result["video_path"],
                    "platform_optimization": platform_optimization.get("platform_requirements", {}).get(platform, {}),
                    "creative_strategy": creative_strategy,
                    "technical_specifications": technical_production.get("video_specifications", {}),
                    "production_details": {
                        "platform": platform,
                        "style": style,
                        "duration": result["duration"],
                        "resolution": result["resolution"],
                        "fps": result["fps"]
                    }
                }
            else:
                return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Social media video production failed: {str(e)}"
            }
    
    async def _execute_slideshow_video_production(self, video_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute slideshow video production based on comprehensive strategy."""
        try:
            # Extract slideshow parameters
            image_paths = video_request.get("image_paths", [])
            audio_path = video_request.get("audio_path")
            duration_per_image = video_request.get("duration_per_image", 3.0)
            
            technical_production = strategy.get("technical_production", {})
            video_specs = technical_production.get("video_specifications", {})
            
            # Determine output resolution from strategy
            resolution_str = video_specs.get("resolution", "1920x1080")
            if "x" in resolution_str:
                width, height = map(int, resolution_str.split("x"))
                output_resolution = (width, height)
            else:
                output_resolution = (1920, 1080)
            
            # Use existing create_slideshow_video method
            result = self.create_slideshow_video(
                image_paths=image_paths,
                audio_path=audio_path,
                duration_per_image=duration_per_image,
                transition_duration=0.5,
                output_resolution=output_resolution
            )
            
            if result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Slideshow video production completed successfully",
                    "output_file": result["video_path"],
                    "technical_specifications": video_specs,
                    "production_details": {
                        "duration": result["duration"],
                        "resolution": result["resolution"],
                        "images_used": result["images_used"],
                        "has_audio": result["has_audio"]
                    }
                }
            else:
                return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Slideshow video production failed: {str(e)}"
            }
    
    async def _execute_marketing_video_production(self, video_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute marketing video production based on comprehensive strategy."""
        try:
            # For marketing videos, we'll create a comprehensive video with text overlay
            content = video_request.get("content", "")
            video_path = video_request.get("video_path")
            
            creative_strategy = strategy.get("creative_strategy", {})
            brand_integration = strategy.get("brand_integration", {})
            
            if video_path and Path(video_path).exists():
                # Add text overlay to existing video
                result = self.add_text_overlay(
                    video_path=video_path,
                    text=content,
                    position="bottom",
                    font_size=50,
                    font_color="white"
                )
            else:
                # Create new social media video as marketing content
                result = self.create_social_media_video(
                    content=content,
                    platform="youtube",  # Marketing videos typically for YouTube
                    style="professional",
                    duration=30.0
                )
            
            if result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Marketing video production completed successfully",
                    "output_file": result["video_path"],
                    "creative_strategy": creative_strategy,
                    "brand_integration": brand_integration,
                    "production_details": {
                        "content": content,
                        "video_type": "marketing",
                        "brand_alignment": "high"
                    }
                }
            else:
                return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Marketing video production failed: {str(e)}"
            }
    
    def create_slideshow_video(self, 
                             image_paths: List[str],
                             audio_path: Optional[str] = None,
                             duration_per_image: float = 3.0,
                             transition_duration: float = 0.5,
                             output_resolution: Tuple[int, int] = (1920, 1080)) -> Dict[str, Any]:
        """
        Create a slideshow video from images.
        
        Args:
            image_paths: List of paths to images
            audio_path: Optional background audio file
            duration_per_image: Duration to show each image
            transition_duration: Duration of transitions between images
            output_resolution: Output video resolution (width, height)
            
        Returns:
            Dictionary with video creation results
        """
        try:
            logger.info(f"Creating slideshow video with {len(image_paths)} images")
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_slideshow_")
            output_path = Path(temp_dir) / "slideshow_video.mp4"
            
            # Create image clips
            image_clips = []
            for i, image_path in enumerate(image_paths):
                if not Path(image_path).exists():
                    logger.warning(f"Image not found: {image_path}")
                    continue
                
                try:
                    clip = ImageClip(image_path, duration=duration_per_image)
                    # Resize to output resolution
                    clip = clip.resize(output_resolution)
                    image_clips.append(clip)
                except Exception as e:
                    logger.warning(f"Error loading image {image_path}: {e}")
                    continue
            
            if not image_clips:
                raise ValueError("No valid images found")
            
            # Add transitions between clips
            final_clips = []
            for i, clip in enumerate(image_clips):
                if i > 0 and transition_duration > 0:
                    # Add crossfade transition
                    clip = clip.crossfadein(transition_duration)
                
                final_clips.append(clip)
            
            # Concatenate video clips
            video = concatenate_videoclips(final_clips, method="compose")
            
            # Add audio if provided
            if audio_path and Path(audio_path).exists():
                try:
                    audio = AudioFileClip(audio_path)
                    # Adjust audio duration to match video
                    if audio.duration > video.duration:
                        audio = audio.subclip(0, video.duration)
                    elif audio.duration < video.duration:
                        # Loop audio if it's shorter
                        loops_needed = int(video.duration / audio.duration) + 1
                        audio = concatenate_audioclips([audio] * loops_needed).subclip(0, video.duration)
                    
                    video = video.set_audio(audio)
                except Exception as e:
                    logger.warning(f"Error adding audio: {e}")
            
            # Write video file
            video.write_videofile(
                str(output_path),
                fps=24,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            if audio_path and Path(audio_path).exists():
                audio.close()
            
            logger.info(f"Slideshow video created: {output_path}")
            
            return {
                'status': 'success',
                'video_path': str(output_path),
                'duration': video.duration,
                'resolution': output_resolution,
                'images_used': len(image_clips),
                'has_audio': audio_path is not None
            }
            
        except Exception as e:
            logger.error(f"Error creating slideshow video: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'image_paths': image_paths
            }
    
    def create_social_media_video(self, 
                                content: str,
                                platform: str = "instagram",
                                style: str = "modern",
                                duration: float = 15.0) -> Dict[str, Any]:
        """
        Create a social media video with text overlay.
        
        Args:
            content: Text content to display
            platform: Social media platform (instagram, tiktok, youtube, linkedin)
            style: Visual style (modern, minimalist, colorful, professional)
            duration: Video duration in seconds
            
        Returns:
            Dictionary with video creation results
        """
        try:
            logger.info(f"Creating {platform} video with {style} style")
            
            # Platform-specific settings
            platform_settings = {
                'instagram': {'size': (1080, 1080), 'fps': 30},
                'tiktok': {'size': (1080, 1920), 'fps': 30},
                'youtube': {'size': (1920, 1080), 'fps': 30},
                'linkedin': {'size': (1280, 720), 'fps': 24}
            }
            
            settings = platform_settings.get(platform, platform_settings['instagram'])
            size = settings['size']
            fps = settings['fps']
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_social_")
            output_path = Path(temp_dir) / f"{platform}_video.mp4"
            
            # Create background
            background = self._create_background(size, style, duration)
            
            # Create text clips
            text_clips = self._create_text_clips(content, size, style, duration)
            
            # Combine background and text
            video = CompositeVideoClip([background] + text_clips)
            
            # Write video file
            video.write_videofile(
                str(output_path),
                fps=fps,
                codec='libx264',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            background.close()
            for clip in text_clips:
                clip.close()
            
            logger.info(f"Social media video created: {output_path}")
            
            return {
                'status': 'success',
                'video_path': str(output_path),
                'platform': platform,
                'style': style,
                'duration': duration,
                'resolution': size,
                'fps': fps
            }
            
        except Exception as e:
            logger.error(f"Error creating social media video: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'platform': platform,
                'content': content
            }
    
    def add_text_overlay(self, 
                        video_path: str,
                        text: str,
                        position: str = "bottom",
                        font_size: int = 50,
                        font_color: str = "white",
                        background_color: Optional[str] = None) -> Dict[str, Any]:
        """
        Add text overlay to an existing video.
        
        Args:
            video_path: Path to input video
            text: Text to overlay
            position: Text position (top, center, bottom, custom)
            font_size: Font size
            font_color: Text color
            background_color: Optional background color for text
            
        Returns:
            Dictionary with results
        """
        try:
            logger.info(f"Adding text overlay to video: {video_path}")
            
            # Load video
            video = VideoFileClip(video_path)
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_overlay_")
            output_path = Path(temp_dir) / "video_with_text.mp4"
            
            # Create text clip
            text_clip = TextClip(
                text,
                fontsize=font_size,
                color=font_color,
                font='Arial-Bold'
            ).set_duration(video.duration)
            
            # Position text
            text_clip = self._position_text_clip(text_clip, position, video.size)
            
            # Add background if specified
            if background_color:
                text_clip = text_clip.on_color(
                    size=(text_clip.w + 20, text_clip.h + 10),
                    color=background_color,
                    pos='center'
                )
            
            # Composite video with text
            final_video = CompositeVideoClip([video, text_clip])
            
            # Write video file
            final_video.write_videofile(
                str(output_path),
                fps=video.fps,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            text_clip.close()
            final_video.close()
            
            logger.info(f"Video with text overlay created: {output_path}")
            
            return {
                'status': 'success',
                'video_path': str(output_path),
                'original_video': video_path,
                'text': text,
                'position': position
            }
            
        except Exception as e:
            logger.error(f"Error adding text overlay: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'video_path': video_path
            }
    
    def create_video_from_images_and_audio(self, 
                                         image_paths: List[str],
                                         audio_path: str,
                                         image_duration: float = 2.0,
                                         fade_duration: float = 0.5) -> Dict[str, Any]:
        """
        Create a video from images with synchronized audio.
        
        Args:
            image_paths: List of image file paths
            audio_path: Audio file path
            image_duration: Duration to show each image
            fade_duration: Fade duration between images
            
        Returns:
            Dictionary with video creation results
        """
        try:
            logger.info(f"Creating video from {len(image_paths)} images with audio")
            
            # Load audio
            audio = AudioFileClip(audio_path)
            total_duration = audio.duration
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_audio_video_")
            output_path = Path(temp_dir) / "video_with_audio.mp4"
            
            # Calculate how many images we need
            images_needed = int(total_duration / image_duration) + 1
            
            # Create image clips
            image_clips = []
            for i in range(images_needed):
                image_path = image_paths[i % len(image_paths)]
                if not Path(image_path).exists():
                    continue
                
                clip = ImageClip(image_path, duration=image_duration)
                # Resize to standard resolution
                clip = clip.resize((1920, 1080))
                
                # Add fade effects
                if fade_duration > 0:
                    clip = clip.fadein(fade_duration).fadeout(fade_duration)
                
                image_clips.append(clip)
            
            # Concatenate clips
            video = concatenate_videoclips(image_clips, method="compose")
            
            # Set audio
            video = video.set_audio(audio)
            
            # Write video file
            video.write_videofile(
                str(output_path),
                fps=24,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            audio.close()
            
            logger.info(f"Video with audio created: {output_path}")
            
            return {
                'status': 'success',
                'video_path': str(output_path),
                'duration': total_duration,
                'images_used': len(image_clips),
                'audio_path': audio_path
            }
            
        except Exception as e:
            logger.error(f"Error creating video with audio: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'image_paths': image_paths,
                'audio_path': audio_path
            }
    
    def trim_video(self, 
                  video_path: str,
                  start_time: float,
                  end_time: float,
                  output_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Trim a video to specified time range.
        
        Args:
            video_path: Path to input video
            start_time: Start time in seconds
            end_time: End time in seconds
            output_name: Optional output filename
            
        Returns:
            Dictionary with results
        """
        try:
            logger.info(f"Trimming video from {start_time}s to {end_time}s")
            
            # Load video
            video = VideoFileClip(video_path)
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_trim_")
            if output_name:
                output_path = Path(temp_dir) / output_name
            else:
                output_path = Path(temp_dir) / "trimmed_video.mp4"
            
            # Trim video
            trimmed_video = video.subclip(start_time, end_time)
            
            # Write video file
            trimmed_video.write_videofile(
                str(output_path),
                fps=video.fps,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            trimmed_video.close()
            
            logger.info(f"Video trimmed: {output_path}")
            
            return {
                'status': 'success',
                'video_path': str(output_path),
                'original_video': video_path,
                'start_time': start_time,
                'end_time': end_time,
                'duration': end_time - start_time
            }
            
        except Exception as e:
            logger.error(f"Error trimming video: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'video_path': video_path
            }
    
    def _create_background(self, size: Tuple[int, int], style: str, duration: float):
        """Create a background clip based on style."""
        # Style-specific colors
        style_colors = {
            'modern': '#2C3E50',
            'minimalist': '#FFFFFF',
            'colorful': '#E74C3C',
            'professional': '#34495E'
        }
        
        color = style_colors.get(style, '#2C3E50')
        return ColorClip(size=size, color=color, duration=duration)
    
    def _create_text_clips(self, content: str, size: Tuple[int, int], style: str, duration: float) -> List:
        """Create text clips for the video."""
        text_clips = []
        
        # Split content into lines
        lines = content.split('\n')
        
        # Style-specific settings
        style_settings = {
            'modern': {'fontsize': 60, 'color': 'white', 'font': 'Arial-Bold'},
            'minimalist': {'fontsize': 50, 'color': 'black', 'font': 'Arial'},
            'colorful': {'fontsize': 55, 'color': 'yellow', 'font': 'Arial-Bold'},
            'professional': {'fontsize': 50, 'color': 'white', 'font': 'Arial-Bold'}
        }
        
        settings = style_settings.get(style, style_settings['modern'])
        
        # Create text clips for each line
        for i, line in enumerate(lines):
            if line.strip():
                text_clip = TextClip(
                    line,
                    fontsize=settings['fontsize'],
                    color=settings['color'],
                    font=settings['font']
                ).set_duration(duration)
                
                # Position text
                y_position = size[1] // 2 - (len(lines) * settings['fontsize']) // 2 + (i * settings['fontsize'])
                text_clip = text_clip.set_position(('center', y_position))
                
                text_clips.append(text_clip)
        
        return text_clips
    
    def _position_text_clip(self, text_clip, position: str, video_size: Tuple[int, int]):
        """Position text clip based on position string."""
        width, height = video_size
        
        if position == "top":
            return text_clip.set_position(('center', height * 0.1))
        elif position == "center":
            return text_clip.set_position('center')
        elif position == "bottom":
            return text_clip.set_position(('center', height * 0.8))
        else:
            return text_clip.set_position('center')
    
    def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """Get information about a video file."""
        try:
            video = VideoFileClip(video_path)
            
            info = {
                'duration': video.duration,
                'fps': video.fps,
                'size': video.size,
                'has_audio': video.audio is not None,
                'file_size': Path(video_path).stat().st_size
            }
            
            if video.audio:
                info['audio_fps'] = video.audio.fps
            
            video.close()
            
            return {
                'status': 'success',
                'video_info': info
            }
            
        except Exception as e:
            logger.error(f"Error getting video info: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def batch_process_videos(self, 
                           video_paths: List[str],
                           operation: str,
                           **kwargs) -> List[Dict[str, Any]]:
        """
        Process multiple videos with the same operation.
        
        Args:
            video_paths: List of video file paths
            operation: Operation to perform (trim, add_text, etc.)
            **kwargs: Additional parameters for the operation
            
        Returns:
            List of results for each video
        """
        results = []
        
        for i, video_path in enumerate(video_paths):
            try:
                logger.info(f"Processing video {i+1}/{len(video_paths)}: {video_path}")
                
                if operation == "trim":
                    result = self.trim_video(video_path, **kwargs)
                elif operation == "add_text":
                    result = self.add_text_overlay(video_path, **kwargs)
                else:
                    result = {
                        'status': 'error',
                        'error': f"Unknown operation: {operation}"
                    }
                
                result['batch_index'] = i
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing video {i+1}: {e}")
                results.append({
                    'status': 'error',
                    'error': str(e),
                    'video_path': video_path,
                    'batch_index': i
                })
        
        return results

# Convenience function
def get_video_editor_agent() -> VideoEditorAgent:
    """Get an instance of the Video Editor Agent."""
    return VideoEditorAgent()
