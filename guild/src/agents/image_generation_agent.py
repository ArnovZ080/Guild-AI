"""
Image Generation Agent for Guild-AI

This agent provides local image generation capabilities using Hugging Face diffusers
for cost-effective, high-quality image creation for marketing materials.
"""

import logging
import torch
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json
from PIL import Image
import io
import base64

# Conditional imports for diffusers
try:
    from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
    from diffusers.utils import export_to_video
    DIFFUSERS_AVAILABLE = True
except ImportError:
    DIFFUSERS_AVAILABLE = False
    print("Warning: Diffusers not available. Install with: pip install diffusers")

from .enhanced_prompts import EnhancedPrompts

logger = logging.getLogger(__name__)

class ImageGenerationAgent:
    """
    Agent for generating images using Hugging Face diffusers.
    """
    
    def __init__(self, model_name: str = "runwayml/stable-diffusion-v1-5"):
        """
        Initialize the image generation agent.
        
        Args:
            model_name: Hugging Face model name for image generation
        """
        if not DIFFUSERS_AVAILABLE:
            raise ImportError("Diffusers is required for image generation. Install with: pip install diffusers")
        
        self.model_name = model_name
        self.pipeline = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.prompt_template = EnhancedPrompts.get_image_generation_agent_prompt()
        
        logger.info(f"Image Generation Agent initialized with model: {model_name} on device: {self.device}")
    
    def _load_pipeline(self):
        """Load the diffusion pipeline if not already loaded."""
        if self.pipeline is None:
            try:
                logger.info("Loading diffusion pipeline...")
                self.pipeline = StableDiffusionPipeline.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,
                    requires_safety_checker=False
                )
                
                # Use faster scheduler
                self.pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                    self.pipeline.scheduler.config
                )
                
                self.pipeline = self.pipeline.to(self.device)
                
                # Enable memory efficient attention if available
                if hasattr(self.pipeline, 'enable_attention_slicing'):
                    self.pipeline.enable_attention_slicing()
                
                logger.info("Diffusion pipeline loaded successfully")
                
            except Exception as e:
                logger.error(f"Error loading diffusion pipeline: {e}")
                raise
    
    def generate_image(self, 
                      prompt: str,
                      negative_prompt: Optional[str] = None,
                      width: int = 512,
                      height: int = 512,
                      num_inference_steps: int = 20,
                      guidance_scale: float = 7.5,
                      seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate an image from a text prompt.
        
        Args:
            prompt: Text description of the desired image
            negative_prompt: What to avoid in the image
            width: Image width in pixels
            height: Image height in pixels
            num_inference_steps: Number of denoising steps
            guidance_scale: How closely to follow the prompt
            seed: Random seed for reproducibility
            
        Returns:
            Dictionary with generated image information
        """
        try:
            logger.info(f"Generating image with prompt: {prompt[:100]}...")
            
            # Load pipeline if needed
            self._load_pipeline()
            
            # Set seed for reproducibility
            if seed is not None:
                torch.manual_seed(seed)
                if torch.cuda.is_available():
                    torch.cuda.manual_seed(seed)
            
            # Generate image
            with torch.autocast(self.device):
                result = self.pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt or "blurry, low quality, distorted, ugly",
                    width=width,
                    height=height,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    num_images_per_prompt=1
                )
            
            # Get the generated image
            image = result.images[0]
            
            # Save image to temporary file
            temp_dir = tempfile.mkdtemp(prefix="guild_image_")
            output_path = Path(temp_dir) / "generated_image.png"
            image.save(output_path)
            
            # Get image metadata
            image_info = {
                'width': image.width,
                'height': image.height,
                'mode': image.mode,
                'format': 'PNG'
            }
            
            logger.info(f"Image generated successfully: {output_path}")
            
            return {
                'status': 'success',
                'image_path': str(output_path),
                'prompt': prompt,
                'negative_prompt': negative_prompt,
                'image_info': image_info,
                'generation_params': {
                    'width': width,
                    'height': height,
                    'num_inference_steps': num_inference_steps,
                    'guidance_scale': guidance_scale,
                    'seed': seed
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'prompt': prompt
            }
    
    def generate_social_media_image(self, 
                                  content_description: str,
                                  platform: str = "linkedin",
                                  brand_colors: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate an image optimized for social media platforms.
        
        Args:
            content_description: Description of the content
            platform: Social media platform (linkedin, instagram, twitter, facebook)
            brand_colors: List of brand colors to incorporate
            
        Returns:
            Generated image information
        """
        try:
            # Platform-specific dimensions
            dimensions = {
                'linkedin': (1200, 627),      # LinkedIn post
                'instagram': (1080, 1080),    # Instagram square
                'twitter': (1200, 675),       # Twitter card
                'facebook': (1200, 630),      # Facebook post
                'youtube': (1280, 720)        # YouTube thumbnail
            }
            
            width, height = dimensions.get(platform.lower(), (1080, 1080))
            
            # Create platform-specific prompt
            prompt = self._create_social_media_prompt(content_description, platform, brand_colors)
            
            # Generate image
            result = self.generate_image(
                prompt=prompt,
                width=width,
                height=height,
                num_inference_steps=25,  # Higher quality for social media
                guidance_scale=8.0
            )
            
            if result['status'] == 'success':
                result['platform'] = platform
                result['optimized_for'] = 'social_media'
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating social media image: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'platform': platform
            }
    
    def generate_product_mockup(self, 
                              product_description: str,
                              style: str = "modern",
                              background: str = "clean") -> Dict[str, Any]:
        """
        Generate a product mockup image.
        
        Args:
            product_description: Description of the product
            style: Visual style (modern, vintage, minimalist, luxury)
            background: Background style (clean, office, nature, abstract)
            
        Returns:
            Generated product mockup
        """
        try:
            prompt = f"A {style} {product_description} mockup, {background} background, professional product photography, high quality, detailed, commercial photography style"
            
            result = self.generate_image(
                prompt=prompt,
                width=1024,
                height=1024,
                num_inference_steps=30,
                guidance_scale=8.5
            )
            
            if result['status'] == 'success':
                result['mockup_type'] = 'product'
                result['style'] = style
                result['background'] = background
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating product mockup: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'product_description': product_description
            }
    
    def generate_infographic(self, 
                           topic: str,
                           data_points: List[str],
                           style: str = "professional") -> Dict[str, Any]:
        """
        Generate an infographic image.
        
        Args:
            topic: Main topic of the infographic
            data_points: Key data points to highlight
            style: Visual style (professional, colorful, minimalist)
            
        Returns:
            Generated infographic
        """
        try:
            # Create infographic prompt
            data_text = ", ".join(data_points[:5])  # Limit to 5 data points
            prompt = f"A {style} infographic about {topic}, featuring: {data_text}, clean design, modern typography, professional layout, high contrast, easy to read"
            
            result = self.generate_image(
                prompt=prompt,
                width=1200,
                height=800,  # Infographic aspect ratio
                num_inference_steps=25,
                guidance_scale=8.0
            )
            
            if result['status'] == 'success':
                result['infographic_topic'] = topic
                result['data_points'] = data_points
                result['style'] = style
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating infographic: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'topic': topic
            }
    
    def batch_generate_images(self, 
                            prompts: List[str],
                            **kwargs) -> List[Dict[str, Any]]:
        """
        Generate multiple images in batch.
        
        Args:
            prompts: List of text prompts
            **kwargs: Additional parameters for image generation
            
        Returns:
            List of generated image results
        """
        results = []
        
        for i, prompt in enumerate(prompts):
            try:
                logger.info(f"Generating image {i+1}/{len(prompts)}")
                result = self.generate_image(prompt, **kwargs)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                logger.error(f"Error generating image {i+1}: {e}")
                results.append({
                    'status': 'error',
                    'error': str(e),
                    'prompt': prompt,
                    'batch_index': i
                })
        
        return results
    
    def _create_social_media_prompt(self, 
                                  content_description: str,
                                  platform: str,
                                  brand_colors: Optional[List[str]]) -> str:
        """Create a platform-specific prompt for social media."""
        
        # Platform-specific style adjustments
        platform_styles = {
            'linkedin': "professional, business-focused, clean, corporate style",
            'instagram': "vibrant, engaging, modern, visually appealing",
            'twitter': "clean, simple, bold, attention-grabbing",
            'facebook': "friendly, approachable, community-focused",
            'youtube': "eye-catching, bold, high contrast, thumbnail-optimized"
        }
        
        style = platform_styles.get(platform.lower(), "professional, clean, modern")
        
        # Add brand colors if provided
        color_text = ""
        if brand_colors:
            color_text = f", incorporating {', '.join(brand_colors)} colors"
        
        # Create the prompt
        prompt = f"A {style} social media graphic about {content_description}{color_text}, high quality, professional design, engaging visual, social media optimized"
        
        return prompt
    
    def enhance_prompt(self, 
                     basic_prompt: str,
                     style: str = "professional",
                     quality: str = "high",
                     mood: str = "neutral") -> str:
        """
        Enhance a basic prompt with style and quality modifiers.
        
        Args:
            basic_prompt: Basic description
            style: Visual style (professional, artistic, modern, vintage)
            quality: Quality level (high, ultra, photorealistic)
            mood: Mood/atmosphere (neutral, energetic, calm, dramatic)
            
        Returns:
            Enhanced prompt
        """
        quality_modifiers = {
            'high': "high quality, detailed, sharp focus",
            'ultra': "ultra high quality, extremely detailed, 8k resolution",
            'photorealistic': "photorealistic, professional photography, studio lighting"
        }
        
        style_modifiers = {
            'professional': "professional, clean, modern, business-appropriate",
            'artistic': "artistic, creative, expressive, unique style",
            'modern': "modern, contemporary, sleek, minimalist",
            'vintage': "vintage, retro, classic, timeless"
        }
        
        mood_modifiers = {
            'neutral': "neutral, balanced, professional",
            'energetic': "energetic, dynamic, vibrant, exciting",
            'calm': "calm, peaceful, serene, relaxing",
            'dramatic': "dramatic, bold, striking, impactful"
        }
        
        enhanced_prompt = f"{basic_prompt}, {quality_modifiers.get(quality, 'high quality')}, {style_modifiers.get(style, 'professional')}, {mood_modifiers.get(mood, 'neutral')}"
        
        return enhanced_prompt
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        return {
            'model_name': self.model_name,
            'device': self.device,
            'pipeline_loaded': self.pipeline is not None,
            'cuda_available': torch.cuda.is_available(),
            'diffusers_available': DIFFUSERS_AVAILABLE
        }
    
    def cleanup(self):
        """Clean up resources."""
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Image generation agent cleaned up")

# Convenience function
def get_image_generation_agent(model_name: str = "runwayml/stable-diffusion-v1-5") -> ImageGenerationAgent:
    """Get an instance of the Image Generation Agent."""
    return ImageGenerationAgent(model_name=model_name)
