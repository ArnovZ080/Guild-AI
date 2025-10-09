#!/usr/bin/env python3
"""
Test MarkItDown Processing

This script tests the MarkItDown integration with various document formats.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add the guild package to the path
sys.path.insert(0, str(Path(__file__).parent / "guild" / "src"))

def test_markitdown_processor():
    """Test the MarkItDown processor with sample content."""
    
    try:
        from guild.src.core.markitdown_processor import MarkItDownProcessor
        print("✅ MarkItDown processor imported successfully")
        
        # Test processor initialization
        processor = MarkItDownProcessor()
        print("✅ MarkItDown processor initialized")
        
        # Get supported formats
        supported_formats = processor.get_supported_formats()
        print(f"✅ Supported formats: {', '.join(supported_formats)}")
        
        # Test processor info
        info = processor.get_processor_info()
        print(f"✅ Processor info: {info}")
        
        return True
        
    except ImportError as e:
        print(f"❌ MarkItDown not available: {e}")
        print("Install with: pip install markitdown[pdf,docx,pptx,xlsx,audio-transcription,youtube-transcription]")
        return False
    except Exception as e:
        print(f"❌ Error testing MarkItDown: {e}")
        return False

def test_sample_document():
    """Test with a sample text document."""
    
    try:
        from guild.src.core.markitdown_processor import MarkItDownProcessor
        
        # Create a sample text file
        sample_content = """
# Sample Business Document

## Executive Summary
This is a sample business document to test MarkItDown processing.

## Key Points
- Point 1: Testing document conversion
- Point 2: Verifying text extraction
- Point 3: Ensuring proper formatting

## Conclusion
The MarkItDown processor should successfully convert this document.
        """
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(sample_content)
            temp_path = f.name
        
        try:
            processor = MarkItDownProcessor()
            markdown_content = processor.convert_to_markdown(temp_path)
            
            if markdown_content:
                print("✅ Sample document processed successfully")
                print(f"✅ Content length: {len(markdown_content)} characters")
                print("✅ First 200 characters:")
                print(markdown_content[:200] + "...")
                return True
            else:
                print("❌ No content extracted from sample document")
                return False
                
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        print(f"❌ Error testing sample document: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing MarkItDown Integration")
    print("=" * 50)
    
    # Test 1: Processor initialization
    print("\n1. Testing MarkItDown Processor Initialization")
    processor_ok = test_markitdown_processor()
    
    # Test 2: Sample document processing
    print("\n2. Testing Sample Document Processing")
    document_ok = test_sample_document()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Processor Initialization: {'✅ PASS' if processor_ok else '❌ FAIL'}")
    print(f"   Document Processing: {'✅ PASS' if document_ok else '❌ FAIL'}")
    
    if processor_ok and document_ok:
        print("\n🎉 All tests passed! MarkItDown is ready for use.")
        return True
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
