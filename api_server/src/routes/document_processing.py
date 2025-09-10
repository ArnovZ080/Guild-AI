"""
Document Processing API Routes for Guild-AI

Handles document upload, processing with MarkItDown, and content extraction.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Dict, Any, List
import tempfile
import os
import uuid
from pathlib import Path

router = APIRouter(
    prefix="/documents",
    tags=["Document Processing"],
)

@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    extract_metadata: bool = Form(True)
):
    """
    Process a document using MarkItDown and return the extracted content.
    
    Args:
        file: The document file to process
        extract_metadata: Whether to extract metadata from the document
        
    Returns:
        Dictionary with processed content and metadata
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file size (limit to 10MB for now)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Create temporary file
        file_extension = Path(file.filename).suffix.lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            # Process with MarkItDown
            from markitdown import MarkItDown
            
            md_converter = MarkItDown()
            result = md_converter.convert(temp_path)
            
            if not result or not result.text_content:
                raise HTTPException(status_code=400, detail="No content could be extracted from the document")
            
            # Prepare response
            processed_content = result.text_content.strip()
            
            response_data = {
                "document_id": str(uuid.uuid4()),
                "filename": file.filename,
                "file_size": file_size,
                "content_length": len(processed_content),
                "content": processed_content,
                "processing_method": "markitdown",
                "success": True
            }
            
            # Add metadata if requested
            if extract_metadata:
                response_data["metadata"] = {
                    "original_format": file_extension,
                    "mime_type": file.content_type,
                    "processing_timestamp": str(uuid.uuid4()),  # Simplified timestamp
                    "extraction_quality": "high" if len(processed_content) > 100 else "medium"
                }
            
            return response_data
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except ImportError:
        raise HTTPException(status_code=500, detail="MarkItDown not available. Please install markitdown package.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/supported-formats")
async def get_supported_formats():
    """
    Get list of supported document formats.
    
    Returns:
        Dictionary with supported formats and their descriptions
    """
    try:
        from markitdown import MarkItDown
        
        # Get supported formats from MarkItDown
        md_converter = MarkItDown()
        
        # Common supported formats
        supported_formats = {
            "pdf": "Portable Document Format",
            "docx": "Microsoft Word Document",
            "doc": "Microsoft Word Document (Legacy)",
            "pptx": "Microsoft PowerPoint Presentation",
            "ppt": "Microsoft PowerPoint Presentation (Legacy)",
            "xlsx": "Microsoft Excel Spreadsheet",
            "xls": "Microsoft Excel Spreadsheet (Legacy)",
            "txt": "Plain Text File",
            "html": "HTML Document",
            "htm": "HTML Document",
            "md": "Markdown Document",
            "rtf": "Rich Text Format",
            "odt": "OpenDocument Text",
            "odp": "OpenDocument Presentation",
            "ods": "OpenDocument Spreadsheet"
        }
        
        return {
            "success": True,
            "supported_formats": supported_formats,
            "total_formats": len(supported_formats),
            "processing_engine": "MarkItDown",
            "max_file_size_mb": 10
        }
        
    except ImportError:
        return {
            "success": False,
            "error": "MarkItDown not available",
            "supported_formats": {},
            "total_formats": 0
        }

@router.post("/test-processing")
async def test_processing():
    """
    Test document processing with sample content.
    
    Returns:
        Dictionary with test results
    """
    try:
        from markitdown import MarkItDown
        
        # Create sample content
        sample_content = """
        # Test Document Processing
        
        This is a **test document** to verify that MarkItDown processing is working correctly.
        
        ## Features Tested:
        - Text extraction
        - Formatting preservation
        - Metadata extraction
        
        ## Results:
        - ✅ Processing successful
        - ✅ Content extracted
        - ✅ Ready for integration
        """
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
            temp_file.write(sample_content)
            temp_path = temp_file.name
        
        try:
            # Process with MarkItDown
            md_converter = MarkItDown()
            result = md_converter.convert(temp_path)
            
            if result and result.text_content:
                return {
                    "success": True,
                    "message": "Document processing test successful",
                    "test_content": result.text_content.strip(),
                    "content_length": len(result.text_content),
                    "processing_method": "markitdown"
                }
            else:
                return {
                    "success": False,
                    "message": "No content extracted from test document"
                }
                
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except ImportError:
        return {
            "success": False,
            "message": "MarkItDown not available. Please install markitdown package."
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error during test: {str(e)}"
        }
