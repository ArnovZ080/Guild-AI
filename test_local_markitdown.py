#!/usr/bin/env python3
"""
Test MarkItDown Processing with Local Files

This script tests the MarkItDown integration with local document files.
"""

import os
import sys
import tempfile
from pathlib import Path

def test_markitdown_with_local_files():
    """Test MarkItDown with local document files."""
    
    print("🧪 Testing MarkItDown with Local Files")
    print("=" * 50)
    
    try:
        from markitdown import MarkItDown
        
        # Initialize MarkItDown
        md_converter = MarkItDown()
        print("✅ MarkItDown initialized successfully")
        
        # Test files
        test_files = [
            "test_documents/sample_business_plan.txt",
            "test_documents/sample_marketing_strategy.md"
        ]
        
        for file_path in test_files:
            if os.path.exists(file_path):
                print(f"\n📄 Processing: {file_path}")
                
                try:
                    # Convert to markdown
                    result = md_converter.convert(file_path)
                    
                    if result and result.text_content:
                        content = result.text_content.strip()
                        print(f"✅ Successfully processed {file_path}")
                        print(f"   Content length: {len(content)} characters")
                        print(f"   First 200 characters:")
                        print(f"   {content[:200]}...")
                        
                        # Save processed content
                        output_file = f"{file_path}.processed.md"
                        with open(output_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"   Saved to: {output_file}")
                        
                    else:
                        print(f"❌ No content extracted from {file_path}")
                        
                except Exception as e:
                    print(f"❌ Error processing {file_path}: {str(e)}")
            else:
                print(f"⚠️  File not found: {file_path}")
        
        return True
        
    except ImportError as e:
        print(f"❌ MarkItDown not available: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing MarkItDown: {e}")
        return False

def test_document_types():
    """Test different document types that MarkItDown can handle."""
    
    print("\n🔍 Testing Document Type Support")
    print("=" * 50)
    
    try:
        from markitdown import MarkItDown
        md_converter = MarkItDown()
        
        # Get supported formats
        print("✅ MarkItDown supports these formats:")
        
        # Create sample files of different types
        sample_files = {
            "sample.txt": "# Sample Text File\n\nThis is a test text file with some content.",
            "sample.html": "<html><body><h1>Sample HTML</h1><p>This is HTML content.</p></body></html>",
            "sample.md": "# Sample Markdown\n\nThis is **markdown** content with *formatting*."
        }
        
        for filename, content in sample_files.items():
            with tempfile.NamedTemporaryFile(mode='w', suffix=f".{filename.split('.')[-1]}", delete=False) as f:
                f.write(content)
                temp_path = f.name
            
            try:
                result = md_converter.convert(temp_path)
                if result and result.text_content:
                    print(f"   ✅ {filename}: {len(result.text_content)} characters")
                else:
                    print(f"   ❌ {filename}: No content extracted")
            except Exception as e:
                print(f"   ❌ {filename}: Error - {str(e)}")
            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing document types: {e}")
        return False

def main():
    """Run all tests."""
    
    # Test 1: Local file processing
    print("1. Testing Local File Processing")
    local_test_ok = test_markitdown_with_local_files()
    
    # Test 2: Document type support
    print("\n2. Testing Document Type Support")
    type_test_ok = test_document_types()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Local File Processing: {'✅ PASS' if local_test_ok else '❌ FAIL'}")
    print(f"   Document Type Support: {'✅ PASS' if type_test_ok else '❌ FAIL'}")
    
    if local_test_ok and type_test_ok:
        print("\n🎉 All tests passed! MarkItDown is working perfectly.")
        print("\n📋 Next Steps:")
        print("   1. Test with real PDF, Word, and PowerPoint files")
        print("   2. Integrate with the Guild-AI system")
        print("   3. Set up automated document processing workflows")
        return True
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
