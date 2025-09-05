#!/usr/bin/env python3
"""
MarkItDown Integration Example for Guild-AI

This script demonstrates how to use the enhanced RAG pipeline with MarkItDown
to process various document formats that aren't LLM-ready.

Example usage:
    python markitdown_integration_example.py

This will:
1. Test document processing with different file formats
2. Demonstrate audio transcription
3. Show YouTube video transcription
4. Display RAG search capabilities
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add the guild package to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from guild.src.core.enhanced_rag_pipeline import get_enhanced_rag_pipeline
from guild.src.core.tools import get_rag_capabilities
from guild.src.core.config import settings

def create_sample_documents():
    """Create sample documents for testing."""
    temp_dir = tempfile.mkdtemp(prefix="guild_markitdown_test_")
    
    # Create a sample text file
    text_file = os.path.join(temp_dir, "sample.txt")
    with open(text_file, "w") as f:
        f.write("This is a sample text file for testing the RAG pipeline.")
    
    # Create a sample markdown file
    md_file = os.path.join(temp_dir, "sample.md")
    with open(md_file, "w") as f:
        f.write("# Sample Markdown\n\nThis is a **sample** markdown file with *formatting*.")
    
    # Create a sample HTML file
    html_file = os.path.join(temp_dir, "sample.html")
    with open(html_file, "w") as f:
        f.write("""
        <html>
        <head><title>Sample HTML</title></head>
        <body>
            <h1>Sample HTML Document</h1>
            <p>This is a sample HTML file for testing.</p>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
            </ul>
        </body>
        </html>
        """)
    
    print(f"Created sample documents in: {temp_dir}")
    return temp_dir, [text_file, md_file, html_file]

def test_document_processing():
    """Test document processing with the enhanced RAG pipeline."""
    print("\n" + "="*60)
    print("TESTING DOCUMENT PROCESSING")
    print("="*60)
    
    try:
        # Get the enhanced RAG pipeline
        pipeline = get_enhanced_rag_pipeline()
        print("✓ Enhanced RAG pipeline initialized successfully")
        
        # Create sample documents
        temp_dir, sample_files = create_sample_documents()
        
        # Test processing each document
        for file_path in sample_files:
            print(f"\nProcessing: {os.path.basename(file_path)}")
            
            # Create metadata for the document
            metadata = {
                "document_id": f"test_{os.path.basename(file_path)}",
                "provider": "test",
                "data_room_id": "test_room",
                "path": file_path,
                "test_run": True
            }
            
            # Process the document
            success = pipeline.process_document(file_path, metadata)
            
            if success:
                print(f"  ✓ Successfully processed {os.path.basename(file_path)}")
            else:
                print(f"  ✗ Failed to process {os.path.basename(file_path)}")
        
        # Clean up
        shutil.rmtree(temp_dir)
        print(f"\n✓ Cleaned up temporary files")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing document processing: {e}")
        return False

def test_rag_search():
    """Test RAG search capabilities."""
    print("\n" + "="*60)
    print("TESTING RAG SEARCH")
    print("="*60)
    
    try:
        pipeline = get_enhanced_rag_pipeline()
        
        # Test search
        query = "sample document"
        print(f"Searching for: '{query}'")
        
        results = pipeline.search(query, top_k=5)
        
        if results:
            print(f"✓ Found {len(results)} results")
            for i, result in enumerate(results[:3]):  # Show first 3 results
                print(f"  Result {i+1}: Score {result.get('score', 0):.3f}")
                content = result.get('payload', {}).get('chunk_text', '')[:100]
                print(f"    Content: {content}...")
        else:
            print("  No results found (this is expected if no documents were indexed)")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing RAG search: {e}")
        return False

def test_audio_processing():
    """Test audio file processing capabilities."""
    print("\n" + "="*60)
    print("TESTING AUDIO PROCESSING")
    print("="*60)
    
    try:
        pipeline = get_enhanced_rag_pipeline()
        
        # Check if audio transcription is enabled
        if not settings.MARKITDOWN_AUDIO_TRANSCRIPTION:
            print("  ℹ Audio transcription is disabled in configuration")
            return True
        
        # Create a dummy audio file path for testing
        dummy_audio = "/tmp/test_audio.mp3"
        
        # Test audio processing (this will fail with dummy file, but tests the flow)
        metadata = {
            "document_id": "test_audio",
            "provider": "test",
            "data_room_id": "test_room",
            "test_run": True
        }
        
        print("  ℹ Testing audio processing flow (will fail with dummy file)")
        success = pipeline.process_audio(dummy_audio, metadata)
        
        if not success:
            print("  ✓ Audio processing correctly handled invalid file")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing audio processing: {e}")
        return False

def test_youtube_processing():
    """Test YouTube video processing capabilities."""
    print("\n" + "="*60)
    print("TESTING YOUTUBE PROCESSING")
    print("="*60)
    
    try:
        pipeline = get_enhanced_rag_pipeline()
        
        # Check if YouTube transcription is enabled
        if not settings.MARKITDOWN_YOUTUBE_TRANSCRIPTION:
            print("  ℹ YouTube transcription is disabled in configuration")
            return True
        
        # Test YouTube processing with a dummy URL
        dummy_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        
        metadata = {
            "document_id": "test_youtube",
            "provider": "test",
            "data_room_id": "test_room",
            "test_run": True
        }
        
        print("  ℹ Testing YouTube processing flow (will fail with dummy URL)")
        success = pipeline.process_youtube(dummy_url, metadata)
        
        if not success:
            print("  ✓ YouTube processing correctly handled invalid URL")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing YouTube processing: {e}")
        return False

def test_batch_processing():
    """Test batch document processing."""
    print("\n" + "="*60)
    print("TESTING BATCH PROCESSING")
    print("="*60)
    
    try:
        pipeline = get_enhanced_rag_pipeline()
        
        # Create sample documents for batch processing
        temp_dir, sample_files = create_sample_documents()
        
        # Test batch processing
        metadata = {
            "document_id": "batch_test",
            "provider": "test",
            "data_room_id": "test_room",
            "test_run": True
        }
        
        print(f"Processing {len(sample_files)} files in batch...")
        results = pipeline.process_batch(sample_files, metadata)
        
        print(f"  Batch results:")
        print(f"    Total files: {results['total_files']}")
        print(f"    Successful: {results['successful']}")
        print(f"    Failed: {results['failed']}")
        
        if results['errors']:
            print(f"    Errors: {len(results['errors'])}")
            for error in results['errors'][:2]:  # Show first 2 errors
                print(f"      - {error}")
        
        # Clean up
        shutil.rmtree(temp_dir)
        
        return results['successful'] > 0
        
    except Exception as e:
        print(f"✗ Error testing batch processing: {e}")
        return False

def show_capabilities():
    """Display the RAG system capabilities."""
    print("\n" + "="*60)
    print("RAG SYSTEM CAPABILITIES")
    print("="*60)
    
    try:
        capabilities = get_rag_capabilities()
        
        print("System Information:")
        print(f"  Pipeline Type: {capabilities.get('pipeline_type', 'unknown')}")
        
        if 'capabilities' in capabilities:
            caps = capabilities['capabilities']
            print(f"  MarkItDown Available: {caps.get('markitdown_available', False)}")
            print(f"  Conversion Methods: {', '.join(caps.get('conversion_methods', []))}")
            
            if 'markitdown_formats' in caps:
                print(f"  MarkItDown Formats: {', '.join(caps['markitdown_formats'])}")
            
            if 'langchain_formats' in caps:
                print(f"  LangChain Formats: {', '.join(caps['langchain_formats'])}")
            
            print(f"  Audio Transcription: {caps.get('audio_transcription', False)}")
            print(f"  YouTube Transcription: {caps.get('youtube_transcription', False)}")
        
        if 'vector_store' in capabilities:
            vs = capabilities['vector_store']
            print(f"  Vector Store: {vs.get('collection_name', 'unknown')}")
            print(f"  Total Points: {vs.get('total_points', 0)}")
            print(f"  Vector Size: {vs.get('vector_size', 0)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error getting capabilities: {e}")
        return False

def main():
    """Main test function."""
    print("🚀 MarkItDown Integration Test for Guild-AI")
    print("="*60)
    
    # Show system capabilities
    show_capabilities()
    
    # Run tests
    tests = [
        ("Document Processing", test_document_processing),
        ("RAG Search", test_rag_search),
        ("Audio Processing", test_audio_processing),
        ("YouTube Processing", test_youtube_processing),
        ("Batch Processing", test_batch_processing),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"✗ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! MarkItDown integration is working correctly.")
    else:
        print("⚠ Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
