"""
Content Creation Agent
Example agent implementation with communication capabilities
"""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from .base_agent import BaseAgent, TaskComplexity

logger = logging.getLogger(__name__)

class ContentCreationAgent(BaseAgent):
    """Agent specialized in content creation tasks"""
    
    def __init__(self):
        super().__init__(
            agent_id="content_creation_agent",
            name="Content Creation Agent",
            description="Creates high-quality content including blog posts, social media content, and marketing materials",
            capabilities=[
                "blog_post_creation",
                "social_media_content",
                "email_marketing",
                "ad_copy_creation",
                "content_strategy",
                "seo_optimization",
                "content_editing",
                "brand_voice_consistency"
            ]
        )
        
    def get_required_task_fields(self) -> List[str]:
        """Get required fields for content creation tasks"""
        return ['content_type', 'topic', 'target_audience', 'tone']
        
    async def validate_task_specifics(self, task: Dict[str, Any]) -> bool:
        """Validate content creation specific requirements"""
        content_type = task.get('content_type', '').lower()
        
        if content_type in ['blog_post', 'article']:
            return 'word_count' in task or 'length' in task
        elif content_type in ['social_media', 'post']:
            return 'platform' in task
        elif content_type in ['email', 'newsletter']:
            return 'subject_line' in task or 'campaign_type' in task
            
        return True
        
    async def generate_specific_questions(self, task: Dict[str, Any]) -> List[str]:
        """Generate specific questions for content creation"""
        questions = []
        content_type = task.get('content_type', '').lower()
        
        if content_type == 'blog_post':
            if 'word_count' not in task:
                questions.append("What word count would you like for this blog post? (e.g., 500, 1000, 2000 words)")
            if 'keywords' not in task:
                questions.append("Are there any specific keywords you'd like me to include for SEO?")
            if 'call_to_action' not in task:
                questions.append("What call-to-action would you like at the end of the post?")
                
        elif content_type == 'social_media':
            if 'platform' not in task:
                questions.append("Which social media platform is this for? (LinkedIn, Twitter, Instagram, Facebook)")
            if 'post_count' not in task:
                questions.append("How many posts would you like me to create?")
                
        elif content_type == 'email':
            if 'campaign_type' not in task:
                questions.append("What type of email campaign is this? (promotional, newsletter, welcome, etc.)")
            if 'subject_line' not in task:
                questions.append("Do you have a subject line preference, or should I create one?")
                
        return questions
        
    async def _execute_main_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Execute content creation task"""
        try:
            content_type = task.get('content_type', 'general').lower()
            
            # Send initial status
            await self.send_status_update("working", 10, f"Analyzing requirements for {content_type}...")
            
            # Simulate content analysis
            await asyncio.sleep(2)
            await self.send_status_update("working", 25, "Researching topic and audience...")
            
            # Simulate research phase
            await asyncio.sleep(3)
            await self.send_status_update("working", 50, "Creating content outline...")
            
            # Create content outline
            outline = await self._create_content_outline(task)
            await self.send_response(f"Here's the content outline I've created:\n\n{outline}")
            
            # Ask for approval
            approval = await self.ask_clarification(
                "Does this outline look good to you? Should I proceed with creating the full content?",
                {"outline": outline}
            )
            
            if approval and approval.lower() in ['yes', 'y', 'proceed', 'continue']:
                await self.send_status_update("working", 75, "Writing the full content...")
                
                # Simulate content writing
                await asyncio.sleep(5)
                
                # Create the actual content
                content = await self._create_content(task, outline)
                
                await self.send_status_update("working", 90, "Finalizing and optimizing content...")
                
                # Simulate final optimization
                await asyncio.sleep(2)
                
                # Send final content
                await self.send_response(f"Here's your {content_type}:\n\n{content}")
                
                return {
                    "success": True,
                    "content_type": content_type,
                    "content": content,
                    "outline": outline,
                    "metadata": {
                        "word_count": len(content.split()),
                        "created_at": datetime.now().isoformat(),
                        "agent_id": self.agent_id
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Content creation cancelled by user",
                    "outline": outline
                }
                
        except Exception as e:
            logger.error(f"Content creation failed: {e}")
            await self.send_response(f"I encountered an error while creating your content: {str(e)}")
            raise
            
    async def _create_content_outline(self, task: Dict[str, Any]) -> str:
        """Create content outline based on task requirements"""
        content_type = task.get('content_type', 'general')
        topic = task.get('topic', 'general topic')
        target_audience = task.get('target_audience', 'general audience')
        tone = task.get('tone', 'professional')
        
        if content_type.lower() == 'blog_post':
            return f"""
BLOG POST OUTLINE: {topic}

Target Audience: {target_audience}
Tone: {tone}

1. Introduction
   - Hook to grab attention
   - Problem statement
   - Preview of solution

2. Main Content
   - Key point 1 with supporting evidence
   - Key point 2 with examples
   - Key point 3 with actionable insights

3. Conclusion
   - Summary of main points
   - Call to action
   - Next steps for readers

Estimated Word Count: {task.get('word_count', '1000')} words
"""
        elif content_type.lower() == 'social_media':
            return f"""
SOCIAL MEDIA CONTENT OUTLINE: {topic}

Platform: {task.get('platform', 'general')}
Target Audience: {target_audience}
Tone: {tone}

Post 1: Attention-grabbing headline with key benefit
Post 2: Problem/solution format with engaging visuals
Post 3: Behind-the-scenes or personal story
Post 4: Educational tip or how-to
Post 5: Call-to-action with compelling offer

Total Posts: {task.get('post_count', '5')}
"""
        else:
            return f"""
CONTENT OUTLINE: {topic}

Type: {content_type}
Target Audience: {target_audience}
Tone: {tone}

1. Opening
2. Main Message
3. Supporting Points
4. Conclusion/Call to Action
"""
            
    async def _create_content(self, task: Dict[str, Any], outline: str) -> str:
        """Create the actual content based on outline and requirements"""
        content_type = task.get('content_type', 'general')
        topic = task.get('topic', 'general topic')
        tone = task.get('tone', 'professional')
        
        if content_type.lower() == 'blog_post':
            return f"""
# {topic}

## Introduction

In today's fast-paced world, understanding {topic} has become more important than ever. This comprehensive guide will help you master the key concepts and implement them effectively in your daily work.

## Understanding the Fundamentals

The foundation of {topic} lies in understanding its core principles. These principles guide decision-making and help create sustainable solutions that deliver real value.

Key areas to focus on include:
- Strategic planning and execution
- Resource optimization
- Performance measurement
- Continuous improvement

## Practical Implementation

Here are the essential steps to implement {topic} successfully:

1. **Assessment Phase**: Evaluate your current situation and identify opportunities
2. **Planning Phase**: Develop a comprehensive strategy with clear objectives
3. **Execution Phase**: Implement your plan with regular monitoring
4. **Review Phase**: Analyze results and make necessary adjustments

## Best Practices

To maximize your success with {topic}, consider these proven best practices:

- Start with clear, measurable goals
- Focus on high-impact activities first
- Maintain consistent communication with stakeholders
- Use data-driven decision making
- Celebrate small wins to maintain momentum

## Conclusion

{topic} represents a powerful approach to achieving your objectives. By following the principles and practices outlined in this guide, you'll be well-equipped to implement these strategies effectively.

Ready to get started? Take the first step today and begin applying these concepts to your specific situation.

---
*This content was created by the Content Creation Agent to help you achieve your goals.*
"""
        elif content_type.lower() == 'social_media':
            posts = []
            for i in range(task.get('post_count', 5)):
                posts.append(f"""
Post {i+1}: {topic} - Discover the secret that successful professionals use every day. Ready to transform your approach? 🚀 #Success #ProfessionalGrowth
""")
            return "\n".join(posts)
        else:
            return f"""
{topic}

This comprehensive guide covers everything you need to know about {topic}. Whether you're just getting started or looking to advance your knowledge, this resource provides valuable insights and practical advice.

Key Benefits:
- Clear understanding of core concepts
- Practical implementation strategies
- Real-world examples and case studies
- Actionable next steps

Get started today and begin your journey toward mastery of {topic}.
"""
            
    def can_handle_task(self, task: Dict[str, Any]) -> bool:
        """Check if this agent can handle the task"""
        description = task.get('description', '').lower()
        content_keywords = [
            'content', 'write', 'blog', 'article', 'social media', 'email',
            'marketing', 'copy', 'copywriting', 'content creation'
        ]
        
        return any(keyword in description for keyword in content_keywords)
        
    def estimate_task_complexity(self, task: Dict[str, Any]) -> TaskComplexity:
        """Estimate task complexity"""
        content_type = task.get('content_type', '').lower()
        word_count = task.get('word_count', 0)
        
        if content_type in ['social_media', 'post']:
            return TaskComplexity.SIMPLE
        elif content_type in ['email', 'newsletter']:
            return TaskComplexity.MODERATE
        elif content_type in ['blog_post', 'article']:
            if isinstance(word_count, int) and word_count > 2000:
                return TaskComplexity.COMPLEX
            else:
                return TaskComplexity.MODERATE
        else:
            return TaskComplexity.MODERATE
            
    def get_estimated_duration(self, task: Dict[str, Any]) -> int:
        """Get estimated task duration in minutes"""
        complexity = self.estimate_task_complexity(task)
        content_type = task.get('content_type', '').lower()
        
        if content_type in ['social_media', 'post']:
            return 10
        elif content_type in ['email', 'newsletter']:
            return 20
        elif content_type in ['blog_post', 'article']:
            word_count = task.get('word_count', 1000)
            if isinstance(word_count, int):
                return max(15, word_count // 100)  # Rough estimate
            return 25
        else:
            return 20
