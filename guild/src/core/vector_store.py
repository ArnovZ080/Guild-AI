import qdrant_client
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import uuid

# --- Qdrant Client and Model Setup ---

# This could be configured via guild.src.core.config.py as well
QDRANT_HOST = "qdrant"
QDRANT_PORT = 6333
COLLECTION_NAME = "guild_docs"
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'

# Initialize the embedding model once
embedding_model = SentenceTransformer(EMBEDDING_MODEL)

def get_qdrant_client():
    """Returns an instance of the Qdrant client."""
    return qdrant_client.QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def initialize_vector_store():
    """
    Ensures the collection exists in Qdrant. If not, it creates it.
    """
    client = get_qdrant_client()
    try:
        client.get_collection(collection_name=COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' already exists.")
    except Exception:
        print(f"Collection '{COLLECTION_NAME}' not found. Creating it...")
        client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qdrant_client.models.VectorParams(
                size=embedding_model.get_sentence_embedding_dimension(),
                distance=qdrant_client.models.Distance.COSINE,
            ),
        )
        print(f"Collection '{COLLECTION_NAME}' created successfully.")


# --- Indexing Logic ---

def index_text(document_id: str, text_content: str, metadata: Dict[str, Any]):
    """
    Creates embeddings for text content and upserts them into Qdrant.

    Args:
        document_id: A unique identifier for the source document.
        text_content: The text content to be indexed.
        metadata: A dictionary of metadata to store with the vectors.
    """
    client = get_qdrant_client()

    # Simple chunking strategy: split by paragraph
    chunks = [chunk for chunk in text_content.split('\n\n') if chunk.strip()]

    if not chunks:
        print(f"No text chunks to index for document {document_id}.")
        return

    # Create embeddings for each chunk
    vectors = embedding_model.encode(chunks, show_progress_bar=False)

    # Prepare points for Qdrant
    points = []
    for i, chunk in enumerate(chunks):
        points.append(qdrant_client.models.PointStruct(
            id=str(uuid.uuid4()),
            vector=vectors[i].tolist(),
            payload={
                "document_id": document_id,
                "chunk_text": chunk,
                **metadata
            }
        ))

    # Upsert points into the collection
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
        wait=True
    )
    print(f"Indexed {len(points)} chunks for document {document_id}.")


# --- Search Logic (to be implemented next) ---

def search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Performs a similarity search in the vector store for a given query.

    Args:
        query: The search query string.
        top_k: The number of top results to return.

    Returns:
        A list of search results, each containing the payload and score.
    """
    client = get_qdrant_client()

    # Create an embedding for the query
    query_vector = embedding_model.encode(query).tolist()

    # Perform the search
    search_results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,  # Include the payload in the results
    )

    # Format the results
    results = []
    for hit in search_results:
        results.append({
            "score": hit.score,
            "payload": hit.payload,
        })

    return results
