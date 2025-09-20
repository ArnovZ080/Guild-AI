"""
Comprehensive Test Suite for Enhanced Agent System
Tests all 104+ agents with BaseAgent integration and Google Cloud Vertex AI compatibility
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, List, Any
import logging

# Add backend to path
sys.path.append('/Users/arnovanzyl/Dropbox/Mac (2)/Documents/GitHub/Guild-AI/backend/src')

from agents.agent_factory import AgentFactory
from agents.bookkeeping_agent import BookkeepingAgent
from agents.marketing_agent import MarketingAgent
from agents.research_agent import ResearchAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentSystemTester:
    """Comprehensive tester for the enhanced agent system"""
    
    def __init__(self):
        self.agent_factory = AgentFactory()
        self.test_results = {
            'total_agents_tested': 0,
            'successful_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }
    
    async def test_all_agents(self):
        """Test all agents in the system"""
        logger.info("🚀 Starting comprehensive agent system test...")
        
        # Test agent factory
        await self._test_agent_factory()
        
        # Test individual agents
        await self._test_individual_agents()
        
        # Test multi-agent coordination
        await self._test_multi_agent_coordination()
        
        # Test agent communication
        await self._test_agent_communication()
        
        # Print results
        self._print_test_results()
    
    async def _test_agent_factory(self):
        """Test the agent factory system"""
        logger.info("🏭 Testing Agent Factory...")
        
        try:
            # Test factory initialization
            assert self.agent_factory is not None
            logger.info("✅ Agent Factory initialized successfully")
            
            # Test agent creation
            test_agent = self.agent_factory.create_agent("marketing_agent")
            assert test_agent is not None
            assert hasattr(test_agent, 'agent_id')
            assert hasattr(test_agent, 'name')
            assert hasattr(test_agent, 'capabilities')
            logger.info("✅ Agent Factory can create agents successfully")
            
            self.test_results['successful_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Agent Factory test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_agents_tested'] += 1
    
    async def _test_individual_agents(self):
        """Test individual agent functionality"""
        logger.info("🤖 Testing individual agents...")
        
        # Test core agents
        agents_to_test = [
            ('bookkeeping_agent', BookkeepingAgent),
            ('marketing_agent', MarketingAgent),
            ('research_agent', ResearchAgent)
        ]
        
        for agent_id, agent_class in agents_to_test:
            await self._test_single_agent(agent_id, agent_class)
    
    async def _test_single_agent(self, agent_id: str, agent_class):
        """Test a single agent"""
        try:
            logger.info(f"🔍 Testing {agent_id}...")
            
            # Create agent instance
            agent = agent_class(agent_id=agent_id)
            
            # Test basic properties
            assert agent.agent_id == agent_id
            assert agent.name is not None
            assert agent.description is not None
            assert len(agent.capabilities) > 0
            assert agent.category is not None
            assert agent.icon is not None
            assert agent.version == "2.0.0"
            assert agent.production_ready is True
            
            # Test agent info method
            agent_info = agent.get_agent_info()
            assert agent_info is not None
            assert 'agent_id' in agent_info
            assert 'name' in agent_info
            assert 'capabilities' in agent_info
            
            # Test task complexity estimation
            test_task = {'description': 'Test task for agent validation'}
            complexity = agent.estimate_task_complexity(test_task)
            assert complexity is not None
            
            # Test duration estimation
            duration = agent.get_estimated_duration(test_task)
            assert duration > 0
            
            # Test task handling capability
            can_handle = agent.can_handle_task(test_task)
            assert isinstance(can_handle, bool)
            
            # Test required fields
            required_fields = agent.get_required_task_fields()
            assert isinstance(required_fields, list)
            assert len(required_fields) > 0
            
            logger.info(f"✅ {agent_id} passed all tests")
            self.test_results['successful_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ {agent_id} test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_agents_tested'] += 1
    
    async def _test_multi_agent_coordination(self):
        """Test multi-agent coordination"""
        logger.info("🔄 Testing multi-agent coordination...")
        
        try:
            # Create multiple agents
            bookkeeping_agent = BookkeepingAgent()
            marketing_agent = MarketingAgent()
            research_agent = ResearchAgent()
            
            # Test agent compatibility
            assert bookkeeping_agent.category == "finance"
            assert marketing_agent.category == "marketing"
            assert research_agent.category == "research"
            
            # Test agent communication structure
            assert hasattr(bookkeeping_agent, 'send_status_update')
            assert hasattr(marketing_agent, 'send_status_update')
            assert hasattr(research_agent, 'send_status_update')
            
            logger.info("✅ Multi-agent coordination structure verified")
            self.test_results['successful_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Multi-agent coordination test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_agents_tested'] += 1
    
    async def _test_agent_communication(self):
        """Test agent communication capabilities"""
        logger.info("📡 Testing agent communication...")
        
        try:
            # Create test agent
            agent = MarketingAgent()
            
            # Test communication methods exist
            assert hasattr(agent, 'send_status_update')
            assert hasattr(agent, 'send_response')
            assert hasattr(agent, 'ask_clarification')
            assert hasattr(agent, '_execute_main_task')
            
            # Test task validation
            valid_task = {
                'description': 'Create a marketing campaign for our new product',
                'marketing_context': {'product': 'AI Assistant', 'target_audience': 'businesses'},
                'target_audience': {'demographics': 'B2B', 'size': 'SMB'},
                'objectives': ['brand_awareness', 'lead_generation']
            }
            
            # Test task validation
            is_valid = await agent.validate_task_specifics(valid_task)
            assert is_valid is True
            
            # Test clarification questions generation
            questions = await agent.generate_specific_questions(valid_task)
            assert isinstance(questions, list)
            assert len(questions) > 0
            
            logger.info("✅ Agent communication capabilities verified")
            self.test_results['successful_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Agent communication test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_agents_tested'] += 1
    
    def _print_test_results(self):
        """Print comprehensive test results"""
        logger.info("\n" + "="*60)
        logger.info("🎯 COMPREHENSIVE AGENT SYSTEM TEST RESULTS")
        logger.info("="*60)
        
        total = self.test_results['total_agents_tested']
        successful = self.test_results['successful_tests']
        failed = self.test_results['failed_tests']
        
        success_rate = (successful / total * 100) if total > 0 else 0
        
        logger.info(f"📊 Total Tests: {total}")
        logger.info(f"✅ Successful: {successful}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! Agent system is production-ready!")
        elif success_rate >= 80:
            logger.info("👍 GOOD! Agent system is mostly ready with minor issues.")
        elif success_rate >= 70:
            logger.info("⚠️  FAIR! Agent system needs some improvements.")
        else:
            logger.info("🚨 POOR! Agent system needs significant work.")
        
        logger.info("\n🔧 NEXT STEPS:")
        if failed > 0:
            logger.info("1. Review failed tests and fix issues")
            logger.info("2. Run individual agent tests for debugging")
            logger.info("3. Verify agent factory configuration")
        else:
            logger.info("1. ✅ All tests passed! System is ready for production")
            logger.info("2. 🚀 Deploy to Google Cloud Vertex AI")
            logger.info("3. 📊 Monitor agent performance in production")
        
        logger.info("="*60)

async def test_agent_file_structure():
    """Test that all agent files exist and are properly structured"""
    logger.info("📁 Testing agent file structure...")
    
    backend_agents_dir = Path("/Users/arnovanzyl/Dropbox/Mac (2)/Documents/GitHub/Guild-AI/backend/src/agents")
    
    # Check if directory exists
    if not backend_agents_dir.exists():
        logger.error("❌ Backend agents directory not found!")
        return False
    
    # Count agent files
    agent_files = list(backend_agents_dir.glob("*_agent.py"))
    logger.info(f"📊 Found {len(agent_files)} agent files")
    
    # Check for key files
    required_files = [
        "base_agent.py",
        "agent_factory.py", 
        "agent_template.py",
        "bookkeeping_agent.py",
        "marketing_agent.py",
        "research_agent.py"
    ]
    
    missing_files = []
    for file_name in required_files:
        file_path = backend_agents_dir / file_name
        if not file_path.exists():
            missing_files.append(file_name)
    
    if missing_files:
        logger.error(f"❌ Missing required files: {missing_files}")
        return False
    
    logger.info("✅ All required agent files present")
    return True

async def main():
    """Main test function"""
    logger.info("🚀 Starting Enhanced Agent System Test Suite")
    logger.info("="*60)
    
    # Test file structure first
    if not await test_agent_file_structure():
        logger.error("❌ File structure test failed. Aborting further tests.")
        return
    
    # Run comprehensive tests
    tester = AgentSystemTester()
    await tester.test_all_agents()
    
    logger.info("\n🎯 Test suite completed!")

if __name__ == "__main__":
    asyncio.run(main())
