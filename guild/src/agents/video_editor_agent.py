"""
Video Editor Agent for Guild-AI

This agent provides video editing capabilities using MoviePy for creating
marketing videos, social media content, and other video materials.
"""

import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from pathlib import Path
import tempfile
import json
import numpy as np

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

from .enhanced_prompts import EnhancedPrompts

logger = logging.getLogger(__name__)

class VideoEditorAgent:
    """
    Agent for video editing and creation using MoviePy.
    """
    
    def __init__(self):
        """
        Initialize the video editor agent.
        """
        if not MOVIEPY_AVAILABLE:
            raise ImportError("MoviePy is required for video editing. Install with: pip install moviepy")
        
        self.prompt_template = EnhancedPrompts.get_video_editor_agent_prompt()
        logger.info("Video Editor Agent initialized")
    
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
