from typing import List, Dict, Any, Tuple
from guild.src.core.models.schemas import Document  # Assuming a Pydantic Document schema exists
import hashlib

def calculate_sync_diff(
    provider_documents: List[Document],
    existing_documents: List[Document]
) -> Dict[str, List[Document]]:
    """
    Compares documents from a provider with existing documents and calculates the difference.

    Args:
        provider_documents: A list of document schemas from the external provider.
        existing_documents: A list of document schemas already in our system.

    Returns:
        A dictionary containing lists of documents to be created, updated, or deleted.
    """

    existing_docs_map = {doc.source_id: doc for doc in existing_documents}
    provider_docs_map = {doc.source_id: doc for doc in provider_documents}

    docs_to_create = []
    docs_to_update = []

    for source_id, provider_doc in provider_docs_map.items():
        existing_doc = existing_docs_map.get(source_id)

        if not existing_doc:
            # Document exists in provider but not in our system
            docs_to_create.append(provider_doc)
        else:
            # Document exists in both, check for updates
            if provider_doc.hash != existing_doc.hash:
                # Hashes are different, so the document needs an update
                # We update the existing document's data with the provider's new data
                existing_doc.path = provider_doc.path
                existing_doc.mime = provider_doc.mime
                existing_doc.updated_at = provider_doc.updated_at
                existing_doc.hash = provider_doc.hash
                existing_doc.status = 'stale' # Mark for re-indexing
                docs_to_update.append(existing_doc)

    # Note: This simple diff doesn't handle deletions. For that, we'd need to compare the sets of IDs.
    # docs_to_delete = [doc for source_id, doc in existing_docs_map.items() if source_id not in provider_docs_map]

    return {
        "create": docs_to_create,
        "update": docs_to_update,
        # "delete": docs_to_delete # Can be added later
    }

def get_content_hash(content: bytes) -> str:
    """Generate a SHA256 hash for document content."""
    return hashlib.sha256(content).hexdigest()
