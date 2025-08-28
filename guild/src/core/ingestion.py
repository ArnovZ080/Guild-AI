from langchain.document_loaders import PyPDFLoader, TextLoader, UnstructuredHTMLLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Any
import os

from . import vector_store

def ingest_document(file_path: str, document_metadata: Dict[str, Any]):
    """
    Loads a document from a file path, splits it into chunks,
    and indexes the chunks in the vector store.

    Args:
        file_path: The local path to the document file.
        document_metadata: A dictionary of metadata to attach to the indexed chunks.
                           Should include at least 'document_id', 'provider', etc.
    """
    print(f"Starting ingestion for document: {file_path}")

    file_extension = os.path.splitext(file_path)[1].lower()

    # Select the appropriate document loader based on file extension
    if file_extension == '.pdf':
        loader = PyPDFLoader(file_path)
    elif file_extension == '.html' or file_extension == '.htm':
        loader = UnstructuredHTMLLoader(file_path)
    elif file_extension == '.txt':
        loader = TextLoader(file_path)
    else:
        print(f"Unsupported file type: {file_extension}. Skipping.")
        return

    try:
        # Load the document content
        documents = loader.load()

        # Split the document into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)

        print(f"Document split into {len(chunks)} chunks.")

        # Extract text content from LangChain's Document objects
        text_chunks = [chunk.page_content for chunk in chunks]

        # Index the text chunks in the vector store
        # We pass the metadata, which will be attached to each vector.
        vector_store.index_chunks(
            document_id=document_metadata['document_id'],
            text_chunks=text_chunks,
            metadata=document_metadata
        )

        print(f"Successfully finished ingestion for document: {file_path}")

    except Exception as e:
        print(f"Failed to ingest document {file_path}. Error: {e}")
        raise
