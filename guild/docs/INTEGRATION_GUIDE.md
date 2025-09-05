# Guild-AI Integration Guide

## Overview

This guide documents all the integrations and enhancements implemented in Guild-AI based on the comprehensive integration reports. These integrations significantly expand Guild-AI's capabilities while maintaining cost-effectiveness through the use of open-source tools and local processing.

## 🚀 New Integrations Implemented

### 1. Advanced Web Scraping with Scrapy

**Location**: `guild/src/core/scraping/`

**Features**:
- Robust, scalable web scraping using Scrapy framework
- Data enrichment and validation pipeline
- ICP (Ideal Customer Profile) filtering
- Export to multiple formats (JSON, CSV, Excel)
- Ethical scraping with rate limiting and robots.txt compliance

**Usage**:
```python
from guild.src.core.scraping import get_advanced_scraper

scraper = get_advanced_scraper()
result = scraper.scrape_leads(
    urls=["https://example.com"],
    icp_criteria={'keyword_filters': {'title': ['engineer']}}
)
```

**Dependencies**: `scrapy`, `beautifulsoup4`, `pandas`, `phonenumbers`, `email-validator`

### 2. Data Enrichment System

**Location**: `guild/src/core/data_enrichment.py`

**Features**:
- Phone number validation and formatting
- Email validation and normalization
- Text cleaning and standardization
- HTML content extraction
- Data quality scoring
- Synthetic data generation (for development/testing)

**Usage**:
```python
from guild.src.core.data_enrichment import get_data_enricher

enricher = get_data_enricher()
enriched_leads = enricher.enrich_leads_batch(raw_leads)
```

### 3. Enhanced Agent Prompts

**Location**: `guild/src/agents/enhanced_prompts.py`

**Features**:
- Refined prompts based on commercial LLM best practices
- Enhanced precision and ethical considerations
- Clear role definitions and constraints
- Detailed output formats
- Self-correction mechanisms

**Available Prompts**:
- Scraper Agent (enhanced with ethical guidelines)
- Content Strategist Agent (holistic planning)
- Lead Personalization Agent (sales psychology)
- Social Media Agent (platform-specific content)
- Business Strategist Agent (strategic thinking)
- Accounting Agent (financial processing)
- Image Generation Agent (visual content)
- Voice Agent (audio processing)
- Video Editor Agent (video production)

### 4. Lead Personalization Agent

**Location**: `guild/src/agents/lead_personalization_agent.py`

**Features**:
- Sales psychology-based message generation
- Platform-specific outreach (email, LinkedIn, cold calls)
- Hyper-personalized content
- Psychological principle application (reciprocity, authority, social proof)
- Personalization scoring

**Usage**:
```python
from guild.src.agents.lead_personalization_agent import get_lead_personalization_agent

agent = get_lead_personalization_agent()
result = agent.personalize_outreach(lead_data, product_info, 'email', user_info)
```

### 5. Accounting Agent

**Location**: `guild/src/agents/accounting_agent.py`

**Features**:
- Financial data processing and validation
- Multiple report types (P&L, cash flow, expense reports)
- Excel/CSV export with formatting
- Financial health analysis
- Budget template generation
- Automated calculations and summaries

**Usage**:
```python
from guild.src.agents.accounting_agent import get_accounting_agent

agent = get_accounting_agent()
result = agent.process_financial_data(transactions, 'profit_loss', 'excel')
```

**Dependencies**: `pandas`, `openpyxl`

### 6. Image Generation Agent

**Location**: `guild/src/agents/image_generation_agent.py`

**Features**:
- Local image generation using Hugging Face diffusers
- Social media optimized images
- Product mockups
- Infographic generation
- Batch processing
- Prompt enhancement

**Usage**:
```python
from guild.src.agents.image_generation_agent import get_image_generation_agent

agent = get_image_generation_agent()
result = agent.generate_image("A modern business card design", width=512, height=512)
```

**Dependencies**: `diffusers`, `transformers`, `torch`

### 7. Voice Agent

**Location**: `guild/src/agents/voice_agent.py`

**Features**:
- Text-to-speech using transformers
- Speech-to-text with Whisper
- Meeting transcription with speaker identification
- Voiceover creation with background music
- Audio processing and enhancement

**Usage**:
```python
from guild.src.agents.voice_agent import get_voice_agent

agent = get_voice_agent()
result = agent.text_to_speech("Hello, this is a test", voice="neutral")
```

**Dependencies**: `transformers`, `soundfile`, `librosa`

### 8. Video Editor Agent

**Location**: `guild/src/agents/video_editor_agent.py`

**Features**:
- Slideshow creation from images
- Social media video generation
- Text overlay addition
- Video trimming and editing
- Audio synchronization
- Platform-specific optimization

**Usage**:
```python
from guild.src.agents.video_editor_agent import get_video_editor_agent

agent = get_video_editor_agent()
result = agent.create_slideshow_video(image_paths, audio_path)
```

**Dependencies**: `moviepy`

### 9. Enhanced Visual Automation

**Location**: `guild/src/core/automation/`

**Features**:
- Selenium WebDriver integration
- Web form automation
- Data extraction
- Screenshot capture
- JavaScript execution
- Unified automation combining visual and web automation

**Usage**:
```python
from guild.src.agents.unified_automation_agent import get_unified_automation_agent

agent = get_unified_automation_agent()
result = agent.automate_web_task("Fill out contact form", url="https://example.com")
```

**Dependencies**: `selenium`

## 📦 Installation

### Prerequisites

1. **Python 3.11+**
2. **CUDA-capable GPU** (recommended for image generation and voice processing)
3. **Chrome/Firefox browser** (for web automation)

### Install Dependencies

```bash
# Core dependencies
pip install scrapy beautifulsoup4 pandas openpyxl phonenumbers email-validator faker

# Image and video processing
pip install diffusers transformers torch moviepy soundfile librosa

# Web automation
pip install selenium

# Existing dependencies (if not already installed)
pip install playwright pyautogui opencv-python easyocr pillow numpy
```

### Environment Variables

```bash
# Enable synthetic data generation (for development)
export ENABLE_SYNTHETIC_DATA=true

# Docker environment (for visual automation)
export DOCKER_ENV=false

# Display for visual automation
export DISPLAY=:0
```

## 🎯 Usage Examples

### Complete Lead Generation Workflow

```python
from guild.src.core.scraping import get_advanced_scraper
from guild.src.core.data_enrichment import get_data_enricher
from guild.src.agents.lead_personalization_agent import get_lead_personalization_agent

# 1. Scrape leads
scraper = get_advanced_scraper()
leads = scraper.scrape_leads(urls, icp_criteria)

# 2. Enrich data
enricher = get_data_enricher()
enriched_leads = enricher.enrich_leads_batch(leads['leads'])

# 3. Personalize outreach
personalizer = get_lead_personalization_agent()
for lead in enriched_leads:
    message = personalizer.personalize_outreach(lead, product_info, 'email')
    print(f"Personalized message for {lead['name']}: {message['personalization_score']}")
```

### Content Creation Pipeline

```python
from guild.src.agents.image_generation_agent import get_image_generation_agent
from guild.src.agents.video_editor_agent import get_video_editor_agent
from guild.src.agents.voice_agent import get_voice_agent

# 1. Generate image
image_agent = get_image_generation_agent()
image = image_agent.generate_social_media_image(
    "AI automation for businesses", 
    platform="linkedin"
)

# 2. Create voiceover
voice_agent = get_voice_agent()
audio = voice_agent.text_to_speech("Welcome to our AI solution")

# 3. Create video
video_agent = get_video_editor_agent()
video = video_agent.create_video_from_images_and_audio(
    [image['image_path']], 
    audio['audio_path']
)
```

### Financial Reporting

```python
from guild.src.agents.accounting_agent import get_accounting_agent

# Process financial data
accounting_agent = get_accounting_agent()
result = accounting_agent.process_financial_data(
    transactions, 
    report_type="profit_loss",
    output_format="excel"
)

# Analyze financial health
health_analysis = accounting_agent.analyze_financial_health(transactions)
print(f"Profit margin: {health_analysis['metrics']['profit_margin']:.2f}%")
```

## 🔧 Configuration

### Model Configuration

```python
# Image generation model
IMAGE_MODEL = "runwayml/stable-diffusion-v1-5"

# Voice processing models
TTS_MODEL = "microsoft/speecht5_tts"
STT_MODEL = "openai/whisper-base"

# Scraping settings
SCRAPY_DELAY = 2
SCRAPY_CONCURRENT_REQUESTS = 1
```

### Quality Thresholds

```python
# Data quality
MIN_DATA_QUALITY_SCORE = 0.6
MIN_PERSONALIZATION_SCORE = 0.7

# Confidence thresholds
MIN_CONFIDENCE_THRESHOLD = 0.6
MIN_SCRAPING_CONFIDENCE = 0.7
```

## 🚨 Important Notes

### Security and Ethics

1. **Web Scraping**: Always respect robots.txt and implement rate limiting
2. **Data Privacy**: Never collect private or non-consensual data
3. **Visual Automation**: Run in secure, isolated environments
4. **API Keys**: Store securely and never commit to version control

### Performance Considerations

1. **GPU Memory**: Image generation and voice processing require significant GPU memory
2. **Rate Limiting**: Implement appropriate delays for web scraping
3. **Resource Cleanup**: Always close browser instances and clean up temporary files
4. **Batch Processing**: Use batch operations for large datasets

### Cost Optimization

1. **Local Processing**: All new integrations run locally to avoid API costs
2. **Model Selection**: Use smaller models for development, larger for production
3. **Caching**: Cache results when possible to avoid redundant processing
4. **Resource Management**: Monitor GPU/CPU usage and implement resource limits

## 🧪 Testing

Run the comprehensive integration test:

```bash
python guild/examples/comprehensive_integration_example.py
```

This will test all integrations and provide detailed feedback on functionality.

## 📈 Performance Metrics

### Expected Performance

- **Scraping**: 10-50 leads per minute (depending on site complexity)
- **Image Generation**: 10-30 seconds per image (depending on GPU)
- **Voice Processing**: 2-5 seconds per minute of audio
- **Video Creation**: 1-3 minutes per minute of video
- **Data Enrichment**: 100-500 leads per minute

### Quality Benchmarks

- **Data Quality Score**: >0.8 for production use
- **Personalization Score**: >0.7 for effective outreach
- **Transcription Accuracy**: >90% for clear audio
- **Image Quality**: Professional-grade for marketing use

## 🔄 Integration with Existing Systems

All new integrations are designed to work seamlessly with existing Guild-AI components:

- **RAG Pipeline**: Enhanced with MarkItDown document processing
- **Vector Store**: All generated content can be indexed and searched
- **Workflow Builder**: New agents integrate with existing workflow system
- **Data Rooms**: All outputs can be stored in appropriate data rooms

## 🆘 Troubleshooting

### Common Issues

1. **CUDA Out of Memory**: Reduce batch sizes or use CPU-only mode
2. **Selenium WebDriver Issues**: Ensure browser drivers are installed
3. **Audio Processing Errors**: Check audio file formats and codecs
4. **Video Generation Failures**: Verify MoviePy dependencies and codecs

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Test individual components before running full workflows
4. Refer to the example scripts for proper usage patterns

## 🎉 Conclusion

These integrations significantly enhance Guild-AI's capabilities while maintaining the core principles of cost-effectiveness and local processing. The system now provides comprehensive automation for:

- **Lead Generation**: Advanced scraping with enrichment and personalization
- **Content Creation**: Images, videos, and audio generation
- **Financial Management**: Automated accounting and reporting
- **Business Automation**: Visual and web automation capabilities

All integrations follow the established patterns and integrate seamlessly with the existing Guild-AI architecture.
