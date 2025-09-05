"""
Enhanced RAG Pipeline for Guild-AI

This module provides an enhanced RAG pipeline that integrates MarkItDown document processing
with the existing vector store and search capabilities. It automatically handles document
format detection and routes documents to the appropriate processor.
"""

import os
import logging
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import shutil

from . import ingestion, vector_store
from .config import settings

logger = logging.getLogger(__name__)

class EnhancedRAGPipeline:
    """
    Enhanced RAG pipeline that integrates MarkItDown with traditional document processing.
    """
    
    def __init__(self):
        """Initialize the enhanced RAG pipeline."""
        self.capabilities = ingestion.get_ingestion_capabilities()
        logger.info(f"Enhanced RAG Pipeline initialized with capabilities: {self.capabilities}")
    
    def process_document(self, file_path: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process a document using the enhanced pipeline.
        
        Args:
            file_path: Path to the document file
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            logger.info(f"Processing document with enhanced pipeline: {file_path}")
            
            # Use the enhanced ingestion function
            ingestion.ingest_document(file_path, document_metadata)
            return True
            
        except Exception as e:
            logger.error(f"Failed to process document {file_path}: {e}")
            return False
    
    def process_audio(self, audio_path: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process an audio file by transcribing it.
        
        Args:
            audio_path: Path to the audio file
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            logger.info(f"Processing audio file: {audio_path}")
            
            success = ingestion.ingest_audio_file(audio_path, document_metadata)
            return success
            
        except Exception as e:
            logger.error(f"Failed to process audio file {audio_path}: {e}")
            return False
    
    def process_youtube(self, youtube_url: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process a YouTube video by transcribing it.
        
        Args:
            youtube_url: YouTube URL to process
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            logger.info(f"Processing YouTube video: {youtube_url}")
            
            success = ingestion.ingest_youtube_video(youtube_url, document_metadata)
            return success
            
        except Exception as e:
            logger.error(f"Failed to process YouTube video {youtube_url}: {e}")
            return False
    
    def process_url(self, url: str, document_metadata: Dict[str, Any]) -> bool:
        """
        Process a URL (web page, YouTube, etc.) by detecting the type and processing accordingly.
        
        Args:
            url: URL to process
            document_metadata: Metadata to attach to the indexed chunks
            
        Returns:
            True if processing was successful, False otherwise
        """
        try:
            logger.info(f"Processing URL: {url}")
            
            # Check if it's a YouTube URL
            if "youtube.com" in url or "youtu.be" in url:
                return self.process_youtube(url, document_metadata)
            
            # For now, treat other URLs as web pages
            # This could be enhanced with web scraping capabilities
            logger.warning(f"URL processing not yet implemented for: {url}")
            return False
            
        except Exception as e:
            logger.error(f"Failed to process URL {url}: {e}")
            return False
    
    def process_batch(self, files: List[str], document_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process multiple files in batch.
        
        Args:
            files: List of file paths to process
            document_metadata: Base metadata to attach to all chunks
            
        Returns:
            Dictionary with batch processing results
        """
        results = {
            "total_files": len(files),
            "successful": 0,
            "failed": 0,
            "errors": [],
            "file_results": {}
        }
        
        for file_path in files:
            try:
                # Generate unique document ID for each file
                file_metadata = {
                    **document_metadata,
                    "document_id": f"{document_metadata.get('document_id', 'batch')}_{Path(file_path).stem}",
                    "file_path": file_path
                }
                
                success = self.process_document(file_path, file_metadata)
                
                if success:
                    results["successful"] += 1
                    results["file_results"][file_path] = {"status": "success"}
                else:
                    results["failed"] += 1
                    results["file_results"][file_path] = {"status": "failed"}
                    
            except Exception as e:
                results["failed"] += 1
                error_msg = f"Error processing {file_path}: {str(e)}"
                results["errors"].append(error_msg)
                results["file_results"][file_path] = {"status": "error", "error": str(e)}
                logger.error(error_msg)
        
        logger.info(f"Batch processing completed: {results['successful']} successful, {results['failed']} failed")
        return results
    
    def search(self, query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Search the vector store with enhanced filtering capabilities.
        
        Args:
            query: Search query
            top_k: Number of top results to return
            filters: Optional filters for the search
            
        Returns:
            List of search results
        """
        try:
            # Use the existing vector store search
            search_results = vector_store.search(query=query, top_k=top_k)
            
            # Apply additional filtering if specified
            if filters:
                search_results = self._apply_filters(search_results, filters)
            
            return search_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def _apply_filters(self, results: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Apply filters to search results.
        
        Args:
            results: Search results to filter
            filters: Filters to apply
            
        Returns:
            Filtered search results
        """
        filtered_results = []
        
        for result in results:
            payload = result.get('payload', {})
            include_result = True
            
            for filter_key, filter_value in filters.items():
                if filter_key in payload:
                    if isinstance(filter_value, list):
                        if payload[filter_key] not in filter_value:
                            include_result = False
                            break
                    else:
                        if payload[filter_key] != filter_value:
                            include_result = False
                            break
            
            if include_result:
                filtered_results.append(result)
        
        return filtered_results
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the RAG pipeline.
        
        Returns:
            Dictionary with pipeline statistics
        """
        try:
            # Get vector store statistics
            client = vector_store.get_qdrant_client()
            collection_info = client.get_collection(collection_name=vector_store.COLLECTION_NAME)
            
            stats = {
                "pipeline_type": "enhanced_rag",
                "capabilities": self.capabilities,
                "vector_store": {
                    "collection_name": vector_store.COLLECTION_NAME,
                    "total_points": collection_info.points_count,
                    "vector_size": collection_info.config.params.vectors.size
                },
                "supported_formats": self.capabilities.get("markitdown_formats", []) + self.capabilities.get("langchain_formats", [])
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get processing stats: {e}")
            return {"error": str(e)}
    
    def cleanup_temp_files(self, temp_dir: str):
        """
        Clean up temporary files created during processing.
        
        Args:
            temp_dir: Path to temporary directory to clean up
        """
        try:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                logger.info(f"Cleaned up temporary directory: {temp_dir}")
        except Exception as e:
            logger.warning(f"Failed to clean up temporary directory {temp_dir}: {e}")

# Convenience functions for easy access
def get_enhanced_rag_pipeline() -> EnhancedRAGPipeline:
    """Get an instance of the enhanced RAG pipeline."""
    return EnhancedRAGPipeline()

def process_document_enhanced(file_path: str, document_metadata: Dict[str, Any]) -> bool:
    """Process a document using the enhanced RAG pipeline."""
    pipeline = get_enhanced_rag_pipeline()
    return pipeline.process_document(file_path, document_metadata)

def search_enhanced(query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Search using the enhanced RAG pipeline."""
    pipeline = get_enhanced_rag_pipeline()
    return pipeline.search(query, top_k, filters)
