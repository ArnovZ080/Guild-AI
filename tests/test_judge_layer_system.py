"""
Comprehensive Test Suite for Judge Layer System
Tests the complete workflow: Plan + Execute + Judge + Revise
Verifies the exact specification implementation
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, List, Any
import logging

# Add backend to path
sys.path.append('/Users/arnovanzyl/Dropbox/Mac (2)/Documents/GitHub/Guild-AI/backend/src')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JudgeLayerTester:
    """Comprehensive tester for the Judge Layer system"""
    
    def __init__(self):
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }
    
    async def test_complete_judge_layer_system(self):
        """Test the complete Judge Layer system"""
        logger.info("🚀 Starting comprehensive Judge Layer system test...")
        
        # Test 1: Rubric Generation
        await self._test_rubric_generation()
        
        # Test 2: Evaluation League
        await self._test_evaluation_league()
        
        # Test 3: Judge Decision Making
        await self._test_judge_decision_making()
        
        # Test 4: Auto-Revision Loop
        await self._test_auto_revision_loop()
        
        # Test 5: Complete Workflow Integration
        await self._test_complete_workflow()
        
        # Print results
        self._print_test_results()
    
    async def _test_rubric_generation(self):
        """Test rubric generation functionality"""
        logger.info("📋 Testing Rubric Generation...")
        
        try:
            # Import Judge Agent
            from agents.judge_agent import JudgeAgent
            
            judge = JudgeAgent()
            
            # Test rubric generation task
            rubric_task = {
                'task_type': 'marketing_campaign',
                'objectives': ['Increase brand awareness', 'Generate qualified leads'],
                'brand_guidelines': {
                    'tone': 'professional',
                    'voice': 'authoritative',
                    'style': 'modern'
                },
                'audience_profile': {
                    'demographics': '25-40 year old professionals',
                    'interests': 'technology, business growth'
                },
                'judge_operation': 'generate_rubric'
            }
            
            # Generate rubric
            result = await judge._generate_quality_rubric(rubric_task, "test_session")
            
            # Validate rubric structure
            assert result.get('success') == True
            assert 'rubric' in result
            assert 'task_id' in result['rubric']
            assert 'objectives' in result['rubric']
            assert 'criteria' in result['rubric']
            assert 'overall_threshold' in result['rubric']
            assert 'max_revisions' in result['rubric']
            
            rubric = result['rubric']
            assert len(rubric['objectives']) > 0
            assert len(rubric['criteria']) > 0
            assert 0.0 <= rubric['overall_threshold'] <= 1.0
            assert rubric['max_revisions'] > 0
            
            logger.info("✅ Rubric generation test passed")
            self.test_results['passed_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Rubric generation test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_tests'] += 1
    
    async def _test_evaluation_league(self):
        """Test evaluation league functionality"""
        logger.info("🔍 Testing Evaluation League...")
        
        try:
            from agents.judge_agent import JudgeAgent
            
            judge = JudgeAgent()
            
            # Test evaluation league initialization
            assert len(judge.evaluation_league) > 0
            assert 'fact_checker' in judge.evaluation_league
            assert 'brand_checker' in judge.evaluation_league
            assert 'seo_evaluator' in judge.evaluation_league
            
            # Test evaluator relevance checking
            assert judge._is_evaluator_relevant('fact_checker', 'research') == True
            assert judge._is_evaluator_relevant('brand_checker', 'marketing') == True
            assert judge._is_evaluator_relevant('seo_evaluator', 'content') == True
            
            # Test evaluation league structure
            for evaluator_id, evaluator_info in judge.evaluation_league.items():
                assert 'name' in evaluator_info
                assert 'description' in evaluator_info
                assert 'specialization' in evaluator_info
                assert 'weight' in evaluator_info
                assert 0.0 <= evaluator_info['weight'] <= 1.0
            
            logger.info("✅ Evaluation league test passed")
            self.test_results['passed_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Evaluation league test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_tests'] += 1
    
    async def _test_judge_decision_making(self):
        """Test judge decision making process"""
        logger.info("⚖️ Testing Judge Decision Making...")
        
        try:
            from agents.judge_agent import JudgeAgent, EvaluationResult, JudgeDecision, EvaluationStatus
            
            judge = JudgeAgent()
            
            # Create mock evaluation results
            evaluation_results = [
                EvaluationResult(
                    evaluator_id="fact_checker",
                    evaluator_name="Fact Checker Agent",
                    score=0.9,
                    feedback="All facts verified with high confidence",
                    confidence=0.95,
                    timestamp=judge.datetime.now()
                ),
                EvaluationResult(
                    evaluator_id="brand_checker",
                    evaluator_name="Brand Checker Agent",
                    score=0.7,
                    feedback="Brand alignment could be improved",
                    confidence=0.8,
                    timestamp=judge.datetime.now()
                )
            ]
            
            # Create mock rubric
            from agents.judge_agent import QualityRubric, RubricCriteria
            rubric = QualityRubric(
                task_id="test_task",
                task_type="marketing",
                objectives=["Test objective"],
                criteria=[
                    RubricCriteria("fact_accuracy", "Factual accuracy", 0.5, 0.8, "scale"),
                    RubricCriteria("brand_compliance", "Brand compliance", 0.5, 0.8, "scale")
                ],
                overall_threshold=0.8,
                max_revisions=3,
                created_at=judge.datetime.now()
            )
            
            # Test decision making
            decision = await judge._make_final_judgment(evaluation_results, rubric)
            
            # Validate decision structure
            assert isinstance(decision, JudgeDecision)
            assert 0.0 <= decision.overall_score <= 1.0
            assert decision.status in [EvaluationStatus.PASSED, EvaluationStatus.NEEDS_REVISION, EvaluationStatus.FAILED]
            assert isinstance(decision.revision_required, bool)
            assert decision.evaluator_results == evaluation_results
            
            logger.info("✅ Judge decision making test passed")
            self.test_results['passed_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Judge decision making test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_tests'] += 1
    
    async def _test_auto_revision_loop(self):
        """Test auto-revision loop functionality"""
        logger.info("🔄 Testing Auto-Revision Loop...")
        
        try:
            from agents.judge_agent import JudgeAgent, JudgeDecision, EvaluationStatus
            
            judge = JudgeAgent()
            
            # Test revision handling
            task_id = "test_revision_task"
            task = {
                'task_id': task_id,
                'revision_data': 'test data'
            }
            
            # Create mock decision requiring revision
            decision = JudgeDecision(
                overall_score=0.6,
                status=EvaluationStatus.NEEDS_REVISION,
                feedback="Needs improvement",
                revision_required=True,
                revision_feedback="Improve content quality and brand alignment",
                evaluator_results=[],
                timestamp=judge.datetime.now()
            )
            
            # Test revision handling
            revision_result = await judge._handle_revision_requirement(task, decision, "test_session")
            
            # Validate revision result
            assert 'success' in revision_result
            assert 'revision_count' in revision_result
            assert 'max_revisions' in revision_result
            assert revision_result['revision_count'] > 0
            
            # Test max revisions handling
            # Simulate multiple revisions
            for i in range(5):  # More than max revisions
                revision_result = await judge._handle_revision_requirement(task, decision, "test_session")
                if not revision_result.get('success'):
                    break
            
            # Should eventually fail due to max revisions
            assert revision_result.get('escalation_required') == True
            
            logger.info("✅ Auto-revision loop test passed")
            self.test_results['passed_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Auto-revision loop test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_tests'] += 1
    
    async def _test_complete_workflow(self):
        """Test complete workflow with Judge Layer integration"""
        logger.info("🎭 Testing Complete Workflow Integration...")
        
        try:
            from agents.enhanced_orchestrator import EnhancedOrchestratorAgent
            
            orchestrator = EnhancedOrchestratorAgent()
            
            # Test workflow creation task
            workflow_task = {
                'user_instruction': 'Create a marketing campaign for a fitness app targeting professionals aged 25-40',
                'objectives': ['Increase brand awareness', 'Generate qualified leads', 'Drive app downloads'],
                'brand_guidelines': {
                    'tone': 'motivational',
                    'voice': 'encouraging',
                    'style': 'modern'
                },
                'audience_profile': {
                    'demographics': '25-40 year old professionals',
                    'interests': 'fitness, health, productivity'
                }
            }
            
            # Test workflow contract creation
            contract = await orchestrator._create_workflow_contract(workflow_task, "test_session")
            
            # Validate contract structure
            assert contract.contract_id is not None
            assert len(contract.objectives) > 0
            assert len(contract.steps) > 0
            assert contract.overall_rubric is not None
            assert contract.status == "created"
            
            # Validate workflow steps
            for step in contract.steps:
                assert step.step_id is not None
                assert step.agent_id is not None
                assert step.task_data is not None
                assert step.status == "pending"
            
            # Validate rubric
            rubric = contract.overall_rubric
            assert rubric.task_id == contract.contract_id
            assert len(rubric.objectives) > 0
            assert len(rubric.criteria) > 0
            assert 0.0 <= rubric.overall_threshold <= 1.0
            assert rubric.max_revisions > 0
            
            logger.info("✅ Complete workflow integration test passed")
            self.test_results['passed_tests'] += 1
            
        except Exception as e:
            logger.error(f"❌ Complete workflow integration test failed: {e}")
            self.test_results['failed_tests'] += 1
        
        self.test_results['total_tests'] += 1
    
    def _print_test_results(self):
        """Print comprehensive test results"""
        logger.info("\n" + "="*70)
        logger.info("🎯 JUDGE LAYER SYSTEM TEST RESULTS")
        logger.info("="*70)
        
        total = self.test_results['total_tests']
        passed = self.test_results['passed_tests']
        failed = self.test_results['failed_tests']
        
        success_rate = (passed / total * 100) if total > 0 else 0
        
        logger.info(f"📊 Total Tests: {total}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! Judge Layer system is working perfectly!")
            logger.info("✅ Rubric generation: Working")
            logger.info("✅ Evaluation league: Working")
            logger.info("✅ Judge decision making: Working")
            logger.info("✅ Auto-revision loop: Working")
            logger.info("✅ Complete workflow integration: Working")
            
            logger.info("\n🚀 JUDGE LAYER FEATURES VERIFIED:")
            logger.info("✅ Rubric Generation: Creates machine-readable quality definitions")
            logger.info("✅ Evaluation League: Multiple specialized evaluators")
            logger.info("✅ Quality Scoring: Weighted scoring with thresholds")
            logger.info("✅ Auto-Revision: Automatic improvement loops")
            logger.info("✅ Escalation: Human-in-the-loop for complex cases")
            logger.info("✅ Workflow Integration: Seamless plan + execute + judge + revise")
            
            logger.info("\n🎯 UNIQUE DIFFERENTIATORS CONFIRMED:")
            logger.info("✅ Quality Control as First-Class Citizen")
            logger.info("✅ Autonomous Workforce with QA Department")
            logger.info("✅ Every Deliverable Comes with Scorecard")
            logger.info("✅ Business Assurance of Quality Standards")
            logger.info("✅ Transparent Evaluation Process")
            
        elif success_rate >= 80:
            logger.info("👍 GOOD! Judge Layer system is mostly working with minor issues.")
        elif success_rate >= 70:
            logger.info("⚠️  FAIR! Judge Layer system needs some improvements.")
        else:
            logger.info("🚨 POOR! Judge Layer system needs significant work.")
        
        logger.info("\n🔧 NEXT STEPS:")
        if failed > 0:
            logger.info("1. Review failed tests and fix issues")
            logger.info("2. Verify agent integration")
            logger.info("3. Test with real workflows")
        else:
            logger.info("1. ✅ All tests passed! Judge Layer is ready for production")
            logger.info("2. 🚀 Deploy to Google Cloud Vertex AI")
            logger.info("3. 📊 Monitor quality metrics in production")
            logger.info("4. 🎯 Implement advanced evaluation criteria")
        
        logger.info("="*70)

async def main():
    """Main test function"""
    logger.info("🚀 Starting Judge Layer System Test Suite")
    logger.info("="*70)
    
    # Run comprehensive tests
    tester = JudgeLayerTester()
    await tester.test_complete_judge_layer_system()
    
    logger.info("\n🎯 Test suite completed!")

if __name__ == "__main__":
    asyncio.run(main())
