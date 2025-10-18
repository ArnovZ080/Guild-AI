#!/usr/bin/env python3
"""
Orchestrator Diagnostic Script
Checks configuration and identifies why the orchestrator might be falling back to automatic responses
"""

import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def check_environment_variables():
    """Check if required environment variables are set"""
    logger.info("=" * 60)
    logger.info("CHECKING ENVIRONMENT VARIABLES")
    logger.info("=" * 60)
    
    required_vars = {
        'GOOGLE_CLOUD_PROJECT': 'Your Google Cloud project ID',
        'LLM_PROVIDER': 'Should be "vertex_ai" for production',
    }
    
    optional_vars = {
        'VERTEX_AI_LOCATION': 'Defaults to us-central1',
        'VERTEX_AI_MODEL': 'Defaults to gemini-1.5-flash',
        'GOOGLE_APPLICATION_CREDENTIALS': 'Path to service account key (if not using ADC)',
    }
    
    all_good = True
    
    # Check required variables
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            logger.info(f"✅ {var}: {value}")
        else:
            logger.error(f"❌ {var}: NOT SET ({description})")
            all_good = False
    
    # Check optional variables
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            logger.info(f"✅ {var}: {value}")
        else:
            logger.warning(f"⚠️  {var}: NOT SET ({description})")
    
    return all_good

def check_vertex_ai_connection():
    """Test connection to Vertex AI"""
    logger.info("\n" + "=" * 60)
    logger.info("TESTING VERTEX AI CONNECTION")
    logger.info("=" * 60)
    
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel
        
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        location = os.getenv('VERTEX_AI_LOCATION', 'us-central1')
        
        if not project_id:
            logger.error("❌ Cannot test Vertex AI: GOOGLE_CLOUD_PROJECT not set")
            return False
        
        # Try to initialize Vertex AI
        try:
            vertexai.init(project=project_id, location=location)
            logger.info(f"✅ Vertex AI initialized: {project_id} in {location}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Vertex AI: {e}")
            return False
        
        # Try to create a model
        try:
            model_name = os.getenv('VERTEX_AI_MODEL', 'gemini-1.5-flash')
            model = GenerativeModel(model_name)
            logger.info(f"✅ Model created: {model_name}")
        except Exception as e:
            logger.error(f"❌ Failed to create model: {e}")
            return False
        
        # Try to generate content
        try:
            response = model.generate_content("Say 'Hello, Guild AI!' if you can hear me.")
            logger.info(f"✅ Generated response: {response.text[:100]}...")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to generate content: {e}")
            return False
            
    except ImportError as e:
        logger.error(f"❌ Missing dependencies: {e}")
        logger.error("Install with: pip install google-cloud-aiplatform")
        return False

def check_orchestrator_initialization():
    """Test orchestrator initialization"""
    logger.info("\n" + "=" * 60)
    logger.info("TESTING ORCHESTRATOR INITIALIZATION")
    logger.info("=" * 60)
    
    try:
        # Add parent directory to path
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from guild.src.core.orchestrator import Orchestrator
        from guild.src.models.user_input import UserInput
        
        # Create test input
        user_input = UserInput(
            objective="Test orchestrator initialization",
            additional_notes="This is a diagnostic test"
        )
        
        # Try to initialize orchestrator
        try:
            orchestrator = Orchestrator(user_input)
            logger.info("✅ Orchestrator initialized successfully")
            
            # Check which provider is being used
            provider = orchestrator.llm_client.llm_config.provider
            model = orchestrator.llm_client.llm_config.model
            logger.info(f"✅ Using provider: {provider}")
            logger.info(f"✅ Using model: {model}")
            
            if provider == "vertex_ai":
                logger.info("✅ Orchestrator is configured to use Vertex AI/Gemini")
                return True
            else:
                logger.warning(f"⚠️  Orchestrator is using {provider} instead of vertex_ai")
                logger.warning("This means it will fall back to local models instead of Gemini")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize orchestrator: {e}")
            return False
            
    except ImportError as e:
        logger.error(f"❌ Failed to import orchestrator: {e}")
        return False

def check_gemini_provider():
    """Test Gemini provider initialization"""
    logger.info("\n" + "=" * 60)
    logger.info("TESTING GEMINI PROVIDER")
    logger.info("=" * 60)
    
    try:
        # Add parent directory to path
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from api_server.src.llm.gemini_provider import gemini_provider
        
        if gemini_provider.initialized:
            logger.info("✅ Gemini provider initialized successfully")
            logger.info(f"✅ Project: {gemini_provider.project_id}")
            logger.info(f"✅ Location: {gemini_provider.location}")
            return True
        else:
            logger.error("❌ Gemini provider failed to initialize")
            logger.error(f"Project: {gemini_provider.project_id}")
            logger.error(f"Location: {gemini_provider.location}")
            return False
            
    except ImportError as e:
        logger.error(f"❌ Failed to import Gemini provider: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Error checking Gemini provider: {e}")
        return False

def print_recommendations():
    """Print recommendations based on findings"""
    logger.info("\n" + "=" * 60)
    logger.info("RECOMMENDATIONS")
    logger.info("=" * 60)
    
    logger.info("""
To fix the orchestrator falling back to automatic responses:

1. Set required environment variables:
   export GOOGLE_CLOUD_PROJECT=your-project-id
   export LLM_PROVIDER=vertex_ai
   export VERTEX_AI_MODEL=gemini-1.5-flash

2. Configure Google Cloud authentication:
   Option A: Service account key
     export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   
   Option B: Application default credentials
     gcloud auth application-default login

3. Enable Vertex AI API:
   gcloud services enable aiplatform.googleapis.com

4. Verify IAM permissions:
   - roles/aiplatform.user
   - roles/ml.developer

5. Restart your application after configuration

For detailed instructions, see: ORCHESTRATOR_CONFIGURATION.md
""")

def main():
    """Run all diagnostic checks"""
    logger.info("\n" + "=" * 60)
    logger.info("ORCHESTRATOR DIAGNOSTIC TOOL")
    logger.info("=" * 60)
    
    results = {
        'environment': check_environment_variables(),
        'vertex_ai': check_vertex_ai_connection(),
        'gemini_provider': check_gemini_provider(),
        'orchestrator': check_orchestrator_initialization(),
    }
    
    # Print summary
    logger.info("\n" + "=" * 60)
    logger.info("DIAGNOSTIC SUMMARY")
    logger.info("=" * 60)
    
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {check.replace('_', ' ').title()}")
    
    all_passed = all(results.values())
    
    if all_passed:
        logger.info("\n🎉 All checks passed! Your orchestrator should be working correctly.")
        logger.info("If you're still seeing issues, check the application logs for runtime errors.")
    else:
        logger.info("\n⚠️  Some checks failed. See recommendations below:")
        print_recommendations()
        sys.exit(1)

if __name__ == "__main__":
    main()

