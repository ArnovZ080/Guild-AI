from typing import List, Dict, Any
from guild.src.core.models.schemas import Document, SourceProvenance

from guild.src.core import vector_store

def rag_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Performs a RAG search using the integrated vector store.
    
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
    Validate search results confidence and return status.
    
    Args:
        results: Search results from rag_search.
        min_confidence: Minimum confidence threshold.
    
    Returns:
        Validation status and recommendations.
    """
    if not results:
        return {
            'status': 'no_results',
            'message': 'No relevant documents found',
            'action': 'clarify_query'
        }
    
    avg_confidence = sum(r['source_provenance']['confidence'] for r in results) / len(results)
    
    if avg_confidence < min_confidence:
        return {
            'status': 'low_confidence',
            'average_confidence': avg_confidence,
            'message': f'Search confidence ({avg_confidence:.2f}) below threshold ({min_confidence})',
            'action': 'request_clarification'
        }
    
    return {
        'status': 'sufficient',
        'average_confidence': avg_confidence,
        'message': 'Search results have sufficient confidence',
        'action': 'proceed'
    }

def format_citations(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Format search results into citation format for UI display.
    
    Args:
        results: Search results from rag_search.
    
    Returns:
        Formatted citations.
    """
    citations = []
    
    for i, result in enumerate(results):
        provenance = result['source_provenance']
        citation = {
            'id': i + 1,
            'provider': provenance['provider'],
            'path': provenance['path'],
            'confidence': provenance['confidence'],
            'excerpt': result['content'][:200] + '...' if len(result['content']) > 200 else result['content'],
            'data_room_id': provenance['data_room_id'],
            'source_id': provenance['source_id']
        }
        citations.append(citation)
    
    return citations
