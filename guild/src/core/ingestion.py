from langchain.document_loaders import PyPDFLoader, TextLoader, UnstructuredHTMLLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Any
import os
import logging

from . import vector_store

# Try to import MarkItDown processor
try:
    from .markitdown_processor import MarkItDownProcessor
    MARKITDOWN_AVAILABLE = True
except ImportError:
    MarkItDownProcessor = None
    MARKITDOWN_AVAILABLE = False

logger = logging.getLogger(__name__)

def ingest_document(file_path: str, document_metadata: Dict[str, Any]):
    """
    Loads a document from a file path, splits it into chunks,
    and indexes the chunks in the vector store.
    
    This function now supports both traditional LangChain loaders and MarkItDown
    for handling non-LLM-ready document formats.

    Args:
        file_path: The local path to the document file.
        document_metadata: A dictionary of metadata to attach to the indexed chunks.
                           Should include at least 'document_id', 'provider', etc.
    """
    logger.info(f"Starting ingestion for document: {file_path}")

    file_extension = os.path.splitext(file_path)[1].lower()
    
    # First, try MarkItDown for supported formats
    if MARKITDOWN_AVAILABLE and _should_use_markitdown(file_extension):
        try:
            processor = MarkItDownProcessor()
            success = processor.process_document(file_path, document_metadata)
            if success:
                logger.info(f"Successfully processed {file_path} with MarkItDown")
                return
            else:
                logger.warning(f"MarkItDown processing failed for {file_path}, falling back to LangChain")
        except Exception as e:
            logger.warning(f"MarkItDown processor error for {file_path}: {e}, falling back to LangChain")
    
    # Fall back to traditional LangChain loaders
    _ingest_with_langchain(file_path, document_metadata, file_extension)

def _should_use_markitdown(file_extension: str) -> bool:
    """
    Determine if MarkItDown should be used for a given file extension.
    
    Args:
        file_extension: File extension (e.g., '.pdf', '.docx')
        
    Returns:
        True if MarkItDown should be used, False otherwise
    """
    # MarkItDown excels at these formats
    markitdown_formats = {
        '.docx', '.pptx', '.xlsx', '.doc', '.ppt', '.xls',
        '.rtf', '.odt', '.odp', '.ods', '.html', '.htm'
    }
    
    # LangChain is better for these
    langchain_formats = {'.txt', '.md'}
    
    # PDF can go either way - MarkItDown is often better for complex layouts
    if file_extension == '.pdf':
        return True
    
    return file_extension in markitdown_formats

def _ingest_with_langchain(file_path: str, document_metadata: Dict[str, Any], file_extension: str):
    """
    Process document using traditional LangChain loaders.
    
    Args:
        file_path: Path to the document
        document_metadata: Metadata for the document
        file_extension: File extension
    """
    # Select the appropriate document loader based on file extension
    if file_extension == '.pdf':
        loader = PyPDFLoader(file_path)
    elif file_extension in ['.html', '.htm']:
        loader = UnstructuredHTMLLoader(file_path)
    elif file_extension in ['.txt', '.md']:
        loader = TextLoader(file_path)
    else:
        logger.warning(f"Unsupported file type: {file_extension}. Skipping.")
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

        logger.info(f"Document split into {len(chunks)} chunks.")

        # Extract text content from LangChain's Document objects
        text_chunks = [chunk.page_content for chunk in chunks]

        # Add processing method metadata
        enhanced_metadata = {
            **document_metadata,
            "conversion_method": "langchain",
            "original_format": file_extension,
            "chunk_count": len(chunks)
        }

        # Index the text chunks in the vector store
        vector_store.index_chunks(
            document_id=document_metadata['document_id'],
            text_chunks=text_chunks,
            metadata=enhanced_metadata
        )

        logger.info(f"Successfully finished LangChain ingestion for document: {file_path}")

    except Exception as e:
        logger.error(f"Failed to ingest document {file_path} with LangChain. Error: {e}")
        raise

def ingest_audio_file(audio_path: str, document_metadata: Dict[str, Any]):
    """
    Process an audio file by transcribing it and embedding the transcript.
    
    Args:
        audio_path: Path to the audio file
        document_metadata: Metadata to attach to the indexed chunks
    """
    if not MARKITDOWN_AVAILABLE:
        logger.error("MarkItDown not available for audio transcription")
        return False
    
    try:
        processor = MarkItDownProcessor()
        success = processor.process_audio_file(audio_path, document_metadata)
        return success
    except Exception as e:
        logger.error(f"Failed to process audio file {audio_path}: {e}")
        return False

def ingest_youtube_video(youtube_url: str, document_metadata: Dict[str, Any]):
    """
    Process a YouTube video by transcribing it and embedding the transcript.
    
    Args:
        youtube_url: YouTube URL to process
        document_metadata: Metadata to attach to the indexed chunks
    """
    if not MARKITDOWN_AVAILABLE:
        logger.error("MarkItDown not available for YouTube transcription")
        return False
    
    try:
        processor = MarkItDownProcessor()
        success = processor.process_youtube_url(youtube_url, document_metadata)
        return success
    except Exception as e:
        logger.error(f"Failed to process YouTube video {youtube_url}: {e}")
        return False

def get_ingestion_capabilities() -> Dict[str, Any]:
    """
    Get information about the ingestion capabilities.
    
    Returns:
        Dictionary with ingestion system information
    """
    capabilities = {
        "langchain_formats": ['.pdf', '.html', '.htm', '.txt', '.md'],
        "markitdown_available": MARKITDOWN_AVAILABLE,
        "conversion_methods": ["langchain"]
    }
    
    if MARKITDOWN_AVAILABLE:
        try:
            processor = MarkItDownProcessor()
            processor_info = processor.get_processor_info()
            capabilities["markitdown_formats"] = processor_info["supported_formats"]
            capabilities["conversion_methods"].append("markitdown")
            capabilities["audio_transcription"] = processor_info["audio_transcription_enabled"]
            capabilities["youtube_transcription"] = processor_info["youtube_transcription_enabled"]
        except Exception as e:
            logger.warning(f"Could not get MarkItDown processor info: {e}")
    
    return capabilities
