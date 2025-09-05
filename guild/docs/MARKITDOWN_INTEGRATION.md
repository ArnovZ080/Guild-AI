# MarkItDown Integration for Guild-AI

## Overview

Guild-AI now integrates Microsoft's **MarkItDown** library to handle non-LLM-ready document formats. This integration enables the system to process real-world client data that comes in various formats like Office documents, PDFs, audio files, and even YouTube videos.

## What is MarkItDown?

[MarkItDown](https://github.com/microsoft/markitdown) is Microsoft's open-source library that converts various document formats into clean Markdown. It's designed to handle complex layouts, tables, images, and formatting that traditional text extraction methods struggle with.

## Supported Formats

### Document Formats
- **Office Documents**: DOCX, PPTX, XLSX, DOC, PPT, XLS
- **PDFs**: Complex layouts, tables, forms
- **Text Formats**: TXT, HTML, HTM, MD, RTF
- **OpenDocument**: ODT, ODP, ODS

### Media Formats
- **Audio Files**: MP3, MP4, WAV, M4A (with transcription)
- **Video Files**: MP4, AVI, MOV (with transcription)
- **YouTube URLs**: Direct video transcription

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Document      │───▶│   MarkItDown     │───▶│   Enhanced      │
│   Sources       │    │   Processor      │    │   RAG Pipeline  │
│                 │    │                  │    │                 │
│ • Google Drive  │    │ • Format         │    │ • Text          │
│ • Notion        │    │   Detection      │    │   Chunking      │
│ • OneDrive      │    │ • Conversion     │    │ • Embedding     │
│ • Dropbox       │    │ • Validation     │    │ • Vector Store  │
│ • Local Files   │    │ • Error Handling │    │ • Search        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Installation

### 1. Install MarkItDown

```bash
# Install with all optional dependencies
pip install markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]

# Or install the basic version
pip install markitdown
```

### 2. Update Guild-AI Dependencies

The MarkItDown dependency has been added to `guild/pyproject.toml`:

```toml
dependencies = [
    # ... existing dependencies ...
    "markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]",
]
```

### 3. Environment Configuration

Add MarkItDown configuration to your `.env` file:

```bash
# MarkItDown Configuration
MARKITDOWN_ENABLE_PLUGINS=true
MARKITDOWN_MAX_FILE_SIZE_MB=100
MARKITDOWN_AUDIO_TRANSCRIPTION=true
MARKITDOWN_YOUTUBE_TRANSCRIPTION=true
```

## Usage

### Basic Document Processing

```python
from guild.src.core.enhanced_rag_pipeline import get_enhanced_rag_pipeline

# Get the enhanced RAG pipeline
pipeline = get_enhanced_rag_pipeline()

# Process a document
metadata = {
    "document_id": "client_proposal",
    "provider": "gdrive",
    "data_room_id": "marketing_assets"
}

success = pipeline.process_document("path/to/document.docx", metadata)
```

### Audio Transcription

```python
# Process an audio file
success = pipeline.process_audio("path/to/meeting_recording.mp3", metadata)

# Process a YouTube video
success = pipeline.process_youtube("https://www.youtube.com/watch?v=example", metadata)
```

### Batch Processing

```python
# Process multiple files at once
files = [
    "document1.pdf",
    "presentation.pptx",
    "spreadsheet.xlsx",
    "audio.mp3"
]

results = pipeline.process_batch(files, metadata)
print(f"Processed {results['successful']}/{results['total_files']} files successfully")
```

### Enhanced RAG Search

```python
# Search with format filtering
results = pipeline.search(
    query="marketing strategy",
    top_k=10,
    filters={"conversion_method": "markitdown"}
)

# Search with multiple filters
results = pipeline.search(
    query="budget planning",
    top_k=5,
    filters={
        "original_format": [".docx", ".pdf"],
        "provider": "gdrive"
    }
)
```

## Configuration Options

### MarkItDown Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `MARKITDOWN_ENABLE_PLUGINS` | `true` | Enable MarkItDown plugins for extended format support |
| `MARKITDOWN_MAX_FILE_SIZE_MB` | `100` | Maximum file size in MB for processing |
| `MARKITDOWN_AUDIO_TRANSCRIPTION` | `true` | Enable audio file transcription |
| `MARKITDOWN_YOUTUBE_TRANSCRIPTION` | `true` | Enable YouTube video transcription |

### Supported File Extensions

```python
MARKITDOWN_SUPPORTED_FORMATS = [
    "pdf", "docx", "pptx", "xlsx", "doc", "ppt", "xls",
    "txt", "html", "htm", "md", "rtf", "odt", "odp", "ods"
]
```

## Integration Points

### 1. Enhanced Ingestion Pipeline

The `guild/src/core/ingestion.py` module now automatically routes documents to the appropriate processor:

- **MarkItDown**: For complex formats (DOCX, PPTX, PDF, etc.)
- **LangChain**: For simple formats (TXT, MD, HTML)

### 2. Enhanced RAG Pipeline

The `guild/src/core/enhanced_rag_pipeline.py` provides a unified interface for:

- Document processing
- Audio transcription
- YouTube video processing
- Batch operations
- Enhanced search with filtering

### 3. Updated Tools Module

The `guild/src/core/tools.py` module now includes:

- Enhanced RAG search with MarkItDown metadata
- Audio and video processing functions
- RAG capabilities information

## Error Handling

### Graceful Fallbacks

The system includes multiple fallback mechanisms:

1. **MarkItDown → LangChain**: If MarkItDown fails, falls back to traditional LangChain loaders
2. **Enhanced → Basic**: If the enhanced pipeline fails, falls back to basic vector store operations
3. **Validation**: File validation before processing to catch issues early

### Common Error Scenarios

```python
# File too large
if file_size_mb > settings.MARKITDOWN_MAX_FILE_SIZE_MB:
    logger.error(f"File size exceeds limit: {file_size_mb} MB")

# Unsupported format
if not processor.is_supported_format(file_path):
    logger.warning(f"Format not supported: {file_extension}")

# Conversion failure
if not markdown_content:
    logger.warning("No content extracted, falling back to LangChain")
```

## Performance Considerations

### File Size Limits

- **Default Limit**: 100 MB per file
- **Large Files**: Consider splitting very large documents
- **Memory Usage**: MarkItDown processes files in memory

### Processing Time

- **Small Files** (< 1 MB): ~1-5 seconds
- **Medium Files** (1-10 MB): ~5-30 seconds
- **Large Files** (10-100 MB): ~30 seconds - 5 minutes

### Batch Processing

- **Parallel Processing**: Files are processed sequentially for stability
- **Memory Management**: Temporary files are cleaned up automatically
- **Progress Tracking**: Batch operations provide detailed progress information

## Testing

### Run the Integration Test

```bash
cd guild/examples
python markitdown_integration_example.py
```

### Test Specific Features

```python
# Test document processing
from guild.src.core.tools import process_document_enhanced
success = process_document_enhanced("test.docx", metadata)

# Test audio processing
from guild.src.core.tools import process_audio_file
success = process_audio_file("test.mp3", metadata)

# Test YouTube processing
from guild.src.core.tools import process_youtube_video
success = process_youtube_video("https://youtube.com/watch?v=test", metadata)
```

## Troubleshooting

### Common Issues

#### 1. MarkItDown Not Available

```bash
# Error: MarkItDown is not available
pip install markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]
```

#### 2. File Size Too Large

```bash
# Increase file size limit in .env
MARKITDOWN_MAX_FILE_SIZE_MB=500
```

#### 3. Audio/Video Processing Fails

```bash
# Check if transcription is enabled
MARKITDOWN_AUDIO_TRANSCRIPTION=true
MARKITDOWN_YOUTUBE_TRANSCRIPTION=true
```

#### 4. Memory Issues

- Reduce `MARKITDOWN_MAX_FILE_SIZE_MB`
- Process files individually instead of in batch
- Monitor system memory usage

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Check processor capabilities
from guild.src.core.tools import get_rag_capabilities
capabilities = get_rag_capabilities()
print(capabilities)
```

## Migration Guide

### From Basic RAG to Enhanced RAG

#### Before (Basic RAG)

```python
from guild.src.core import ingestion

# Basic document processing
ingestion.ingest_document("document.pdf", metadata)

# Basic search
from guild.src.core.tools import rag_search
results = rag_search("query")
```

#### After (Enhanced RAG)

```python
from guild.src.core.enhanced_rag_pipeline import get_enhanced_rag_pipeline

# Enhanced document processing
pipeline = get_enhanced_rag_pipeline()
pipeline.process_document("document.docx", metadata)

# Enhanced search with filtering
results = pipeline.search("query", filters={"format": "docx"})
```

### Backward Compatibility

All existing code continues to work:

- `ingestion.ingest_document()` → Enhanced with MarkItDown fallback
- `tools.rag_search()` → Enhanced with filtering capabilities
- Vector store operations remain unchanged

## Future Enhancements

### Planned Features

1. **Web Scraping Integration**: Process web pages directly
2. **Image OCR**: Extract text from images and scanned documents
3. **Table Extraction**: Better handling of complex tables
4. **Multi-language Support**: Process documents in various languages
5. **Streaming Processing**: Handle very large files without memory issues

### Contributing

To contribute to the MarkItDown integration:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## Support

### Getting Help

- **Documentation**: This file and the main Guild-AI docs
- **Examples**: Check `guild/examples/markitdown_integration_example.py`
- **Issues**: Report bugs on the GitHub repository
- **Discussions**: Use GitHub Discussions for questions

### Resources

- [MarkItDown GitHub Repository](https://github.com/microsoft/markitdown)
- [Guild-AI Documentation](README.md)
- [RAG Pipeline Architecture](docs/ARCHITECTURE.md)

---

**Note**: The MarkItDown integration significantly enhances Guild-AI's ability to handle real-world client data. It automatically detects document formats and applies the best processing method, making the system much more robust for production use.
