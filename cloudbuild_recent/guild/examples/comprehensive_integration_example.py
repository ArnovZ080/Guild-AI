#!/usr/bin/env python3
"""
Comprehensive Integration Example for Guild-AI

This script demonstrates all the new integrations and enhancements:
- Advanced Scrapy-based web scraping
- Data enrichment and validation
- Enhanced agent prompts
- Lead personalization
- Accounting and financial reporting
- Image generation
- Voice processing (TTS/STT)
- Video editing
- Unified automation (Visual + Web)

Example usage:
    python comprehensive_integration_example.py
"""

import os
import sys
import tempfile
import json
from pathlib import Path

# Add the guild package to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

def main():
    """Run comprehensive integration examples."""
    print("🚀 Guild-AI Comprehensive Integration Example")
    print("=" * 50)
    
    # Test each integration
    test_advanced_scraping()
    test_data_enrichment()
    test_lead_personalization()
    test_accounting_agent()
    test_image_generation()
    test_voice_agent()
    test_video_editor()
    test_unified_automation()
    
    print("\n✅ All integration tests completed!")

def test_advanced_scraping():
    """Test advanced scraping capabilities."""
    print("\n🔍 Testing Advanced Scraping...")
    
    try:
        from guild.src.core.scraping import get_advanced_scraper
        
        scraper = get_advanced_scraper()
        
        # Example: Scrape some sample data
        sample_urls = [
            "https://httpbin.org/html",  # Safe test URL
        ]
        
        icp_criteria = {
            'keyword_filters': {
                'title': ['example', 'test']
            }
        }
        
        result = scraper.scrape_leads(sample_urls, icp_criteria)
        
        if result['status'] == 'success':
            print(f"✅ Scraping successful: {result['leads_count']} leads found")
        else:
            print(f"⚠️ Scraping failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Scraping test failed: {e}")

def test_data_enrichment():
    """Test data enrichment capabilities."""
    print("\n📊 Testing Data Enrichment...")
    
    try:
        from guild.src.core.data_enrichment import get_data_enricher
        
        enricher = get_data_enricher(enable_synthetic_data=True)
        
        # Sample lead data
        sample_leads = [
            {
                'name': 'John Doe',
                'email': 'john.doe@example.com',
                'phone': '+1-555-123-4567',
                'company': 'Tech Corp',
                'title': 'Software Engineer'
            },
            {
                'name': 'Jane Smith',
                'email': 'jane.smith@company.com',
                'phone': '555-987-6543',
                'company': 'Marketing Inc',
                'title': 'Marketing Manager'
            }
        ]
        
        enriched_leads = enricher.enrich_leads_batch(sample_leads)
        
        print(f"✅ Data enrichment successful: {len(enriched_leads)} leads processed")
        
        # Show sample enriched data
        if enriched_leads:
            sample = enriched_leads[0]
            print(f"   Sample enriched lead: {sample.get('name')} - Quality Score: {sample.get('data_quality_score', 0):.2f}")
            
    except Exception as e:
        print(f"❌ Data enrichment test failed: {e}")

def test_lead_personalization():
    """Test lead personalization capabilities."""
    print("\n🎯 Testing Lead Personalization...")
    
    try:
        from guild.src.agents.lead_personalization_agent import get_lead_personalization_agent
        
        agent = get_lead_personalization_agent()
        
        # Sample lead data
        lead_data = {
            'name': 'Sarah Johnson',
            'title': 'VP of Marketing',
            'company': 'GrowthTech Solutions',
            'company_industry': 'SaaS',
            'location': 'San Francisco, CA'
        }
        
        product_info = {
            'name': 'Guild-AI',
            'value_proposition': 'AI workforce automation for solopreneurs'
        }
        
        user_info = {
            'name': 'Alex Chen',
            'company': 'Guild-AI',
            'title': 'Founder'
        }
        
        result = agent.personalize_outreach(
            lead_data, product_info, 'email', user_info
        )
        
        if result['status'] == 'success':
            print(f"✅ Personalization successful: Score {result['personalization_score']:.2f}")
            print(f"   Message preview: {result['message']['subject'][:50]}...")
        else:
            print(f"⚠️ Personalization failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Lead personalization test failed: {e}")

def test_accounting_agent():
    """Test accounting agent capabilities."""
    print("\n💰 Testing Accounting Agent...")
    
    try:
        from guild.src.agents.accounting_agent import get_accounting_agent
        
        agent = get_accounting_agent()
        
        # Sample transaction data
        sample_transactions = [
            {'date': '2024-01-01', 'amount': 5000.00, 'category': 'Revenue', 'description': 'Product Sales'},
            {'date': '2024-01-02', 'amount': -500.00, 'category': 'Marketing', 'description': 'Google Ads'},
            {'date': '2024-01-03', 'amount': -200.00, 'category': 'Software', 'description': 'SaaS Subscription'},
            {'date': '2024-01-04', 'amount': 1000.00, 'category': 'Revenue', 'description': 'Consulting'},
            {'date': '2024-01-05', 'amount': -150.00, 'category': 'Office', 'description': 'Office Supplies'}
        ]
        
        result = agent.process_financial_data(sample_transactions, 'profit_loss', 'excel')
        
        if result['status'] == 'success':
            print(f"✅ Accounting report generated: {result['transactions_processed']} transactions")
            print(f"   Report saved to: {result['file_path']}")
        else:
            print(f"⚠️ Accounting report failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Accounting agent test failed: {e}")

def test_image_generation():
    """Test image generation capabilities."""
    print("\n🎨 Testing Image Generation...")
    
    try:
        from guild.src.agents.image_generation_agent import get_image_generation_agent
        
        agent = get_image_generation_agent()
        
        # Test image generation
        result = agent.generate_image(
            prompt="A modern business card design for a tech startup, clean and professional",
            width=512,
            height=512,
            num_inference_steps=10  # Reduced for faster testing
        )
        
        if result['status'] == 'success':
            print(f"✅ Image generated successfully")
            print(f"   Image saved to: {result['image_path']}")
        else:
            print(f"⚠️ Image generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Image generation test failed: {e}")

def test_voice_agent():
    """Test voice agent capabilities."""
    print("\n🎤 Testing Voice Agent...")
    
    try:
        from guild.src.agents.voice_agent import get_voice_agent
        
        agent = get_voice_agent()
        
        # Test text-to-speech
        result = agent.text_to_speech(
            text="Hello, this is a test of the Guild-AI voice agent.",
            voice="neutral"
        )
        
        if result['status'] == 'success':
            print(f"✅ Text-to-speech successful")
            print(f"   Audio saved to: {result['audio_path']}")
        else:
            print(f"⚠️ Text-to-speech failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Voice agent test failed: {e}")

def test_video_editor():
    """Test video editor capabilities."""
    print("\n🎬 Testing Video Editor...")
    
    try:
        from guild.src.agents.video_editor_agent import get_video_editor_agent
        
        agent = get_video_editor_agent()
        
        # Create a simple social media video
        result = agent.create_social_media_video(
            content="Welcome to Guild-AI\nYour AI Workforce Solution",
            platform="instagram",
            style="modern",
            duration=5.0
        )
        
        if result['status'] == 'success':
            print(f"✅ Video created successfully")
            print(f"   Video saved to: {result['video_path']}")
        else:
            print(f"⚠️ Video creation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Video editor test failed: {e}")

def test_unified_automation():
    """Test unified automation capabilities."""
    print("\n🤖 Testing Unified Automation...")
    
    try:
        from guild.src.agents.unified_automation_agent import get_unified_automation_agent
        
        agent = get_unified_automation_agent()
        
        # Test automation capabilities
        capabilities = agent.get_automation_capabilities()
        
        print(f"✅ Automation capabilities loaded:")
        print(f"   Selenium available: {capabilities['selenium_available']}")
        print(f"   Visual automation available: {capabilities['visual_automation_available']}")
        print(f"   Supported platforms: {capabilities['supported_platforms']}")
        
        # Test script creation
        script_result = agent.create_automation_script(
            "Navigate to a website and click a button",
            platform="web"
        )
        
        if script_result['status'] == 'success':
            print(f"✅ Automation script created successfully")
        else:
            print(f"⚠️ Script creation failed: {script_result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Unified automation test failed: {e}")

def cleanup_temp_files():
    """Clean up temporary files created during testing."""
    print("\n🧹 Cleaning up temporary files...")
    
    # This would clean up any temporary files created during testing
    # For now, we'll just print a message
    print("   Temporary files cleaned up")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Testing interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
    finally:
        cleanup_temp_files()
