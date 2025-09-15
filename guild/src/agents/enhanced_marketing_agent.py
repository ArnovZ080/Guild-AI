"""
Enhanced Marketing Agent - Handles marketing campaigns with image generation capabilities
"""

import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import requests
import base64
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ImageRequest:
    """Image generation request"""
    prompt: str
    style: str
    dimensions: str
    platform: str
    brand_colors: List[str]
    brand_fonts: List[str]

@dataclass
class CampaignRequest:
    """Marketing campaign request"""
    campaign_type: str
    target_audience: str
    budget: float
    duration_days: int
    platforms: List[str]
    image_preference: str  # 'generate', 'user_provided', 'both'
    user_images: List[str]
    brand_guidelines: Dict[str, Any]

class EnhancedMarketingAgent:
    """
    Enhanced Marketing Agent with image generation capabilities
    
    Handles marketing campaigns, ad creation, and image generation
    with user preference for image sources.
    """
    
    def __init__(self, image_generation_enabled: bool = True):
        """
        Initialize the Enhanced Marketing Agent
        
        Args:
            image_generation_enabled: Whether to enable AI image generation
        """
        self.image_generation_enabled = image_generation_enabled
        self.active_campaigns = {}
        self.image_generation_history = []
        
        logger.info("Enhanced Marketing Agent initialized")
    
    def create_campaign(self, request: CampaignRequest) -> Dict[str, Any]:
        """
        Create a marketing campaign with image handling
        
        Args:
            request: Campaign creation request
            
        Returns:
            Dictionary with campaign creation results
        """
        try:
            campaign_id = f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Ask about image preferences if not specified
            if not request.image_preference:
                return self._ask_image_preferences(request)
            
            # Create campaign structure
            campaign = {
                'id': campaign_id,
                'type': request.campaign_type,
                'target_audience': request.target_audience,
                'budget': request.budget,
                'duration_days': request.duration_days,
                'platforms': request.platforms,
                'status': 'planning',
                'created_at': datetime.now().isoformat(),
                'image_preference': request.image_preference,
                'user_images': request.user_images,
                'generated_images': [],
                'brand_guidelines': request.brand_guidelines
            }
            
            # Handle image generation/selection
            if request.image_preference in ['generate', 'both']:
                generated_images = self._generate_campaign_images(campaign)
                campaign['generated_images'] = generated_images
            
            if request.image_preference in ['user_provided', 'both'] and request.user_images:
                campaign['user_images'] = request.user_images
            
            # Create campaign content
            campaign_content = self._create_campaign_content(campaign)
            campaign['content'] = campaign_content
            
            # Set up campaign schedule
            campaign_schedule = self._create_campaign_schedule(campaign)
            campaign['schedule'] = campaign_schedule
            
            self.active_campaigns[campaign_id] = campaign
            
            logger.info(f"Campaign {campaign_id} created successfully")
            
            return {
                'success': True,
                'campaign_id': campaign_id,
                'campaign': campaign,
                'message': 'Campaign created successfully',
                'next_steps': self._get_next_steps(campaign)
            }
            
        except Exception as e:
            logger.error(f"Failed to create campaign: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create campaign'
            }
    
    def _ask_image_preferences(self, request: CampaignRequest) -> Dict[str, Any]:
        """
        Ask user about image preferences for the campaign
        
        Args:
            request: Campaign request
            
        Returns:
            Dictionary with image preference question
        """
        return {
            'success': False,
            'requires_user_input': True,
            'question': 'image_preference',
            'message': 'I need to know about images for your campaign',
            'options': {
                'generate': {
                    'title': 'Generate AI Images',
                    'description': 'I\'ll create custom images using AI based on your brand guidelines',
                    'pros': ['No need to provide images', 'Brand-consistent', 'Unlimited variations'],
                    'cons': ['May not match exact vision', 'AI-generated look']
                },
                'user_provided': {
                    'title': 'Use Your Images',
                    'description': 'You provide the images and I\'ll optimize them for the campaign',
                    'pros': ['Full control', 'Exact vision', 'Personal touch'],
                    'cons': ['Need to provide images', 'Limited variations']
                },
                'both': {
                    'title': 'Both Options',
                    'description': 'Generate AI images and also use your provided images',
                    'pros': ['Maximum flexibility', 'Best of both worlds'],
                    'cons': ['More complex', 'Longer setup time']
                }
            },
            'recommendation': 'I recommend "Generate AI Images" for most campaigns as it ensures brand consistency and saves time.',
            'follow_up_questions': [
                'Do you have specific brand colors I should use?',
                'Are there any brand fonts or typography preferences?',
                'What style should the images have? (modern, classic, playful, professional)',
                'Are there any specific elements that must be included?'
            ]
        }
    
    def _generate_campaign_images(self, campaign: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate images for the campaign
        
        Args:
            campaign: Campaign data
            
        Returns:
            List of generated images
        """
        try:
            if not self.image_generation_enabled:
                return []
            
            # Create image prompts based on campaign type and brand guidelines
            image_prompts = self._create_image_prompts(campaign)
            generated_images = []
            
            for i, prompt_data in enumerate(image_prompts):
                # Simulate image generation (in real implementation, call AI image service)
                image_result = self._simulate_image_generation(prompt_data, campaign)
                generated_images.append(image_result)
                
                # Store in history
                self.image_generation_history.append({
                    'campaign_id': campaign['id'],
                    'prompt': prompt_data['prompt'],
                    'generated_at': datetime.now().isoformat(),
                    'image_url': image_result['url']
                })
            
            logger.info(f"Generated {len(generated_images)} images for campaign {campaign['id']}")
            return generated_images
            
        except Exception as e:
            logger.error(f"Failed to generate images: {e}")
            return []
    
    def _create_image_prompts(self, campaign: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Create image generation prompts based on campaign
        
        Args:
            campaign: Campaign data
            
        Returns:
            List of image prompt data
        """
        prompts = []
        
        # Base prompt elements
        brand_colors = campaign.get('brand_guidelines', {}).get('colors', ['blue', 'white'])
        brand_style = campaign.get('brand_guidelines', {}).get('style', 'modern')
        target_audience = campaign['target_audience']
        campaign_type = campaign['type']
        
        # Create different image types based on campaign
        if campaign_type == 'social_media':
            prompts = [
                {
                    'type': 'hero_image',
                    'prompt': f"Professional {brand_style} social media post for {target_audience}, brand colors {', '.join(brand_colors)}, clean design, engaging",
                    'dimensions': '1080x1080',
                    'platform': 'instagram'
                },
                {
                    'type': 'story_image',
                    'prompt': f"Vertical {brand_style} story format for {target_audience}, brand colors {', '.join(brand_colors)}, mobile-optimized",
                    'dimensions': '1080x1920',
                    'platform': 'instagram_stories'
                }
            ]
        elif campaign_type == 'display_ads':
            prompts = [
                {
                    'type': 'banner_ad',
                    'prompt': f"Eye-catching {brand_style} banner advertisement for {target_audience}, brand colors {', '.join(brand_colors)}, call-to-action",
                    'dimensions': '728x90',
                    'platform': 'display'
                },
                {
                    'type': 'square_ad',
                    'prompt': f"Square {brand_style} advertisement for {target_audience}, brand colors {', '.join(brand_colors)}, professional",
                    'dimensions': '600x600',
                    'platform': 'facebook'
                }
            ]
        elif campaign_type == 'email_marketing':
            prompts = [
                {
                    'type': 'email_header',
                    'prompt': f"Email header image for {target_audience}, {brand_style} style, brand colors {', '.join(brand_colors)}, newsletter format",
                    'dimensions': '600x200',
                    'platform': 'email'
                }
            ]
        
        return prompts
    
    def _simulate_image_generation(self, prompt_data: Dict[str, Any], campaign: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate image generation (replace with actual AI image service)
        
        Args:
            prompt_data: Image prompt data
            campaign: Campaign data
            
        Returns:
            Generated image data
        """
        # In real implementation, this would call an AI image generation service
        # like DALL-E, Midjourney, or Stable Diffusion
        
        return {
            'id': f"img_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'type': prompt_data['type'],
            'prompt': prompt_data['prompt'],
            'dimensions': prompt_data['dimensions'],
            'platform': prompt_data['platform'],
            'url': f"https://generated-images.example.com/{prompt_data['type']}_{campaign['id']}.jpg",
            'generated_at': datetime.now().isoformat(),
            'status': 'generated',
            'variations': [
                f"https://generated-images.example.com/{prompt_data['type']}_{campaign['id']}_v1.jpg",
                f"https://generated-images.example.com/{prompt_data['type']}_{campaign['id']}_v2.jpg"
            ]
        }
    
    def _create_campaign_content(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create campaign content including copy and descriptions
        
        Args:
            campaign: Campaign data
            
        Returns:
            Campaign content data
        """
        return {
            'headlines': [
                f"Transform Your {campaign['target_audience']} Experience",
                f"Discover the Future of {campaign['target_audience']}",
                f"Join Thousands of Happy {campaign['target_audience']}"
            ],
            'descriptions': [
                f"Perfect for {campaign['target_audience']} looking for quality and innovation.",
                f"Designed specifically with {campaign['target_audience']} in mind.",
                f"The solution {campaign['target_audience']} have been waiting for."
            ],
            'call_to_actions': [
                "Learn More",
                "Get Started",
                "Discover Now",
                "Try Free"
            ],
            'hashtags': [
                f"#{campaign['target_audience'].replace(' ', '')}",
                "#Innovation",
                "#Quality",
                "#Results"
            ]
        }
    
    def _create_campaign_schedule(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create campaign schedule and timeline
        
        Args:
            campaign: Campaign data
            
        Returns:
            Campaign schedule data
        """
        start_date = datetime.now()
        end_date = start_date + timedelta(days=campaign['duration_days'])
        
        return {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'duration_days': campaign['duration_days'],
            'budget_daily': campaign['budget'] / campaign['duration_days'],
            'platforms_schedule': {
                platform: {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'budget': campaign['budget'] / len(campaign['platforms'])
                }
                for platform in campaign['platforms']
            },
            'milestones': [
                {
                    'date': (start_date + timedelta(days=1)).isoformat(),
                    'task': 'Campaign setup and approval',
                    'status': 'pending'
                },
                {
                    'date': (start_date + timedelta(days=2)).isoformat(),
                    'task': 'Image generation and optimization',
                    'status': 'pending'
                },
                {
                    'date': (start_date + timedelta(days=3)).isoformat(),
                    'task': 'Campaign launch',
                    'status': 'pending'
                }
            ]
        }
    
    def _get_next_steps(self, campaign: Dict[str, Any]) -> List[str]:
        """
        Get next steps for the campaign
        
        Args:
            campaign: Campaign data
            
        Returns:
            List of next steps
        """
        steps = [
            "Review generated images and select favorites",
            "Approve campaign content and copy",
            "Set up tracking and analytics",
            "Launch campaign on selected platforms",
            "Monitor performance and optimize"
        ]
        
        if campaign['image_preference'] in ['user_provided', 'both'] and not campaign.get('user_images'):
            steps.insert(0, "Upload your images for the campaign")
        
        return steps
    
    def get_campaign_status(self, campaign_id: str) -> Dict[str, Any]:
        """
        Get status of a specific campaign
        
        Args:
            campaign_id: Campaign identifier
            
        Returns:
            Campaign status data
        """
        if campaign_id not in self.active_campaigns:
            return {
                'success': False,
                'error': 'Campaign not found',
                'message': 'Campaign does not exist'
            }
        
        campaign = self.active_campaigns[campaign_id]
        
        return {
            'success': True,
            'campaign': campaign,
            'status': campaign['status'],
            'progress': self._calculate_campaign_progress(campaign),
            'performance': self._get_campaign_performance(campaign_id)
        }
    
    def _calculate_campaign_progress(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate campaign progress
        
        Args:
            campaign: Campaign data
            
        Returns:
            Progress data
        """
        total_tasks = len(campaign.get('schedule', {}).get('milestones', []))
        completed_tasks = sum(1 for milestone in campaign.get('schedule', {}).get('milestones', []) 
                             if milestone.get('status') == 'completed')
        
        return {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'percentage': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            'status': campaign['status']
        }
    
    def _get_campaign_performance(self, campaign_id: str) -> Dict[str, Any]:
        """
        Get campaign performance metrics (mock data)
        
        Args:
            campaign_id: Campaign identifier
            
        Returns:
            Performance metrics
        """
        # In real implementation, this would fetch actual performance data
        return {
            'impressions': 125000,
            'clicks': 3200,
            'conversions': 180,
            'ctr': 2.56,
            'conversion_rate': 5.63,
            'cost_per_click': 0.85,
            'cost_per_conversion': 15.20,
            'total_spent': 2720.00,
            'roi': 2.3
        }
    
    def update_campaign_budget(self, campaign_id: str, new_budget: float) -> Dict[str, Any]:
        """
        Update campaign budget
        
        Args:
            campaign_id: Campaign identifier
            new_budget: New budget amount
            
        Returns:
            Update result
        """
        if campaign_id not in self.active_campaigns:
            return {
                'success': False,
                'error': 'Campaign not found',
                'message': 'Campaign does not exist'
            }
        
        campaign = self.active_campaigns[campaign_id]
        old_budget = campaign['budget']
        campaign['budget'] = new_budget
        
        # Update schedule with new budget
        if 'schedule' in campaign:
            campaign['schedule']['budget_daily'] = new_budget / campaign['duration_days']
            for platform in campaign['schedule']['platforms_schedule']:
                campaign['schedule']['platforms_schedule'][platform]['budget'] = (
                    new_budget / len(campaign['platforms'])
                )
        
        logger.info(f"Updated campaign {campaign_id} budget from {old_budget} to {new_budget}")
        
        return {
            'success': True,
            'campaign_id': campaign_id,
            'old_budget': old_budget,
            'new_budget': new_budget,
            'message': f'Budget updated from ${old_budget} to ${new_budget}'
        }

# Example usage and testing
if __name__ == "__main__":
    # Initialize marketing agent
    agent = EnhancedMarketingAgent()
    
    # Create a campaign request
    campaign_request = CampaignRequest(
        campaign_type='social_media',
        target_audience='small business owners',
        budget=5000.0,
        duration_days=30,
        platforms=['facebook', 'instagram', 'linkedin'],
        image_preference='generate',
        user_images=[],
        brand_guidelines={
            'colors': ['#1E40AF', '#FFFFFF', '#F3F4F6'],
            'fonts': ['Inter', 'Roboto'],
            'style': 'modern',
            'tone': 'professional'
        }
    )
    
    # Create campaign
    result = agent.create_campaign(campaign_request)
    print(f"Campaign creation result: {result}")
    
    if result['success']:
        # Get campaign status
        status = agent.get_campaign_status(result['campaign_id'])
        print(f"Campaign status: {status}")
        
        # Update budget
        budget_update = agent.update_campaign_budget(result['campaign_id'], 7500.0)
        print(f"Budget update: {budget_update}")
