"""
Meeting Notes Agent for Guild-AI
Comprehensive meeting documentation using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

class MeetingNotesAgent:
    """
    Meeting Notes Agent for Guild-AI
    Expert in meeting documentation, conversation synthesis, and action tracking.
    """
    
    def __init__(self, name: str = "Meeting Notes Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Meeting Notes Agent"
        self.agent_type = "Documentation"
        self.role = "Comprehensive Discussion Documentation"
        self.expertise = [
            "Conversation Analysis & Synthesis",
            "Key Point Extraction",
            "Decision Documentation",
            "Action Item Tracking",
            "Meeting Summarization",
            "Context Preservation",
            "Information Organization",
            "Follow-up Facilitation"
        ]
        self.capabilities = [
            "Create structured, actionable meeting summaries",
            "Transform transcripts into clear, organized notes",
            "Extract and track action items with owners and deadlines",
            "Document decisions with context and rationale",
            "Generate concise meeting overviews",
            "Preserve important context and nuances",
            "Facilitate post-meeting follow-up",
            "Make information accessible for participants and non-attendees"
        ]
        self.meeting_history = []
        self.action_items = []
    
    async def generate_meeting_notes(
        self,
        meeting_transcript: str,
        meeting_context: Dict[str, Any],
        participant_information: Dict[str, Any],
        organizational_knowledge: Dict[str, Any],
        documentation_requirements: Dict[str, Any],
        follow_up_needs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive meeting notes from transcript.
        
        This method wraps the standalone function for class-based access.
        """
        return await generate_comprehensive_meeting_notes_strategy(
            meeting_transcript, meeting_context, participant_information,
            organizational_knowledge, documentation_requirements, follow_up_needs
        )
    
    def extract_action_items(self, notes: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract action items from meeting notes."""
        action_items = notes.get("action_items", [])
        for item in action_items:
            self.action_items.append({
                "description": item.get("description"),
                "owner": item.get("owner"),
                "deadline": item.get("deadline"),
                "status": "pending",
                "created_at": datetime.utcnow()
            })
        return self.action_items
    
    def track_meeting_history(self, meeting_data: Dict[str, Any]) -> None:
        """Track meeting history for reference."""
        self.meeting_history.append({
            "timestamp": datetime.utcnow(),
            "meeting_data": meeting_data,
            "meeting_id": meeting_data.get("id", f"meeting_{len(self.meeting_history)}")
        })

@inject_knowledge
async def generate_comprehensive_meeting_notes_strategy(
    meeting_transcript: str,
    meeting_context: Dict[str, Any],
    participant_information: Dict[str, Any],
    organizational_knowledge: Dict[str, Any],
    documentation_requirements: Dict[str, Any],
    follow_up_needs: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive meeting notes strategy using advanced prompting strategies.
    Creates structured, actionable meeting summaries with clear next steps.
    """
    print("Meeting Notes Agent: Generating comprehensive meeting notes strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Meeting Notes Agent - Comprehensive Discussion Documentation

## Role Definition
You are the **Meeting Notes Agent**, an expert in meeting documentation, conversation synthesis, and action tracking. Your role is to transform meeting transcripts or recordings into clear, structured, and actionable summaries that capture key points, decisions, action items, and insights while making the information accessible and useful for both participants and non-attendees.

## Core Expertise
- Conversation Analysis & Synthesis
- Key Point Extraction
- Decision Documentation
- Action Item Tracking
- Meeting Summarization
- Context Preservation
- Information Organization
- Follow-up Facilitation

## Context & Background Information
**Meeting Transcript:** {meeting_transcript[:1000]}... [truncated for prompt length]
**Meeting Context:** {json.dumps(meeting_context, indent=2)}
**Participant Information:** {json.dumps(participant_information, indent=2)}
**Organizational Knowledge:** {json.dumps(organizational_knowledge, indent=2)}
**Documentation Requirements:** {json.dumps(documentation_requirements, indent=2)}
**Follow-up Needs:** {json.dumps(follow_up_needs, indent=2)}

## Task Breakdown & Steps
1. **Content Analysis:** Review transcript and identify key discussion elements
2. **Structure Development:** Create logical organization for notes
3. **Key Point Extraction:** Identify and articulate main discussion points
4. **Decision Documentation:** Clearly record all decisions and rationales
5. **Action Tracking:** Capture commitments, owners, and deadlines
6. **Summary Creation:** Develop concise overview of meeting outcomes
7. **Context Preservation:** Maintain important background and nuance
8. **Format Optimization:** Structure notes for maximum usability

## Constraints & Rules
- Notes must be concise while preserving essential information
- Action items must include clear ownership and deadlines
- Decisions must include context and rationale when available
- Structure must facilitate quick comprehension and reference
- Sensitive information must be handled appropriately
- Attribution must be accurate when relevant
- Language must be clear and professional
- Format must be consistent and scannable

## Output Format
Return a comprehensive JSON object with meeting notes structure, content, action items, and follow-up recommendations.

Generate the comprehensive meeting notes strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            meeting_notes_strategy = json.loads(response)
            print("Meeting Notes Agent: Successfully generated comprehensive meeting notes strategy.")
            return meeting_notes_strategy
        except json.JSONDecodeError as e:
            print(f"Meeting Notes Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    meeting_notes_strategy = json.loads(json_match.group(1))
                    print("Meeting Notes Agent: Successfully extracted and parsed JSON from response.")
                    return meeting_notes_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Meeting Notes Agent: Execution error: {e}")
        return {"error": str(e)}
