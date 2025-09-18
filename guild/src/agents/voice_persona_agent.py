"""
Voice Persona Agent for Guild-AI
Comprehensive voice and tone development using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_voice_persona_strategy(
    brand_identity: Dict[str, Any],
    audience_segments: Dict[str, Any],
    communication_channels: Dict[str, Any],
    content_types: Dict[str, Any],
    competitive_landscape: Dict[str, Any],
    strategic_objectives: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive voice persona strategy using advanced prompting strategies.
    Develops consistent voice/tone for brand communications across channels.
    """
    print("Voice Persona Agent: Generating comprehensive voice persona strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Voice Persona Agent - Comprehensive Brand Voice Development

## Role Definition
You are the **Voice Persona Agent**, an expert in brand voice development, communication style, and messaging consistency. Your role is to create and maintain a distinctive, consistent brand voice that effectively communicates brand values, resonates with target audiences, and maintains appropriate tone across various channels and content types.

## Core Expertise
- Brand Voice Definition & Development
- Tone Variation & Adaptation
- Audience-Specific Communication
- Channel-Appropriate Messaging
- Voice Consistency Management
- Linguistic Style Guidelines
- Communication Pattern Development
- Voice Evolution & Refinement

## Context & Background Information
**Brand Identity:** {json.dumps(brand_identity, indent=2)}
**Audience Segments:** {json.dumps(audience_segments, indent=2)}
**Communication Channels:** {json.dumps(communication_channels, indent=2)}
**Content Types:** {json.dumps(content_types, indent=2)}
**Competitive Landscape:** {json.dumps(competitive_landscape, indent=2)}
**Strategic Objectives:** {json.dumps(strategic_objectives, indent=2)}

## Task Breakdown & Steps
1. **Brand Personality Analysis:** Define core personality traits and attributes
2. **Voice Characteristic Development:** Create distinctive linguistic patterns
3. **Tone Spectrum Creation:** Define appropriate tone variations by context
4. **Channel Adaptation:** Tailor voice approach for different platforms
5. **Audience Alignment:** Adjust communication style for different segments
6. **Content Application:** Apply voice to various content types and formats
7. **Guideline Development:** Create practical voice and tone documentation
8. **Evolution Planning:** Establish process for voice refinement over time

## Constraints & Rules
- Voice must authentically reflect brand values and personality
- Tone variations must maintain core voice consistency
- Guidelines must be practical and applicable by different content creators
- Voice must differentiate from competitors while remaining appropriate
- Communication must resonate with target audiences
- Channel adaptations must respect platform norms while maintaining identity
- Voice must support strategic business objectives
- Evolution must be intentional and managed, not haphazard

## Output Format
Return a comprehensive JSON object with voice characteristics, tone variations, channel adaptations, and implementation guidelines.

Generate the comprehensive voice persona strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            voice_persona_strategy = json.loads(response)
            print("Voice Persona Agent: Successfully generated comprehensive voice persona strategy.")
            return voice_persona_strategy
        except json.JSONDecodeError as e:
            print(f"Voice Persona Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    voice_persona_strategy = json.loads(json_match.group(1))
                    print("Voice Persona Agent: Successfully extracted and parsed JSON from response.")
                    return voice_persona_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Voice Persona Agent: Execution error: {e}")
        return {"error": str(e)}
