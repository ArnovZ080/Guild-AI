"""
Asset Agent API Routes
Handles image generation, video creation, and asset editing via AI agents
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import sys
import json
import tempfile
from pathlib import Path

# Allow importing guild package agents
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'guild'))

try:
    from guild.src.agents.image_generation_agent import ImageGenerationAgent, generate_comprehensive_visual_content
except Exception as e:
    print(f"Warning: Could not import ImageGenerationAgent: {e}")
    ImageGenerationAgent = None
    generate_comprehensive_visual_content = None

try:
    from guild.src.agents.video_editor_agent import VideoEditorAgent
except Exception as e:
    print(f"Warning: Could not import VideoEditorAgent: {e}")
    VideoEditorAgent = None

router = APIRouter(
    prefix="/agents",
    tags=["Asset Agents"],
)


class ImageGenerationRequest(BaseModel):
    visual_request: Dict[str, Any]
    brand_guidelines: Dict[str, Any]
    target_audience: Dict[str, Any]
    content_context: Dict[str, Any]
    technical_requirements: Dict[str, Any]
    creative_direction: Optional[Dict[str, Any]] = None
    reference_materials: Optional[List[Dict[str, Any]]] = None


class ImageEditRequest(BaseModel):
    asset_id: str
    asset_url: str
    edit_instruction: str
    asset_type: str
    current_metadata: Optional[Dict[str, Any]] = None


class VideoEditRequest(BaseModel):
    asset_id: str
    asset_url: str
    edit_instruction: str
    asset_type: str
    current_metadata: Optional[Dict[str, Any]] = None


@router.post("/generate-image")
async def generate_image(request: ImageGenerationRequest):
    """
    Generate an image using the Image Generation Agent
    """
    try:
        if not ImageGenerationAgent or not generate_comprehensive_visual_content:
            raise HTTPException(
                status_code=503,
                detail="Image Generation Agent is not available. Please ensure diffusers library is installed."
            )

        # Generate comprehensive visual content strategy
        visual_strategy = await generate_comprehensive_visual_content(
            visual_request=request.visual_request,
            brand_guidelines=request.brand_guidelines,
            target_audience=request.target_audience,
            content_context=request.content_context,
            technical_requirements=request.technical_requirements,
            creative_direction=request.creative_direction,
            reference_materials=request.reference_materials
        )

        # Extract generation parameters
        gen_params = visual_strategy.get('generation_parameters', {})
        base_prompt = gen_params.get('base_prompt', request.visual_request.get('prompt', ''))
        negative_prompt = gen_params.get('negative_prompt', '')
        tech_settings = gen_params.get('technical_settings', {})

        # Initialize agent and generate image
        agent = ImageGenerationAgent()
        
        # Determine platform-specific dimensions
        platform = request.technical_requirements.get('platform', 'general')
        if platform == 'linkedin':
            width, height = 1200, 627
        elif platform == 'instagram':
            width, height = 1080, 1080
        elif platform == 'twitter':
            width, height = 1200, 675
        elif platform == 'facebook':
            width, height = 1200, 630
        else:
            width, height = tech_settings.get('width', 1024), tech_settings.get('height', 1024)

        # Generate the image
        result = agent.generate_image(
            prompt=base_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=tech_settings.get('num_inference_steps', 20),
            guidance_scale=tech_settings.get('guidance_scale', 7.5),
            seed=tech_settings.get('seed')
        )

        if result['status'] == 'success':
            return {
                "success": True,
                "image_path": result['image_path'],
                "url": result['image_path'],  # For compatibility
                "metadata": {
                    **visual_strategy,
                    **result
                }
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Image generation failed'))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating image: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")


@router.post("/generate-video")
async def generate_video(
    video_type: str = Form(...),
    platform: str = Form(...),
    style: str = Form(...),
    duration: int = Form(...),
    content: str = Form(None),
    image_files: Optional[List[UploadFile]] = File(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Generate a video using the Video Editor Agent
    """
    try:
        if not VideoEditorAgent:
            raise HTTPException(
                status_code=503,
                detail="Video Editor Agent is not available. Please ensure moviepy library is installed."
            )

        # Initialize agent
        agent = VideoEditorAgent()

        # Save uploaded images temporarily
        image_paths = []
        if image_files:
            temp_dir = tempfile.mkdtemp(prefix="guild_video_images_")
            for idx, image_file in enumerate(image_files):
                image_path = Path(temp_dir) / f"image_{idx}_{image_file.filename}"
                with open(image_path, "wb") as f:
                    f.write(await image_file.read())
                image_paths.append(str(image_path))

        # Save uploaded audio temporarily
        audio_path = None
        if audio_file:
            temp_audio_dir = tempfile.mkdtemp(prefix="guild_video_audio_")
            audio_path = Path(temp_audio_dir) / audio_file.filename
            with open(audio_path, "wb") as f:
                f.write(await audio_file.read())
            audio_path = str(audio_path)

        # Generate video based on type
        if video_type == 'slideshow':
            if not image_paths:
                raise HTTPException(status_code=400, detail="Slideshow requires at least one image")
            
            result = agent.create_slideshow_video(
                image_paths=image_paths,
                audio_path=audio_path,
                duration_per_image=float(duration) / len(image_paths) if image_paths else 3.0,
                transition_duration=0.5,
                output_resolution=(1920, 1080)
            )
        
        elif video_type == 'social_media' or video_type == 'text_video':
            if not content:
                raise HTTPException(status_code=400, detail="Text video requires content")
            
            result = agent.create_social_media_video(
                content=content,
                platform=platform,
                style=style,
                duration=float(duration)
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown video type: {video_type}")

        if result['status'] == 'success':
            return {
                "success": True,
                "video_path": result['video_path'],
                "url": result['video_path'],  # For compatibility
                "duration": result.get('duration', duration),
                "metadata": result
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Video generation failed'))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating video: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")


@router.post("/edit-image")
async def edit_image(request: ImageEditRequest):
    """
    Edit an image using AI-powered instructions
    """
    try:
        if not ImageGenerationAgent:
            raise HTTPException(
                status_code=503,
                detail="Image Generation Agent is not available"
            )

        # For now, we'll use image generation with a modified prompt
        # In the future, this could use inpainting or other editing techniques
        agent = ImageGenerationAgent()
        
        # Create an edit prompt based on the instruction
        edit_prompt = f"Edit the following image: {request.edit_instruction}. Maintain the original style and composition."
        
        result = agent.generate_image(
            prompt=edit_prompt,
            width=1024,
            height=1024,
            num_inference_steps=25,
            guidance_scale=8.0
        )

        if result['status'] == 'success':
            return {
                "success": True,
                "edited_url": result['image_path'],
                "url": result['image_path'],  # For compatibility
                "metadata": result
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Image editing failed'))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error editing image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to edit image: {str(e)}")


@router.post("/edit-video")
async def edit_video(request: VideoEditRequest):
    """
    Edit a video using AI-powered instructions
    """
    try:
        if not VideoEditorAgent:
            raise HTTPException(
                status_code=503,
                detail="Video Editor Agent is not available"
            )

        agent = VideoEditorAgent()

        # Parse the edit instruction to determine what to do
        instruction_lower = request.edit_instruction.lower()
        
        # For now, we'll handle simple text overlay edits
        if 'text' in instruction_lower or 'overlay' in instruction_lower:
            # Extract text from instruction (simplified)
            text = request.edit_instruction
            
            result = agent.add_text_overlay(
                video_path=request.asset_url,
                text=text,
                position='bottom',
                font_size=50,
                font_color='white'
            )
        else:
            # For other instructions, return a placeholder
            return {
                "success": True,
                "edited_url": request.asset_url,
                "url": request.asset_url,
                "metadata": {
                    "note": "Advanced video editing coming soon. For now, only text overlays are supported."
                }
            }

        if result['status'] == 'success':
            return {
                "success": True,
                "edited_url": result['video_path'],
                "url": result['video_path'],  # For compatibility
                "metadata": result
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Video editing failed'))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error editing video: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to edit video: {str(e)}")


@router.get("/capabilities")
async def get_agent_capabilities():
    """
    Get capabilities of available asset agents
    """
    capabilities = {
        "image_generation": {
            "available": ImageGenerationAgent is not None,
            "features": [
                "AI-powered image generation",
                "Brand-consistent visual design",
                "Platform-specific optimization",
                "Multiple styles and moods",
                "Custom prompting"
            ] if ImageGenerationAgent else []
        },
        "video_editing": {
            "available": VideoEditorAgent is not None,
            "features": [
                "Slideshow creation",
                "Text-based videos",
                "Social media optimization",
                "Background audio support",
                "Text overlays"
            ] if VideoEditorAgent else []
        }
    }
    
    return {"success": True, "capabilities": capabilities}

