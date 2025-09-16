from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

from guild.src.agents.onboarding_agent import OnboardingAgent
from guild.src.models.user_input import UserInput

router = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
)

class OnboardingConverseRequest(BaseModel):
    session_id: str # To maintain state across calls, a session ID is needed
    current_state: str
    user_response: Optional[str] = None

class OnboardingConverseResponse(BaseModel):
    agent_response: str
    is_complete: bool
    output_document: Optional[dict] = None
    next_state: str


@router.post("/converse", response_model=OnboardingConverseResponse)
async def converse_with_onboarding_agent(
    request: OnboardingConverseRequest
):
    """
    Handles a single turn in the conversational onboarding process.
    """
    try:
        if os.getenv("NO_LLM") == "1":
            return OnboardingConverseResponse(
                agent_response="Got it. I've saved your response. Let's continue.",
                is_complete=False,
                output_document=None,
                next_state="NEXT"
            )
        # In a real application, we would use the session_id to retrieve
        # the agent's state from a cache like Redis. For this example,
        # we re-instantiate the agent and set its state on each call.
        agent = OnboardingAgent(UserInput(objective="User Onboarding"))
        agent.state = request.current_state

        # The business_description would also need to be persisted in the session state
        # This is a simplification for now.
        if request.current_state == "AWAITING_BRAND_VOICE_PREFERENCES":
            agent.business_description = "A business description would be retrieved from session state here."

        response_data = await agent.run_conversational_step(user_response=request.user_response)

        return OnboardingConverseResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start", response_model=OnboardingConverseResponse)
async def start_onboarding_session():
    """
    Initiates a new onboarding conversation.
    """
    try:
        if os.getenv("NO_LLM") == "1":
            return OnboardingConverseResponse(
                agent_response="Welcome to Guild onboarding. I'll ask a few quick questions to learn about your business.",
                is_complete=False,
                output_document=None,
                next_state="START"
            )

        agent = OnboardingAgent(UserInput(objective="Start onboarding process"))
        response_data = await agent.run_conversational_step()

        return OnboardingConverseResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
