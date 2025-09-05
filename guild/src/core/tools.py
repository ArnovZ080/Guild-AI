from typing import List, Dict, Any, Optional
from guild.src.core.models.schemas import Document, SourceProvenance
# Conditional import for vision components
try:
    from guild.src.core.vision import VisualAutomationTool
    VISION_AVAILABLE = True
except ImportError:
    VisualAutomationTool = None
    VISION_AVAILABLE = False
    print("Warning: VisualAutomationTool not available - computer vision tools disabled")

from guild.src.core import vector_store
from guild.src.core.enhanced_rag_pipeline import get_enhanced_rag_pipeline

def rag_search(query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Performs a RAG search using the enhanced RAG pipeline with MarkItDown integration.
    
    Args:
        query: Search query.
        top_k: Number of top results to return.
        filters: Optional filters for the search results.
    
    Returns:
        List of search results with source provenance.
    """
    try:
        # Use the enhanced RAG pipeline for better search capabilities
        pipeline = get_enhanced_rag_pipeline()
        search_hits = pipeline.search(query=query, top_k=top_k, filters=filters)
        
        # Format the results into the application's expected format
        results = []
        for hit in search_hits:
            payload = hit['payload']
            result = {
                'content': payload.get('chunk_text', ''),
                'score': hit['score'],
                'source_provenance': SourceProvenance(
                    provider=payload.get('provider', 'unknown'),
                    data_room_id=payload.get('data_room_id', 'unknown'),
                    source_id=payload.get('document_id', 'unknown'),
                    path=payload.get('path', 'unknown'),
                    chunk_ids=[hit['id']],  # The point ID can serve as a chunk ID
                    confidence=hit['score']
                ),
                # Enhanced metadata from MarkItDown processing
                'conversion_method': payload.get('conversion_method', 'unknown'),
                'original_format': payload.get('original_format', 'unknown'),
                'chunk_count': payload.get('chunk_count', 1)
            }
            results.append(result)

        return results
        
    except Exception as e:
        print(f"Error in enhanced RAG search: {e}")
        # Fall back to basic vector store search
        return _fallback_rag_search(query, top_k)

def _fallback_rag_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Fallback RAG search using the basic vector store.
    
    Args:
        query: Search query.
        top_k: Number of top results to return.
    
    Returns:
        List of search results with source provenance.
    """
    # 1. Search the vector store
    search_hits = vector_store.search(query=query, top_k=top_k)
    
    # 2. Format the results into the application's expected format
    results = []
    for hit in search_hits:
        payload = hit['payload']
        result = {
            'content': payload.get('chunk_text', ''),
            'score': hit['score'],
            'source_provenance': SourceProvenance(
                provider=payload.get('provider', 'unknown'),
                data_room_id=payload.get('data_room_id', 'unknown'),
                source_id=payload.get('document_id', 'unknown'),
                path=payload.get('path', 'unknown'),
                chunk_ids=[hit['id']],  # The point ID can serve as a chunk ID
                confidence=hit['score']
            )
        }
        results.append(result)

    return results

def validate_search_confidence(results: List[Dict[str, Any]], min_confidence: float = 0.55) -> Dict[str, Any]:
    """
    Validates search results against a minimum confidence threshold.
    
    Args:
        results: List of search results to validate.
        min_confidence: Minimum confidence score required (0.0 to 1.0).
    
    Returns:
        Dictionary with validation results and filtered results.
    """
    if not results:
        return {
            "is_valid": False,
            "confidence_score": 0.0,
            "filtered_results": [],
            "validation_message": "No search results found."
        }
    
    # Calculate average confidence
    total_confidence = sum(result.get('score', 0) for result in results)
    avg_confidence = total_confidence / len(results)
    
    # Filter results by confidence threshold
    filtered_results = [
        result for result in results 
        if result.get('score', 0) >= min_confidence
    ]
    
    validation_result = {
        "is_valid": avg_confidence >= min_confidence,
        "confidence_score": avg_confidence,
        "filtered_results": filtered_results,
        "total_results": len(results),
        "filtered_count": len(filtered_results),
        "validation_message": (
            f"Search validation {'passed' if avg_confidence >= min_confidence else 'failed'}. "
            f"Average confidence: {avg_confidence:.3f}, "
            f"Threshold: {min_confidence:.3f}, "
            f"Results: {len(filtered_results)}/{len(results)} passed filter."
        )
    }
    
    return validation_result

def get_rag_capabilities() -> Dict[str, Any]:
    """
    Get information about the RAG system capabilities.
    
    Returns:
        Dictionary with RAG system information and supported formats.
    """
    try:
        pipeline = get_enhanced_rag_pipeline()
        return pipeline.get_processing_stats()
    except Exception as e:
        print(f"Error getting RAG capabilities: {e}")
        return {
            "error": str(e),
            "pipeline_type": "basic_rag",
            "capabilities": {
                "langchain_formats": ['.pdf', '.html', '.htm', '.txt', '.md'],
                "markitdown_available": False
            }
        }

def process_document_enhanced(file_path: str, document_metadata: Dict[str, Any]) -> bool:
    """
    Process a document using the enhanced RAG pipeline.
    
    Args:
        file_path: Path to the document file
        document_metadata: Metadata to attach to the indexed chunks
        
    Returns:
        True if processing was successful, False otherwise
    """
    try:
        pipeline = get_enhanced_rag_pipeline()
        return pipeline.process_document(file_path, document_metadata)
    except Exception as e:
        print(f"Error processing document with enhanced pipeline: {e}")
        return False

def process_audio_file(audio_path: str, document_metadata: Dict[str, Any]) -> bool:
    """
    Process an audio file by transcribing it.
    
    Args:
        audio_path: Path to the audio file
        document_metadata: Metadata to attach to the indexed chunks
        
    Returns:
        True if processing was successful, False otherwise
    """
    try:
        pipeline = get_enhanced_rag_pipeline()
        return pipeline.process_audio(audio_path, document_metadata)
    except Exception as e:
        print(f"Error processing audio file: {e}")
        return False

def process_youtube_video(youtube_url: str, document_metadata: Dict[str, Any]) -> bool:
    """
    Process a YouTube video by transcribing it.
    
    Args:
        youtube_url: YouTube URL to process
        document_metadata: Metadata to attach to the indexed chunks
        
    Returns:
        True if processing was successful, False otherwise
    """
    try:
        pipeline = get_enhanced_rag_pipeline()
        return pipeline.process_youtube(youtube_url, document_metadata)
    except Exception as e:
        print(f"Error processing YouTube video: {e}")
        return False
