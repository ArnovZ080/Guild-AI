"""
Agent Factory System
Automatically creates and manages all 104+ agents with class-based structure
"""

from typing import Dict, List, Any, Optional, Type
from ..agents.base_agent import BaseAgent
from ..agents.bookkeeping_agent import BookkeepingAgent
import importlib
import os
from pathlib import Path

class AgentFactory:
    """Factory for creating and managing all agents"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_registry: Dict[str, Dict[str, Any]] = {}
        self._load_agent_registry()
    
    def _load_agent_registry(self):
        """Load agent registry from generated data"""
        try:
            import json
            registry_path = Path(__file__).parent / 'comprehensive_registry.json'
            if registry_path.exists():
                with open(registry_path, 'r') as f:
                    self.agent_registry = json.load(f).get('agents', {})
        except Exception as e:
            print(f"Error loading agent registry: {e}")
    
    def create_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Create an agent instance by ID"""
        if agent_id in self.agents:
            return self.agents[agent_id]
        
        # Get agent metadata
        agent_metadata = self._get_agent_metadata(agent_id)
        if not agent_metadata:
            return None
        
        # Create agent based on type
        if agent_metadata.get('category') == 'finance':
            agent = BookkeepingAgent(name=agent_metadata['name'])
        elif agent_metadata.get('agent_id') == 'strategic_sounding_board':
            agent = StrategicSoundingBoardAgent()
        elif agent_metadata.get('agent_id') == 'supplier_research':
            agent = SupplierResearchAgent()
        elif agent_metadata.get('agent_id') == 'seo':
            agent = SeoAgent()
        elif agent_metadata.get('agent_id') == 'paid_ads':
            agent = PaidAdsAgent()
        elif agent_metadata.get('agent_id') == 'brand_strategist':
            agent = BrandStrategistAgent()
        elif agent_metadata.get('agent_id') == 'contract_analyzer':
            agent = ContractAnalyzerAgent()
        elif agent_metadata.get('agent_id') == 'investor_relations':
            agent = InvestorRelationsAgent()
        elif agent_metadata.get('agent_id') == 'content_strategist':
            agent = ContentStrategistAgent()
        elif agent_metadata.get('agent_id') == 'product_manager':
            agent = ProductManagerAgent()
        elif agent_metadata.get('agent_id') == 'tax_advisor':
            agent = TaxAdvisorAgent()
        elif agent_metadata.get('agent_id') == 'motivation_coach':
            agent = MotivationCoachAgent()
        elif agent_metadata.get('agent_id') == 'partnerships':
            agent = PartnershipsAgent()
        elif agent_metadata.get('agent_id') == 'okr_goal_tracking':
            agent = OkrGoalTrackingAgent()
        elif agent_metadata.get('agent_id') == 'proposal_writer':
            agent = ProposalWriterAgent()
        elif agent_metadata.get('agent_id') == 'affiliate_partnerships':
            agent = AffiliatePartnershipsAgent()
        elif agent_metadata.get('agent_id') == 'outsourcing':
            agent = OutsourcingAgent()
        elif agent_metadata.get('agent_id') == '_evaluator':
            agent = EvaluatorAgent()
        elif agent_metadata.get('agent_id') == 'sales_funnel':
            agent = SalesFunnelAgent()
        elif agent_metadata.get('agent_id') == 'pr_outreach':
            agent = PrOutreachAgent()
        elif agent_metadata.get('agent_id') == 'knowledge_updater':
            agent = KnowledgeUpdaterAgent()
        elif agent_metadata.get('agent_id') == 'content_repurposer':
            agent = ContentRepurposerAgent()
        elif agent_metadata.get('agent_id') == 'automation_bridge':
            agent = AutomationBridgeAgent()
        elif agent_metadata.get('agent_id') == 'judge':
            agent = JudgeAgent()
        elif agent_metadata.get('agent_id') == 'learning':
            agent = LearningAgent()
        elif agent_metadata.get('agent_id') == 'outbound_sales':
            agent = OutboundSalesAgent()
        elif agent_metadata.get('agent_id') == 'copywriter':
            agent = CopywriterAgent()
        elif agent_metadata.get('agent_id') == 'business_strategist':
            agent = BusinessStrategistAgent()
        elif agent_metadata.get('agent_id') == 'icp_evolution':
            agent = IcpEvolutionAgent()
        elif agent_metadata.get('agent_id') == 'competitive_intelligence':
            agent = CompetitiveIntelligenceAgent()
        elif agent_metadata.get('agent_id') == 'unified_automation':
            agent = UnifiedAutomationAgent()
        elif agent_metadata.get('agent_id') == 'influencer_outreach':
            agent = InfluencerOutreachAgent()
        elif agent_metadata.get('agent_id') == 'business_strategist':
            agent = BusinessStrategistAgent()
        elif agent_metadata.get('agent_id') == 'skill_development':
            agent = SkillDevelopmentAgent()
        elif agent_metadata.get('agent_id') == 'trend_spotter':
            agent = TrendSpotterAgent()
        elif agent_metadata.get('agent_id') == 'sop':
            agent = SopAgent()
        elif agent_metadata.get('agent_id') == 'wellness':
            agent = WellnessAgent()
        elif agent_metadata.get('agent_id') == 'risk_management':
            agent = RiskManagementAgent()
        elif agent_metadata.get('agent_id') == 'enhanced_campaign':
            agent = EnhancedCampaignAgent()
        elif agent_metadata.get('agent_id') == 'hr':
            agent = HrAgent()
        elif agent_metadata.get('agent_id') == 'investor_update':
            agent = InvestorUpdateAgent()
        elif agent_metadata.get('agent_id') == 'community_connector':
            agent = CommunityConnectorAgent()
        elif agent_metadata.get('agent_id') == 'scenario_planner':
            agent = ScenarioPlannerAgent()
        elif agent_metadata.get('agent_id') == 'expense_optimizer':
            agent = ExpenseOptimizerAgent()
        elif agent_metadata.get('agent_id') == 'celebration_narrator':
            agent = CelebrationNarratorAgent()
        elif agent_metadata.get('agent_id') == 'ad_performance_optimizer':
            agent = AdPerformanceOptimizerAgent()
        elif agent_metadata.get('agent_id') == 'hiring_hr':
            agent = HiringHrAgent()
        elif agent_metadata.get('agent_id') == 'customer_success':
            agent = CustomerSuccessAgent()
        elif agent_metadata.get('agent_id') == 'video_editor':
            agent = VideoEditorAgent()
        elif agent_metadata.get('agent_id') == 'localization':
            agent = LocalizationAgent()
        elif agent_metadata.get('agent_id') == 'accountability_coach':
            agent = AccountabilityCoachAgent()
        elif agent_metadata.get('agent_id') == 'community_manager':
            agent = CommunityManagerAgent()
        elif agent_metadata.get('agent_id') == 'crm_automation':
            agent = CrmAutomationAgent()
        elif agent_metadata.get('agent_id') == 'enhanced_prompts':
            agent = EnhancedPromptsAgent()
        elif agent_metadata.get('agent_id') == 'feedback_collector':
            agent = FeedbackCollectorAgent()
        elif agent_metadata.get('agent_id') == 'enhanced_marketing':
            agent = EnhancedMarketingAgent()
        elif agent_metadata.get('agent_id') == 'multi_channel_inbox':
            agent = MultiChannelInboxAgent()
        elif agent_metadata.get('agent_id') == 'voice':
            agent = VoiceAgent()
        elif agent_metadata.get('agent_id') == 'customer_support':
            agent = CustomerSupportAgent()
        elif agent_metadata.get('agent_id') == 'wellbeing':
            agent = WellbeingAgent()
        elif agent_metadata.get('agent_id') == 'meeting_notes':
            agent = MeetingNotesAgent()
        elif agent_metadata.get('agent_id') == 'research_scraper':
            agent = ResearchScraperAgent()
        elif agent_metadata.get('agent_id') == 'onboarding':
            agent = OnboardingAgent()
        elif agent_metadata.get('agent_id') == 'accounting':
            agent = AccountingAgent()
        elif agent_metadata.get('agent_id') == 'board_advisor':
            agent = BoardAdvisorAgent()
        elif agent_metadata.get('agent_id') == 'knowledge_management':
            agent = KnowledgeManagementAgent()
        elif agent_metadata.get('agent_id') == 'design_qa':
            agent = DesignQaAgent()
        elif agent_metadata.get('agent_id') == 'vision_enhanced_training':
            agent = VisionEnhancedTrainingAgent()
        elif agent_metadata.get('agent_id') == 'training':
            agent = TrainingAgent()
        elif agent_metadata.get('agent_id') == 'market_trends':
            agent = MarketTrendsAgent()
        elif agent_metadata.get('agent_id') == 'desktop_automation':
            agent = DesktopAutomationAgent()
        elif agent_metadata.get('agent_id') == 'telephony_voice':
            agent = TelephonyVoiceAgent()
        elif agent_metadata.get('agent_id') == 'well_being':
            agent = WellBeingAgent()
        elif agent_metadata.get('agent_id') == 'scraper':
            agent = ScraperAgent()
        elif agent_metadata.get('agent_id') == 'image_generation':
            agent = ImageGenerationAgent()
        elif agent_metadata.get('agent_id') == 'chief_of_staff':
            agent = ChiefOfStaffAgent()
        elif agent_metadata.get('agent_id') == 'research':
            agent = ResearchAgent()
        elif agent_metadata.get('agent_id') == 'pricing_intelligence':
            agent = PricingIntelligenceAgent()
        elif agent_metadata.get('agent_id') == 'pricing':
            agent = PricingAgent()
        elif agent_metadata.get('agent_id') == 'storage':
            agent = StorageAgent()
        elif agent_metadata.get('agent_id') == 'orchestration_tuner':
            agent = OrchestrationTunerAgent()
        elif agent_metadata.get('agent_id') == 'crm':
            agent = CrmAgent()
        elif agent_metadata.get('agent_id') == 'security':
            agent = SecurityAgent()
        elif agent_metadata.get('agent_id') == 'wellbeing_workload':
            agent = WellbeingWorkloadAgent()
        elif agent_metadata.get('agent_id') == 'strategy':
            agent = StrategyAgent()
        elif agent_metadata.get('agent_id') == 'marketing':
            agent = MarketingAgent()
        elif agent_metadata.get('agent_id') == 'ux_ui_tester':
            agent = UxUiTesterAgent()
        elif agent_metadata.get('agent_id') == 'upsell_cross_sell':
            agent = UpsellCrossSellAgent()
        elif agent_metadata.get('agent_id') == 'scalability':
            agent = ScalabilityAgent()
        elif agent_metadata.get('agent_id') == 'copywriter':
            agent = CopywriterAgent()
        elif agent_metadata.get('agent_id') == 'bookkeeping':
            agent = BookkeepingAgent()
        elif agent_metadata.get('agent_id') == 'data_hygiene':
            agent = DataHygieneAgent()
        elif agent_metadata.get('agent_id') == 'visual':
            agent = VisualAgent()
        elif agent_metadata.get('agent_id') == 'calendar_harmony':
            agent = CalendarHarmonyAgent()
        elif agent_metadata.get('agent_id') == 'event_marketing':
            agent = EventMarketingAgent()
        elif agent_metadata.get('agent_id') == 'vendor_management':
            agent = VendorManagementAgent()
        elif agent_metadata.get('agent_id') == 'lead_personalization':
            agent = LeadPersonalizationAgent()
        elif agent_metadata.get('agent_id') == 'voice_persona':
            agent = VoicePersonaAgent()
        elif agent_metadata.get('agent_id') == 'grant_funding':
            agent = GrantFundingAgent()
        elif agent_metadata.get('agent_id') == 'automation':
            agent = AutomationAgent()
        elif agent_metadata.get('agent_id') == 'compliance':
            agent = ComplianceAgent()
        elif agent_metadata.get('agent_id') == 'project_manager':
            agent = ProjectManagerAgent()
        elif agent_metadata.get('agent_id') == 'churn_predictor':
            agent = ChurnPredictorAgent()
        elif agent_metadata.get('agent_id') == 'connector':
            agent = ConnectorAgent()
        elif agent_metadata.get('agent_id') == 'orchestrator':
            agent = OrchestratorAgent()
            agent = BookkeepingAgent(name=agent_metadata['name'])
        else:
            # Create generic agent with metadata
            agent = self._create_generic_agent(agent_metadata)
        
        self.agents[agent_id] = agent
        return agent
    
    def _get_agent_metadata(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent metadata from registry"""
        for agent in self.agent_registry:
            if agent['agent_id'] == agent_id:
                return agent
        return None
    
    def _create_generic_agent(self, metadata: Dict[str, Any]) -> BaseAgent:
        """Create a generic agent with metadata"""
        
        class GenericAgent(BaseAgent):
            def __init__(self, metadata):
                super().__init__(
                    agent_id=metadata['agent_id'],
                    name=metadata['name'],
                    description=metadata['description'],
                    capabilities=metadata['capabilities']
                )
                self.category = metadata['category']
                self.icon = metadata['icon']
            
            async def _execute_main_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
                """Execute main task for generic agent"""
                await self.send_status_update("working", 10, f"{self.name} is analyzing your request...")
                
                # Simulate task processing
                await asyncio.sleep(2)
                await self.send_status_update("working", 50, f"{self.name} is processing your request...")
                
                await asyncio.sleep(2)
                await self.send_status_update("working", 90, f"{self.name} is finalizing results...")
                
                result = {
                    "success": True,
                    "agent": self.name,
                    "category": self.category,
                    "task_type": task.get('description', 'general'),
                    "capabilities_used": self.capabilities[:3],
                    "result": f"{self.name} has completed the requested task successfully.",
                    "metadata": {
                        "agent_id": self.agent_id,
                        "category": self.category,
                        "capabilities": self.capabilities,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                
                await self.send_response(f"Task completed successfully! {result['result']}")
                return result
            
            def can_handle_task(self, task: Dict[str, Any]) -> bool:
                """Check if agent can handle task"""
                description = task.get('description', '').lower()
                task_keywords = description.split()
                
                # Check if any capability keywords match
                for capability in self.capabilities:
                    if any(keyword in capability.lower() for keyword in task_keywords):
                        return True
                
                return False
            
            def estimate_task_complexity(self, task: Dict[str, Any]) -> 'TaskComplexity':
                """Estimate task complexity"""
                description = task.get('description', '')
                if len(description.split()) < 10:
                    return TaskComplexity.SIMPLE
                elif len(description.split()) < 25:
                    return TaskComplexity.MODERATE
                else:
                    return TaskComplexity.COMPLEX
            
            def get_estimated_duration(self, task: Dict[str, Any]) -> int:
                """Get estimated task duration"""
                complexity = self.estimate_task_complexity(task)
                if complexity == TaskComplexity.SIMPLE:
                    return 5
                elif complexity == TaskComplexity.MODERATE:
                    return 15
                else:
                    return 30
        
        return GenericAgent(metadata)
    
    def get_all_agents(self) -> Dict[str, BaseAgent]:
        """Get all created agents"""
        return self.agents
    
    def get_agent_by_category(self, category: str) -> List[BaseAgent]:
        """Get agents by category"""
        agents = []
        for agent_id, agent in self.agents.items():
            if hasattr(agent, 'category') and agent.category == category:
                agents.append(agent)
        return agents
    
    def register_all_agents(self, orchestrator):
        """Register all agents with orchestrator"""
        for agent_metadata in self.agent_registry:
            agent_id = agent_metadata['agent_id']
            if agent_id not in self.agents:
                agent = self.create_agent(agent_id)
                if agent:
                    orchestrator.register_agent(agent)
                    print(f"✅ Registered {agent.name} ({agent_id})")

# Global factory instance
agent_factory = AgentFactory()
