from src.models.data_room import DataRoom, DocumentMeta, db
from src.connectors.registry import get_connector
from datetime import datetime
import hashlib

def sync_data_room(data_room_id: str):
    """
    Sync a data room with its provider
    
    Args:
        data_room_id: ID of the data room to sync
    
    Returns:
        dict: Sync results with counts and status
    """
    data_room = DataRoom.query.get(data_room_id)
    if not data_room:
        raise ValueError(f"Data room {data_room_id} not found")
    
    connector = get_connector(data_room.provider)
    if not connector:
        raise ValueError(f"Connector for {data_room.provider} not found")
    
    sync_results = {
        'data_room_id': data_room_id,
        'provider': data_room.provider,
        'new_documents': 0,
        'updated_documents': 0,
        'errors': []
    }
    
    try:
        # Get documents from the provider
        provider_documents = list(connector.list_documents(data_room))
        
        for doc_meta in provider_documents:
            try:
                # Check if document already exists
                existing_doc = DocumentMeta.query.filter_by(
                    source_id=doc_meta.source_id,
                    data_room_id=data_room_id
                ).first()
                
                if existing_doc:
                    # Check if document has been updated
                    if existing_doc.hash != doc_meta.hash or existing_doc.updated_at < doc_meta.updated_at:
                        # Document has been updated
                        existing_doc.path = doc_meta.path
                        existing_doc.mime = doc_meta.mime
                        existing_doc.updated_at = doc_meta.updated_at
                        existing_doc.hash = doc_meta.hash
                        existing_doc.status = 'stale'  # Mark for re-indexing
                        sync_results['updated_documents'] += 1
                else:
                    # New document
                    new_doc = DocumentMeta(
                        source_id=doc_meta.source_id,
                        data_room_id=data_room_id,
                        provider=doc_meta.provider,
                        path=doc_meta.path,
                        mime=doc_meta.mime,
                        updated_at=doc_meta.updated_at,
                        hash=doc_meta.hash,
                        status='stale'
                    )
                    db.session.add(new_doc)
                    sync_results['new_documents'] += 1
                    
            except Exception as e:
                sync_results['errors'].append(f"Error processing document {doc_meta.source_id}: {str(e)}")
        
        # Update data room sync timestamp
        data_room.last_sync_at = datetime.utcnow()
        db.session.commit()
        
        sync_results['status'] = 'completed'
        sync_results['synced_at'] = data_room.last_sync_at.isoformat()
        
    except Exception as e:
        sync_results['status'] = 'failed'
        sync_results['errors'].append(f"Sync failed: {str(e)}")
        db.session.rollback()
    
    return sync_results

def index_document(document_id: int):
    """
    Index a document for search/retrieval
    
    Args:
        document_id: ID of the document to index
    
    Returns:
        dict: Indexing results
    """
    document = DocumentMeta.query.get(document_id)
    if not document:
        raise ValueError(f"Document {document_id} not found")
    
    data_room = DataRoom.query.get(document.data_room_id)
    if not data_room:
        raise ValueError(f"Data room {document.data_room_id} not found")
    
    connector = get_connector(data_room.provider)
    if not connector:
        raise ValueError(f"Connector for {data_room.provider} not found")
    
    try:
        # Fetch document content
        content = connector.fetch_content(document)
        
        # TODO: Process content with Unstructured and index in Qdrant
        # For now, just mark as indexed
        document.status = 'indexed'
        db.session.commit()
        
        return {
            'document_id': document_id,
            'status': 'indexed',
            'content_length': len(content),
            'indexed_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        document.status = 'error'
        db.session.commit()
        raise e

def get_content_hash(content: str) -> str:
    """Generate a hash for document content"""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

