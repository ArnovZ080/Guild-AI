"""
Vision API Routes

Provides endpoints for testing and using the computer vision system
and vision-enhanced agents.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

# Import vision components
try:
    from guild.src.core.vision import VisualAutomationTool
    from guild.src.agents.visual_agent import VisualAgent
    from guild.src.agents.vision_enhanced_training_agent import VisionEnhancedTrainingAgent
    from guild.src.models.user_input import UserInput
    VISION_AVAILABLE = True
except ImportError as e:
    VISION_AVAILABLE = False
    print(f"Vision components not available: {e}")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vision", tags=["vision"])

# Pydantic models for API requests/responses
class VisionTaskRequest(BaseModel):
    task_description: str
    parameters: Optional[Dict[str, Any]] = None

class VisionTaskResponse(BaseModel):
    success: bool
    task: str
    result: Dict[str, Any]
    agent: str

class LearningSessionRequest(BaseModel):
    session_name: str
    description: str
    training_objective: Optional[str] = None

class LearningSessionResponse(BaseModel):
    session_id: str
    status: str
    message: str

class AgentCapabilitiesResponse(BaseModel):
    agent_name: str
    capabilities: List[str]
    vision_available: bool
    learning_available: bool

@router.get("/health")
async def vision_health():
    """Check if vision system is available."""
    return {
        "status": "ok" if VISION_AVAILABLE else "unavailable",
        "vision_available": VISION_AVAILABLE,
        "message": "Vision system is working" if VISION_AVAILABLE else "Vision system not available"
    }

@router.get("/agents")
async def get_vision_agents():
    """Get list of available vision-enhanced agents."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    agents = [
        {
            "name": "VisualAgent",
            "type": "vision_automation",
            "capabilities": ["gui_interaction", "visual_learning", "workflow_automation"],
            "description": "Specialized agent for visual automation and learning"
        },
        {
            "name": "VisionEnhancedTrainingAgent", 
            "type": "training_vision",
            "capabilities": ["visual_sop_creation", "demonstration_learning", "interactive_training"],
            "description": "Training agent enhanced with computer vision capabilities"
        }
    ]
    
    return {"agents": agents}

@router.post("/execute", response_model=VisionTaskResponse)
async def execute_vision_task(request: VisionTaskRequest):
    """Execute a visual automation task using the Visual Agent."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    try:
        # Initialize the visual agent
        visual_agent = VisualAgent()
        
        # Execute the task
        result = visual_agent.execute_visual_task(
            task_description=request.task_description,
            parameters=request.parameters or {}
        )
        
        return VisionTaskResponse(
            success=result["success"],
            task=result["task"],
            result=result["result"],
            agent=result["agent"]
        )
        
    except Exception as e:
        logger.error(f"Error executing vision task: {e}")
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")

@router.post("/learning/start", response_model=LearningSessionResponse)
async def start_learning_session(request: LearningSessionRequest):
    """Start a visual learning session for training demonstrations."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    try:
        # Initialize the vision-enhanced training agent
        user_input = UserInput(objective=request.training_objective or request.description)
        training_agent = VisionEnhancedTrainingAgent(
            user_input=user_input,
            source_information="Visual demonstration",
            target_audience="AI workforce"
        )
        
        # Start the learning session
        if request.training_objective:
            # This is a training demonstration
            result = training_agent.learn_from_demonstration(
                session_name=request.session_name,
                description=request.description
            )
            session_id = result
        else:
            # This is a general visual learning session
            visual_agent = VisualAgent()
            session_id = visual_agent.learn_from_demonstration(
                session_name=request.session_name,
                description=request.description
            )
        
        return LearningSessionResponse(
            session_id=session_id,
            status="started",
            message=f"Learning session '{request.session_name}' started successfully"
        )
        
    except Exception as e:
        logger.error(f"Error starting learning session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start learning session: {str(e)}")

@router.post("/learning/stop")
async def stop_learning_session(session_name: str):
    """Stop a visual learning session and process results."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    try:
        # For now, we'll use a simple approach
        # In a real implementation, you'd track active sessions
        visual_agent = VisualAgent()
        
        # Try to stop the learning session
        # Note: This is a simplified version - in practice you'd need session management
        result = "Learning session stopped. Results processing not yet implemented."
        
        return {
            "status": "stopped",
            "session_name": session_name,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error stopping learning session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop learning session: {str(e)}")

@router.get("/agents/{agent_name}/capabilities", response_model=AgentCapabilitiesResponse)
async def get_agent_capabilities(agent_name: str):
    """Get capabilities of a specific vision-enhanced agent."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    try:
        if agent_name.lower() == "visualagent":
            agent = VisualAgent()
            return AgentCapabilitiesResponse(
                agent_name=agent.agent_name,
                capabilities=agent.get_capabilities(),
                vision_available=agent.vision_available,
                learning_available=agent.learning_system is not None
            )
        elif agent_name.lower() == "visionenhancedtrainingagent":
            # Create a dummy user input for initialization
            user_input = UserInput(objective="Test")
            agent = VisionEnhancedTrainingAgent(
                user_input=user_input,
                source_information="Test",
                target_audience="Test"
            )
            return AgentCapabilitiesResponse(
                agent_name=agent.agent_name,
                capabilities=agent.capabilities,
                vision_available=agent.vision_available,
                learning_available=agent.learning_system is not None
            )
        else:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
            
    except Exception as e:
        logger.error(f"Error getting agent capabilities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent capabilities: {str(e)}")

@router.post("/training/create-visual-sop")
async def create_visual_sop(training_objective: str, source_info: str = ""):
    """Create a visual SOP using the Vision-Enhanced Training Agent."""
    if not VISION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Vision system not available")
    
    try:
        # Initialize the training agent
        user_input = UserInput(objective=training_objective)
        training_agent = VisionEnhancedTrainingAgent(
            user_input=user_input,
            source_information=source_info or "Visual analysis",
            target_audience="AI workforce"
        )
        
        # Create visual SOP with screenshots
        result = await training_agent._create_visual_sop_with_screenshots({
            "training_need": training_objective,
            "analysis": "Visual training need analysis"
        })
        
        return {
            "success": True,
            "message": "Visual SOP created successfully",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error creating visual SOP: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create visual SOP: {str(e)}")

@router.get("/status")
async def get_vision_status():
    """Get comprehensive status of the vision system."""
    if not VISION_AVAILABLE:
        return {
            "status": "unavailable",
            "vision_available": False,
            "agents": [],
            "message": "Vision system not available"
        }
    
    try:
        # Test basic vision functionality
        visual_agent = VisualAgent()
        
        status = {
            "status": "available",
            "vision_available": True,
            "agents": [
                {
                    "name": "VisualAgent",
                    "status": "available" if visual_agent.vision_available else "limited",
                    "capabilities": visual_agent.get_capabilities()
                }
            ],
            "message": "Vision system is operational"
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting vision status: {e}")
        return {
            "status": "error",
            "vision_available": False,
            "error": str(e),
            "message": "Error checking vision system status"
        }
