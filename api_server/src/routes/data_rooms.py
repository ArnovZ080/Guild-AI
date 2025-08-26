from fastapi import APIRouter, HTTPException
from guild.src.core import ingestion
import os

router = APIRouter(
    prefix="/datarooms",
    tags=["Data Rooms"],
)

@router.post("/{data_room_id}/ingest", status_code=202)
async def ingest_data_from_room(data_room_id: str):
    """
    Triggers the ingestion process for a data room.

    NOTE: This is a simplified endpoint for demonstration. It assumes
    a local file exists and does not connect to cloud providers.
    """
    # In a real implementation, you would:
    # 1. Get the data room configuration from the database.
    # 2. Use a connector to list and download files from the provider (e.g., GDrive).

    # For now, we'll simulate this by ingesting a dummy local file.
    # We'll create a dummy file to ingest.
    dummy_file_path = "/tmp/dummy_document.txt"
    with open(dummy_file_path, "w") as f:
        f.write("This is the first paragraph of our test document.\n\n")
        f.write("This is the second. Vector databases help us find similar text.\n\n")
        f.write("LangChain and LlamaIndex are popular tools for building RAG applications.")

    dummy_metadata = {
        "document_id": "dummy-doc-123",
        "data_room_id": data_room_id,
        "provider": "local",
        "path": dummy_file_path
    }

    try:
        ingestion.ingest_document(dummy_file_path, dummy_metadata)
        # In a real app, this would likely be a background task
        return {"message": f"Ingestion started for data room {data_room_id}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the dummy file
        if os.path.exists(dummy_file_path):
            os.remove(dummy_file_path)
