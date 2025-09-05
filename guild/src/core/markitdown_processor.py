"""
MarkItDown Document Processor for Guild-AI

This module integrates Microsoft's MarkItDown library to convert various document formats
into Markdown before processing them through the RAG pipeline. This enables Guild-AI to
handle real-world client data that isn't already in LLM-ready formats.

Supported formats:
- Office documents: PDF, DOCX, PPTX, XLSX, DOC, PPT, XLS
- Text formats: TXT, HTML, HTM, MD, RTF
- OpenDocument: ODT, ODP, ODS
- Audio/Video: MP3, MP4, WAV, YouTube URLs (with transcription)
"""

import os
import logging
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
import tempfile
import shutil

try:
    from markitdown import MarkItDown
    MARKITDOWN_AVAILABLE = True
except ImportError:
    MARKITDOWN_AVAILABLE = False
    print("Warning: MarkItDown not available. Install with: pip install markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]")

from .config import settings
from . import vector_store

logger = logging.getLogger(__name__)

class MarkItDownProcessor:
    """
    Processes documents using MarkItDown to convert them to Markdown format
    before sending them to the RAG pipeline.
    """
    
    def __init__(self):
        """Initialize the MarkItDown processor with configuration."""
        if not MARKITDOWN_AVAILABLE:
            raise ImportError(
                "MarkItDown is not available. Please install it with:\n"
                "pip install markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]"
            )
        
        # Initialize MarkItDown with plugins enabled
        self.md_converter = MarkItDown(
            enable_plugins=settings.MARKITDOWN_ENABLE_PLUGINS
        )
        
        # Supported file extensions
        self.supported_extensions = {
            ext.lower() for ext in settings.MARKITDOWN_SUPPORTED_FORMATS
        }
        
        logger.info(f"MarkItDown processor initialized with support for: {', '.join(self.supported_extensions)}")
    
    def is_supported_format(self, file_path: str) -> bool:
        """
        Check if the file format is supported by MarkItDown.
        
        Args:
            file_path: Path to the file to check
            
        Returns:
            True if the format is supported, False otherwise
        """
        file_extension = Path(file_path).suffix.lower()
        return file_extension in self.supported_extensions
    
    def get_file_size_mb(self, file_path: str) -> float:
        """
        Get file size in megabytes.
        
        Args:
            file_path: Path to the file
            
        Returns:
            File size in MB
        """
        return os.path.getsize(file_path) / (1024 * 1024)
    
    def validate_file(self, file_path: str) -> Dict[str, Any]:
        """
        Validate a file before processing.
        
        Args:
            file_path: Path to the file to validate
            
        Returns:
            Dictionary with validation results
        """
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Check if file exists
        if not os.path.exists(file_path):
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"File does not exist: {file_path}")
            return validation_result
        
        # Check file size
        file_size_mb = self.get_file_size_mb(file_path)
        if file_size_mb > settings.MARKITDOWN_MAX_FILE_SIZE_MB:
            validation_result["is_valid"] = False
            validation_result["errors"].append(
                f"File size ({file_size_mb:.2f} MB) exceeds maximum allowed size "
                f"({settings.MARKITDOWN_MAX_FILE_SIZE_MB} MB)"
            )
        
        # Check file format
        if not self.is_supported_format(file_path):
            validation_result["is_valid"] = False
            validation_result["errors"].append(
                f"File format not supported: {Path(file_path).suffix}"
            )
        
        # Check if file is readable
        try:
            with open(file_path, 'rb') as f:
                f.read(1024)  # Try to read first 1KB
        except Exception as e:
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"Cannot read file: {str(e)}")
        
        return validation_result
    
    def convert_to_markdown(self, file_path: str) -> Optional[str]:
        """
        Convert a document to Markdown using MarkItDown.
        
        Args:
            file_path: Path to the file to convert
            
        Returns:
            Markdown content as string, or None if conversion fails
        """
        try:
            logger.info(f"Converting {file_path} to Markdown...")
            
            # Validate file first
            validation = self.validate_file(file_path)
            if not validation["is_valid"]:
                for error in validation["errors"]:
                    logger.error(f"Validation error: {error}")
                return None
            
            # Convert document to Markdown
            result = self.md_converter.convert(file_path)
            
            if not result or not result.text_content:
                logger.warning(f"No content extracted from {file_path}")
                return None
            
            markdown_content = result.text_content.strip()
            
            if not markdown_content:
                logger.warning(f"Empty content extracted from {file_path}")
                return None
            
            logger.info(f"Successfully converted {file_path} to Markdown ({len(markdown_content)} characters)")
            return markdown_content
            
        except Exception as e:
            logger.error(f"Error converting {file_path} to Markdown: {str(e)}")
            return None
    
    def process_document(self, file_path: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process a document by converting it to Markdown and then embedding it.
        
        Args:
            file_path: Path to the document file
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            logger.info(f"Starting MarkItDown processing for document: {file_path}")
            
            # Convert document to Markdown
            markdown_content = self.convert_to_markdown(file_path)
            
            if not markdown_content:
                logger.error(f"Failed to convert {file_path} to Markdown")
                return False
            
            # Split the Markdown content into chunks
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            
            # Split the markdown content
            chunks = text_splitter.split_text(markdown_content)
            
            logger.info(f"Document split into {len(chunks)} chunks.")
            
            # Add conversion metadata
            enhanced_metadata = {
                **document_metadata,
                "conversion_method": "markitdown",
                "original_format": Path(file_path).suffix.lower(),
                "markdown_length": len(markdown_content),
                "chunk_count": len(chunks)
            }
            
            # Index the chunks in the vector store
            vector_store.index_chunks(
                document_id=document_metadata['document_id'],
                text_chunks=chunks,
                metadata=enhanced_metadata
            )
            
            logger.info(f"Successfully processed and embedded {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process document {file_path}: {str(e)}")
            return False
    
    def process_audio_file(self, audio_path: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process an audio file by transcribing it and then embedding the transcript.
        
        Args:
            audio_path: Path to the audio file
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        if not settings.MARKITDOWN_AUDIO_TRANSCRIPTION:
            logger.warning("Audio transcription is disabled in configuration")
            return False
        
        try:
            logger.info(f"Starting audio transcription for: {audio_path}")
            
            # Convert audio to text using MarkItDown
            result = self.md_converter.convert(audio_path)
            
            if not result or not result.text_content:
                logger.warning(f"No transcript extracted from {audio_path}")
                return False
            
            transcript = result.text_content.strip()
            
            if not transcript:
                logger.warning(f"Empty transcript extracted from {audio_path}")
                return False
            
            # Split transcript into chunks
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            
            chunks = text_splitter.split_text(transcript)
            
            logger.info(f"Audio transcript split into {len(chunks)} chunks.")
            
            # Add transcription metadata
            enhanced_metadata = {
                **document_metadata,
                "conversion_method": "markitdown_audio",
                "original_format": Path(audio_path).suffix.lower(),
                "transcript_length": len(transcript),
                "chunk_count": len(chunks)
            }
            
            # Index the chunks
            vector_store.index_chunks(
                document_id=document_metadata['document_id'],
                text_chunks=chunks,
                metadata=enhanced_metadata
            )
            
            logger.info(f"Successfully transcribed and embedded {audio_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to transcribe audio {audio_path}: {str(e)}")
            return False
    
    def process_youtube_url(self, youtube_url: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process a YouTube URL by transcribing the video and embedding the transcript.
        
        Args:
            youtube_url: YouTube URL to process
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        if not settings.MARKITDOWN_YOUTUBE_TRANSCRIPTION:
            logger.warning("YouTube transcription is disabled in configuration")
            return False
        
        try:
            logger.info(f"Starting YouTube transcription for: {youtube_url}")
            
            # Convert YouTube video to text using MarkItDown
            result = self.md_converter.convert(youtube_url)
            
            if not result or not result.text_content:
                logger.warning(f"No transcript extracted from {youtube_url}")
                return False
            
            transcript = result.text_content.strip()
            
            if not transcript:
                logger.warning(f"Empty transcript extracted from {youtube_url}")
                return False
            
            # Split transcript into chunks
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            
            chunks = text_splitter.split_text(transcript)
            
            logger.info(f"YouTube transcript split into {len(chunks)} chunks.")
            
            # Add transcription metadata
            enhanced_metadata = {
                **document_metadata,
                "conversion_method": "markitdown_youtube",
                "source_url": youtube_url,
                "transcript_length": len(transcript),
                "chunk_count": len(chunks)
            }
            
            # Index the chunks
            vector_store.index_chunks(
                document_id=document_metadata['document_id'],
                text_chunks=chunks,
                metadata=enhanced_metadata
            )
            
            logger.info(f"Successfully transcribed and embedded YouTube video")
            return True
            
        except Exception as e:
            logger.error(f"Failed to transcribe YouTube video {youtube_url}: {str(e)}")
            return False
    
    def get_supported_formats(self) -> List[str]:
        """
        Get list of supported file formats.
        
        Returns:
            List of supported file extensions
        """
        return list(self.supported_extensions)
    
    def get_processor_info(self) -> Dict[str, Any]:
        """
        Get information about the MarkItDown processor.
        
        Returns:
            Dictionary with processor information
        """
        return {
            "processor_type": "markitdown",
            "available": MARKITDOWN_AVAILABLE,
            "plugins_enabled": settings.MARKITDOWN_ENABLE_PLUGINS,
            "supported_formats": self.get_supported_formats(),
            "max_file_size_mb": settings.MARKITDOWN_MAX_FILE_SIZE_MB,
            "audio_transcription_enabled": settings.MARKITDOWN_AUDIO_TRANSCRIPTION,
            "youtube_transcription_enabled": settings.MARKITDOWN_YOUTUBE_TRANSCRIPTION
        }
