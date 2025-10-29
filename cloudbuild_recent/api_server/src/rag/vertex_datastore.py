"""
Vertex AI Data Store Integration for Guild AI
Enhances MarkItDown pipeline with Google's enterprise search capabilities
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core import retry

logger = logging.getLogger(__name__)

class VertexDataStore:
    """
    Vertex AI Data Store for enhanced RAG capabilities
    Integrates with existing MarkItDown document processing
    """
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = "global"
        self.data_store_id = "guild-business-documents"
        
        # Initialize clients
        try:
            self.document_client = discoveryengine.DocumentServiceClient()
            self.search_client = discoveryengine.SearchServiceClient()
            logger.info(f"Vertex Data Store initialized: {self.data_store_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex Data Store: {e}")
            self.document_client = None
            self.search_client = None
    
    def _get_parent_path(self) -> str:
        """Get parent path for data store operations"""
        return (
            f"projects/{self.project_id}/locations/{self.location}/"
            f"dataStores/{self.data_store_id}/branches/default_branch"
        )
    
    def _get_serving_config(self) -> str:
        """Get serving config for search operations"""
        return (
            f"projects/{self.project_id}/locations/{self.location}/"
            f"dataStores/{self.data_store_id}/servingConfigs/default_search"
        )
    
    @retry.Retry(deadline=30.0)
    async def ingest_document(
        self,
        document_id: str,
        content: str,
        metadata: Dict[str, Any],
        user_id: str
    ) -> bool:
        """
        Ingest a document into Vertex AI Data Store
        
        Args:
            document_id: Unique document identifier
            content: Document content (markdown from MarkItDown)
            metadata: Document metadata (source, format, etc.)
            user_id: User who owns this document
        
        Returns:
            True if successful, False otherwise
        """
        if not self.document_client:
            logger.warning("Vertex Data Store not available, skipping ingestion")
            return False
        
        try:
            # Prepare document for ingestion
            document = discoveryengine.Document(
                id=document_id,
                json_data=json.dumps({
                    "content": content,
                    "user_id": user_id,
                    "metadata": metadata,
                    "indexed_at": datetime.utcnow().isoformat()
                }),
                struct_data={
                    "user_id": user_id,
                    "source": metadata.get("provider", "unknown"),
                    "original_format": metadata.get("original_format", "unknown"),
                    "document_type": metadata.get("document_type", "business_document"),
                    "processed_date": datetime.utcnow().isoformat()
                }
            )
            
            # Create document request
            request = discoveryengine.CreateDocumentRequest(
                parent=self._get_parent_path(),
                document=document,
                document_id=document_id
            )
            
            # Ingest document
            operation = self.document_client.create_document(request=request)
            logger.info(f"Document {document_id} ingested successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to ingest document {document_id}: {e}")
            return False
    
    async def ingest_source_of_truth(
        self,
        user_id: str,
        onboarding_data: Dict[str, Any]
    ) -> bool:
        """
        Ingest user's source of truth (onboarding data) for agent context
        
        Args:
            user_id: User identifier
            onboarding_data: Complete onboarding/business data
        
        Returns:
            True if successful
        """
        try:
            # Format onboarding data as searchable content
            content_parts = [
                f"# Business Profile for User {user_id}\n"
            ]
            
            # Business info
            if onboarding_data.get("business"):
                content_parts.append("\n## Business Information")
                content_parts.append(f"Type: {onboarding_data['business'].get('type')}")
                content_parts.append(f"Description: {onboarding_data['business'].get('description')}")
                content_parts.append(f"Industry: {onboarding_data['business'].get('industry')}")
            
            # Audience info
            if onboarding_data.get("audience"):
                content_parts.append("\n## Target Audience")
                content_parts.append(f"Target: {onboarding_data['audience'].get('target')}")
                content_parts.append(f"Problems: {onboarding_data['audience'].get('problems')}")
            
            # Brand info
            if onboarding_data.get("brand"):
                content_parts.append("\n## Brand Identity")
                content_parts.append(f"Voice: {onboarding_data['brand'].get('voice_tone')}")
                content_parts.append(f"Differentiation: {onboarding_data['brand'].get('differentiation')}")
                content_parts.append(f"Story: {onboarding_data['brand'].get('story')}")
            
            # Financial info
            if onboarding_data.get("financial"):
                content_parts.append("\n## Financial Information")
                content_parts.append(f"Pricing: {onboarding_data['financial'].get('pricing_status')}")
                content_parts.append(f"Budget: {onboarding_data['financial'].get('marketing_budget')}")
            
            # Goals
            if onboarding_data.get("goals"):
                content_parts.append("\n## Goals & Priorities")
                content_parts.append(f"3-Month Priority: {onboarding_data['goals'].get('priority_3months')}")
            
            content = "\n".join(content_parts)
            
            return await self.ingest_document(
                document_id=f"user-{user_id}-source-of-truth",
                content=content,
                metadata={
                    "document_type": "source_of_truth",
                    "provider": "onboarding",
                    "original_format": "json"
                },
                user_id=user_id
            )
            
        except Exception as e:
            logger.error(f"Failed to ingest source of truth for user {user_id}: {e}")
            return False
    
    async def search(
        self,
        query: str,
        user_id: str,
        top_k: int = 5,
        include_extractive_answers: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search documents with citations and extractive answers
        
        Args:
            query: Search query
            user_id: User to search documents for
            top_k: Number of results to return
            include_extractive_answers: Enable AI-extracted answers
        
        Returns:
            List of search results with content and citations
        """
        if not self.search_client:
            logger.warning("Vertex Data Store not available for search")
            return []
        
        try:
            # Build search request
            search_config = discoveryengine.SearchRequest.ContentSearchSpec()
            
            if include_extractive_answers:
                search_config.extractive_content_spec = (
                    discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                        max_extractive_answer_count=3,
                        max_extractive_segment_count=1
                    )
                )
            
            request = discoveryengine.SearchRequest(
                serving_config=self._get_serving_config(),
                query=query,
                filter=f'user_id: ANY("{user_id}")',
                page_size=top_k,
                content_search_spec=search_config
            )
            
            # Execute search
            response = self.search_client.search(request=request)
            
            # Format results
            results = []
            for result in response.results:
                doc_data = result.document.derived_struct_data
                
                result_item = {
                    "content": doc_data.get("extractive_answers", []) if include_extractive_answers else [],
                    "document_id": result.document.id,
                    "source": doc_data.get("link", ""),
                    "relevance_score": getattr(result, "relevance_score", 0),
                    "metadata": result.document.struct_data
                }
                
                results.append(result_item)
            
            logger.info(f"Search for '{query}' returned {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def search_with_context(
        self,
        query: str,
        user_id: str,
        context_type: Optional[str] = None
    ) -> str:
        """
        Search and return formatted context for agent prompts
        
        Args:
            query: What to search for
            user_id: User identifier
            context_type: Filter by type (e.g., 'source_of_truth', 'business_document')
        
        Returns:
            Formatted context string for LLM prompts
        """
        results = await self.search(query, user_id, top_k=3)
        
        if not results:
            return "No relevant context found."
        
        # Format as context
        context_parts = ["Relevant context from user's business data:\n"]
        
        for i, result in enumerate(results, 1):
            context_parts.append(f"\n{i}. Source: {result['document_id']}")
            
            if result.get("content"):
                for answer in result["content"]:
                    context_parts.append(f"   {answer.get('content', '')}")
            
            if result.get("metadata"):
                meta = result["metadata"]
                if meta.get("source"):
                    context_parts.append(f"   From: {meta['source']}")
        
        return "\n".join(context_parts)
    
    async def delete_user_documents(self, user_id: str) -> bool:
        """Delete all documents for a user (GDPR compliance)"""
        if not self.document_client:
            return False
        
        try:
            # Search for all user documents
            results = await self.search(query="*", user_id=user_id, top_k=100)
            
            # Delete each document
            for result in results:
                doc_name = f"{self._get_parent_path()}/documents/{result['document_id']}"
                try:
                    self.document_client.delete_document(name=doc_name)
                    logger.info(f"Deleted document: {result['document_id']}")
                except Exception as e:
                    logger.error(f"Failed to delete {result['document_id']}: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete documents for user {user_id}: {e}")
            return False

# Global instance
vertex_datastore = VertexDataStore()

