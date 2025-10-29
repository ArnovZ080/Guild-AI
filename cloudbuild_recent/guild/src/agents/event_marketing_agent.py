"""
Event Marketing Agent for Guild-AI
Comprehensive event planning and marketing using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_event_marketing_strategy(
    event_objectives: str,
    target_audience: Dict[str, Any],
    event_format: Dict[str, Any],
    content_requirements: Dict[str, Any],
    promotion_channels: Dict[str, Any],
    integration_needs: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive event marketing strategy using advanced prompting strategies.
    Plans webinars, workshops, in-person events, and integrates with platforms like Eventbrite/Zoom.
    """
    print("Event Marketing Agent: Generating comprehensive event marketing strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Event Marketing Agent - Comprehensive Event Planning & Promotion

## Role Definition
You are the **Event Marketing Agent**, an expert in event strategy, planning, execution, and promotion. Your role is to conceptualize, plan, promote, and manage various event formats including webinars, workshops, conferences, and in-person gatherings, while integrating with platforms like Eventbrite, Zoom, and social media to maximize attendance and engagement.

## Core Expertise
- Event Strategy & Objective Setting
- Event Format Selection & Design
- Content Development & Speaker Management
- Promotional Campaign Planning
- Platform Integration & Technical Setup
- Attendee Experience Optimization
- Event Analytics & Performance Measurement
- Post-Event Engagement & Follow-up

## Context & Background Information
**Event Objectives:** {event_objectives}
**Target Audience:** {json.dumps(target_audience, indent=2)}
**Event Format:** {json.dumps(event_format, indent=2)}
**Content Requirements:** {json.dumps(content_requirements, indent=2)}
**Promotion Channels:** {json.dumps(promotion_channels, indent=2)}
**Integration Needs:** {json.dumps(integration_needs, indent=2)}

## Task Breakdown & Steps
1. **Event Strategy Development:** Define event goals, format, and success metrics
2. **Content Planning:** Design agenda, topics, and speaker/presenter requirements
3. **Platform Selection:** Choose and configure appropriate event platforms and tools
4. **Promotional Campaign:** Create multi-channel promotion strategy and materials
5. **Registration Management:** Set up registration process and attendee communications
6. **Technical Setup:** Configure platform integrations, testing, and backup plans
7. **Event Execution:** Manage live event flow, engagement, and troubleshooting
8. **Post-Event Activities:** Analyze performance, follow-up, and content repurposing

## Constraints & Rules
- Event format must align with objectives and audience preferences
- Content must be valuable, engaging, and relevant to the target audience
- Promotional strategy must reach the target audience effectively
- Platform integrations must be seamless and user-friendly
- Registration process must be frictionless and capture necessary information
- Technical setup must include contingency plans for potential issues
- Event execution must prioritize attendee experience and engagement
- Post-event activities must maximize the long-term value of the event

## Output Format
Return a comprehensive JSON object with event strategy, planning details, promotional campaign, and execution framework.

Generate the comprehensive event marketing strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            event_strategy = json.loads(response)
            print("Event Marketing Agent: Successfully generated comprehensive event marketing strategy.")
            return event_strategy
        except json.JSONDecodeError as e:
            print(f"Event Marketing Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    event_strategy = json.loads(json_match.group(1))
                    print("Event Marketing Agent: Successfully extracted and parsed JSON from response.")
                    return event_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Event Marketing Agent: Execution error: {e}")
        return {"error": str(e)}

@dataclass
class Event:
    event_id: str
    name: str
    type: str  # webinar, workshop, conference, meetup, etc.
    format: str  # virtual, in-person, hybrid
    date: datetime
    duration: int  # in minutes
    description: str
    objectives: List[str]
    target_audience: List[str]
    expected_attendees: int
    actual_attendees: int = 0
    status: str = "planning"  # planning, promoting, live, completed, cancelled
    registration_url: str = ""
    event_url: str = ""
    recording_url: str = ""
    tags: List[str] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []

@dataclass
class EventContent:
    content_id: str
    event_id: str
    title: str
    description: str
    format: str  # presentation, panel, workshop, Q&A, etc.
    duration: int  # in minutes
    speakers: List[Dict[str, str]]
    materials: Dict[str, str]  # type -> URL
    engagement_elements: List[str]
    preparation_status: str = "not_started"  # not_started, in_progress, ready, delivered

class EventMarketingAgent:
    """
    Event Marketing Agent - Expert in event strategy, planning, execution, and promotion
    
    Conceptualizes, plans, promotes, and manages various event formats including webinars, workshops, 
    conferences, and in-person gatherings, integrating with platforms like Eventbrite and Zoom.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Event Marketing Agent"
        self.agent_type = "Marketing & Growth"
        self.capabilities = [
            "Event strategy and objective setting",
            "Event format selection and design",
            "Content development and speaker management",
            "Promotional campaign planning",
            "Platform integration and technical setup",
            "Attendee experience optimization",
            "Event analytics and performance measurement",
            "Post-event engagement and follow-up"
        ]
        self.events = {}
        self.event_content = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Event Marketing Agent.
        Implements comprehensive event planning and marketing using advanced prompting strategies.
        """
        try:
            print(f"Event Marketing Agent: Starting comprehensive event planning and marketing...")
            
            # Define comprehensive event marketing parameters
            event_objectives = "Plan and execute a successful webinar series to showcase Guild-AI capabilities and generate qualified leads"
            
            target_audience = {
                "primary_segments": [
                    {
                        "name": "Tech-Savvy Solopreneurs",
                        "description": "Independent professionals who need to scale operations without hiring",
                        "pain_points": ["time_constraints", "resource_limitations", "scaling_challenges"],
                        "interests": ["productivity", "automation", "AI tools"],
                        "preferred_channels": ["LinkedIn", "Twitter", "Tech communities"]
                    },
                    {
                        "name": "Lean Startups",
                        "description": "Early-stage companies with small teams looking to maximize output",
                        "pain_points": ["limited_budget", "talent_gaps", "operational_bottlenecks"],
                        "interests": ["growth_hacking", "efficiency", "cost_optimization"],
                        "preferred_channels": ["Startup communities", "Tech events", "Founder networks"]
                    }
                ],
                "secondary_segments": [
                    {
                        "name": "Small Agencies",
                        "description": "Marketing, design, and development agencies with 5-15 employees",
                        "pain_points": ["client_demands", "workflow_management", "creative_production_scale"],
                        "interests": ["client_satisfaction", "margin_improvement", "competitive_services"],
                        "preferred_channels": ["Industry publications", "Agency networks", "Professional associations"]
                    }
                ],
                "demographic_filters": {
                    "roles": ["Founder", "CEO", "Solopreneur", "Freelancer", "Small Business Owner"],
                    "industries": ["Technology", "Marketing", "Professional Services", "E-commerce", "Content Creation"],
                    "company_size": "1-15 employees",
                    "tech_savviness": "Medium to High"
                },
                "behavioral_traits": {
                    "early_adopters": true,
                    "productivity_focused": true,
                    "value_driven": true,
                    "time_constrained": true
                }
            }
            
            event_format = {
                "primary_format": "webinar_series",
                "event_types": [
                    {
                        "type": "Educational Webinar",
                        "duration": 45,
                        "frequency": "Monthly",
                        "platform": "Zoom",
                        "max_attendees": 500,
                        "interaction_level": "Medium",
                        "recording_plans": "Full recording with post-event access"
                    },
                    {
                        "type": "Live Demo Workshop",
                        "duration": 60,
                        "frequency": "Bi-monthly",
                        "platform": "Zoom",
                        "max_attendees": 100,
                        "interaction_level": "High",
                        "recording_plans": "Partial recording (demo portions only)"
                    },
                    {
                        "type": "Expert Panel Discussion",
                        "duration": 60,
                        "frequency": "Quarterly",
                        "platform": "Zoom",
                        "max_attendees": 300,
                        "interaction_level": "Medium-Low",
                        "recording_plans": "Full recording with post-event access"
                    }
                ],
                "series_structure": {
                    "name": "AI Workforce Mastery Series",
                    "cadence": "Consistent monthly event with rotating formats",
                    "continuity_elements": ["Consistent branding", "Host/moderator", "Content themes"],
                    "standalone_value": "Each event provides complete value independently"
                },
                "technical_requirements": {
                    "platforms": ["Zoom Webinar", "Eventbrite", "LinkedIn Events"],
                    "integrations": ["CRM", "Email marketing platform", "Social media"],
                    "production_quality": "Professional with branded overlays",
                    "team_needs": ["Host/moderator", "Technical producer", "Chat moderator"]
                }
            }
            
            content_requirements = {
                "content_themes": [
                    {
                        "theme": "AI Workforce Fundamentals",
                        "description": "Introduction to the concept of an AI workforce and its applications",
                        "target_segments": ["Tech-Savvy Solopreneurs", "Lean Startups"],
                        "potential_topics": [
                            "Building Your AI Team: Roles and Capabilities",
                            "From Solo to Scale: How AI Multiplies Your Output",
                            "The Economics of an AI Workforce vs. Traditional Hiring"
                        ]
                    },
                    {
                        "theme": "Practical Applications",
                        "description": "Real-world use cases and demonstrations of Guild-AI in action",
                        "target_segments": ["All segments"],
                        "potential_topics": [
                            "Content Creation Automation: From Idea to Distribution",
                            "Customer Service Automation That Maintains the Human Touch",
                            "Research & Analysis: How AI Can Do the Heavy Lifting"
                        ]
                    },
                    {
                        "theme": "Implementation & Integration",
                        "description": "Technical aspects of implementing an AI workforce",
                        "target_segments": ["Lean Startups", "Small Agencies"],
                        "potential_topics": [
                            "Integrating Guild-AI with Your Existing Tools and Workflows",
                            "Data Security and Privacy When Working with AI",
                            "Training Your AI Workforce for Your Specific Business Needs"
                        ]
                    }
                ],
                "content_formats": {
                    "presentations": {
                        "duration": "15-20 minutes",
                        "style": "Educational with visual examples",
                        "slide_requirements": "Clean, visual, minimal text"
                    },
                    "demos": {
                        "duration": "10-15 minutes",
                        "style": "Live walkthrough of features",
                        "preparation": "Scripted scenarios with real-world applications"
                    },
                    "q_and_a": {
                        "duration": "10-15 minutes",
                        "style": "Interactive with audience questions",
                        "preparation": "Prepared common questions and answers"
                    },
                    "panel_discussions": {
                        "duration": "30-40 minutes",
                        "style": "Conversational with guided topics",
                        "participants": "2-3 experts plus moderator"
                    }
                },
                "engagement_elements": {
                    "polls": {
                        "frequency": "2-3 per webinar",
                        "purpose": "Audience engagement and data collection"
                    },
                    "chat": {
                        "management": "Dedicated chat moderator",
                        "interaction": "Regular acknowledgment of questions/comments"
                    },
                    "breakout_sessions": {
                        "applicability": "Workshops only",
                        "duration": "10-15 minutes",
                        "facilitation": "Guided exercises with clear instructions"
                    },
                    "calls_to_action": {
                        "timing": "Beginning, middle, and end",
                        "types": ["Resource download", "Free trial", "Follow-up consultation"]
                    }
                },
                "speaker_requirements": {
                    "internal_speakers": [
                        {
                            "role": "Product Expert",
                            "responsibilities": "Feature demonstrations and technical questions"
                        },
                        {
                            "role": "Customer Success Manager",
                            "responsibilities": "Use cases and implementation guidance"
                        }
                    ],
                    "external_speakers": [
                        {
                            "type": "Customer Testimonials",
                            "selection_criteria": "Success stories with measurable results"
                        },
                        {
                            "type": "Industry Experts",
                            "selection_criteria": "Complementary expertise and audience alignment"
                        }
                    ],
                    "speaker_preparation": {
                        "briefing_process": "Comprehensive brief with key messages",
                        "rehearsal_requirements": "Mandatory technical check and content review",
                        "materials_deadline": "1 week before event"
                    }
                }
            }
            
            promotion_channels = {
                "digital_channels": {
                    "email_marketing": {
                        "segments": ["Current customers", "Leads", "Newsletter subscribers"],
                        "sequence": ["Announcement", "Reminder", "Final call", "Follow-up"],
                        "timing": "First announcement 2 weeks prior",
                        "personalization": "Based on previous engagement and segment"
                    },
                    "social_media": {
                        "platforms": {
                            "LinkedIn": {
                                "content_types": ["Event posts", "Speaker highlights", "Topic teasers"],
                                "frequency": "3x per week leading up to event",
                                "paid_promotion": "Targeted ads to ideal attendee profile"
                            },
                            "Twitter": {
                                "content_types": ["Short announcements", "Speaker quotes", "Industry stats"],
                                "frequency": "Daily week of event",
                                "hashtag_strategy": "Industry + topic specific"
                            }
                        },
                        "content_calendar": "Coordinated across platforms with consistent messaging"
                    },
                    "content_marketing": {
                        "blog_posts": {
                            "topics": ["Related to webinar theme", "Speaker interviews", "Industry challenges"],
                            "timing": "1-2 weeks before event",
                            "distribution": "Newsletter, social media, partner channels"
                        },
                        "videos": {
                            "types": ["Speaker interviews", "Topic previews", "Previous event highlights"],
                            "length": "30-90 seconds",
                            "platforms": ["YouTube", "LinkedIn", "Website"]
                        }
                    }
                },
                "partnership_channels": {
                    "co_marketing": {
                        "partner_types": ["Complementary tools", "Industry associations", "Influencers"],
                        "arrangements": ["Mutual promotion", "Co-hosted events", "Guest appearances"],
                        "requirements": "Audience alignment and promotional commitment"
                    },
                    "community_outreach": {
                        "target_communities": ["Relevant Slack groups", "Reddit communities", "Facebook groups"],
                        "approach": "Value-first with community guidelines respect",
                        "timing": "Ongoing relationship building with event-specific announcements"
                    }
                },
                "direct_outreach": {
                    "sales_team_invitations": {
                        "prospect_segments": ["Hot leads", "Recently engaged", "Competitive users"],
                        "personalization": "Specific value proposition for each prospect",
                        "follow_up": "Structured before and after event"
                    },
                    "personal_invitations": {
                        "target_recipients": ["High-value prospects", "Industry influencers", "Potential partners"],
                        "sender": "Relevant team member with relationship",
                        "customization": "Specific aspect of event relevant to recipient"
                    }
                },
                "registration_optimization": {
                    "landing_page": {
                        "key_elements": ["Clear value proposition", "Speaker credentials", "Social proof"],
                        "form_fields": "Minimal with progressive profiling",
                        "a_b_testing": "Headlines and CTA variations"
                    },
                    "registration_incentives": {
                        "early_bird": "Additional resources or access",
                        "referral_program": "Rewards for bringing additional attendees",
                        "exclusive_content": "Registrant-only materials"
                    }
                }
            }
            
            integration_needs = {
                "platform_integrations": {
                    "event_hosting": {
                        "platform": "Zoom Webinar",
                        "requirements": ["Custom branding", "Polling", "Q&A", "Breakout rooms"],
                        "backup_solution": "Zoom Meeting with adjusted format",
                        "recording_setup": "Cloud recording with automatic transcription"
                    },
                    "registration_management": {
                        "platform": "Eventbrite",
                        "requirements": ["Custom form fields", "Automated emails", "Calendar integration"],
                        "data_collection": "GDPR-compliant lead information",
                        "payment_processing": "For premium events (if applicable)"
                    }
                },
                "marketing_integrations": {
                    "crm": {
                        "system": "HubSpot",
                        "data_flow": "Bi-directional with registration platform",
                        "lead_scoring": "Based on registration and attendance",
                        "automation": "Workflow triggers for follow-up"
                    },
                    "email_marketing": {
                        "platform": "HubSpot Email",
                        "integration_points": ["Registration confirmation", "Reminder sequence", "Follow-up sequence"],
                        "segmentation": "Based on registration data and event interaction"
                    },
                    "social_media": {
                        "tools": "Buffer/Hootsuite",
                        "functionality": "Scheduled promotion and live event updates",
                        "monitoring": "Hashtag and mention tracking during event"
                    }
                },
                "content_delivery_integrations": {
                    "slide_sharing": {
                        "method": "Screen sharing with downloadable PDF",
                        "accessibility": "Alt text and readable fonts"
                    },
                    "resource_distribution": {
                        "method": "Email delivery and event console links",
                        "tracking": "Download and engagement metrics"
                    },
                    "video_distribution": {
                        "platforms": ["YouTube (unlisted)", "Website embedded player", "Email link"],
                        "access_control": "Form-gated for lead generation"
                    }
                },
                "analytics_integrations": {
                    "attendance_tracking": {
                        "metrics": ["Registration to attendance ratio", "Attendance duration", "Engagement actions"],
                        "reporting": "Post-event dashboard with key metrics"
                    },
                    "engagement_analysis": {
                        "data_points": ["Poll responses", "Questions asked", "Resource downloads"],
                        "visualization": "Engagement heat map by content segment"
                    },
                    "conversion_tracking": {
                        "attribution": "UTM parameters and registration source",
                        "funnel_analysis": "Registration to customer journey mapping"
                    }
                }
            }
            
            # Generate comprehensive event marketing strategy
            event_strategy = await generate_comprehensive_event_marketing_strategy(
                event_objectives=event_objectives,
                target_audience=target_audience,
                event_format=event_format,
                content_requirements=content_requirements,
                promotion_channels=promotion_channels,
                integration_needs=integration_needs
            )
            
            # Execute the event marketing strategy
            result = await self._execute_event_strategy(event_strategy)
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Event Marketing Agent",
                "strategy_type": "comprehensive_event_marketing",
                "event_strategy": event_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Event Marketing Agent: Comprehensive event planning and marketing completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Event Marketing Agent: Error in comprehensive event planning and marketing: {e}")
            return {
                "agent": "Event Marketing Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_event_strategy(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute event marketing strategy implementation."""
        try:
            # Extract strategy components
            event_strategy = strategy.get("event_strategy", {})
            content_plan = strategy.get("content_plan", {})
            promotional_campaign = strategy.get("promotional_campaign", {})
            technical_setup = strategy.get("technical_setup", {})
            
            # Create event object
            event_name = event_strategy.get("event_name", "AI Workforce Mastery Webinar")
            event_id = f"event_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            event_date_str = event_strategy.get("event_date", (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"))
            try:
                event_date = datetime.strptime(event_date_str, "%Y-%m-%d")
            except ValueError:
                event_date = datetime.now() + timedelta(days=30)
            
            event_format = event_strategy.get("event_format", {})
            
            event = Event(
                event_id=event_id,
                name=event_name,
                type=event_format.get("type", "webinar"),
                format=event_format.get("delivery_format", "virtual"),
                date=event_date,
                duration=event_format.get("duration", 60),
                description=event_strategy.get("event_description", ""),
                objectives=event_strategy.get("objectives", []),
                target_audience=event_strategy.get("target_audience", []),
                expected_attendees=event_strategy.get("expected_attendees", 100),
                status="planning",
                tags=event_strategy.get("tags", [])
            )
            
            self.events[event_id] = event
            
            # Create event content objects
            content_objects = {}
            for content_id, content_data in content_plan.get("content_segments", {}).items():
                if isinstance(content_data, dict):
                    content = EventContent(
                        content_id=content_id,
                        event_id=event_id,
                        title=content_data.get("title", ""),
                        description=content_data.get("description", ""),
                        format=content_data.get("format", "presentation"),
                        duration=content_data.get("duration", 15),
                        speakers=content_data.get("speakers", []),
                        materials=content_data.get("materials", {}),
                        engagement_elements=content_data.get("engagement_elements", []),
                        preparation_status="not_started"
                    )
                    
                    content_objects[content_id] = content
                    self.event_content[content_id] = content
            
            # Generate promotional plan
            promotional_plan = self._generate_promotional_plan(promotional_campaign, event)
            
            # Generate technical requirements
            technical_requirements = self._generate_technical_requirements(technical_setup, event)
            
            # Generate event timeline
            event_timeline = self._generate_event_timeline(event, content_objects)
            
            return {
                "status": "success",
                "message": "Event strategy executed successfully",
                "event_details": {
                    "id": event.event_id,
                    "name": event.name,
                    "type": event.type,
                    "format": event.format,
                    "date": event.date.strftime("%Y-%m-%d"),
                    "duration": event.duration,
                    "status": event.status
                },
                "content_segments": len(content_objects),
                "promotional_plan": promotional_plan,
                "technical_requirements": technical_requirements,
                "event_timeline": event_timeline,
                "execution_metrics": {
                    "event_created": True,
                    "content_segments_created": len(content_objects),
                    "planning_quality": "comprehensive",
                    "readiness_status": "planning_phase"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Event strategy execution failed: {str(e)}"
            }
    
    def _generate_promotional_plan(self, promotional_campaign: Dict[str, Any], event: Event) -> Dict[str, Any]:
        """Generate promotional plan for the event."""
        # Calculate key dates based on event date
        event_date = event.date
        
        start_promotion_date = event_date - timedelta(days=30)
        early_bird_end_date = event_date - timedelta(days=14)
        final_push_date = event_date - timedelta(days=7)
        reminder_dates = [
            event_date - timedelta(days=7),
            event_date - timedelta(days=3),
            event_date - timedelta(days=1)
        ]
        
        # Generate promotional timeline
        promotional_timeline = [
            {
                "phase": "Pre-Promotion",
                "start_date": start_promotion_date.strftime("%Y-%m-%d"),
                "end_date": (start_promotion_date + timedelta(days=7)).strftime("%Y-%m-%d"),
                "activities": [
                    "Finalize event landing page",
                    "Prepare promotional assets",
                    "Brief internal teams",
                    "Set up tracking parameters"
                ]
            },
            {
                "phase": "Announcement",
                "start_date": (start_promotion_date + timedelta(days=7)).strftime("%Y-%m-%d"),
                "end_date": early_bird_end_date.strftime("%Y-%m-%d"),
                "activities": [
                    "Launch announcement email",
                    "Publish social media announcements",
                    "Activate early bird incentives",
                    "Begin partner cross-promotion"
                ]
            },
            {
                "phase": "Content Teasers",
                "start_date": (early_bird_end_date - timedelta(days=7)).strftime("%Y-%m-%d"),
                "end_date": final_push_date.strftime("%Y-%m-%d"),
                "activities": [
                    "Share speaker highlights",
                    "Release topic teasers",
                    "Publish related blog content",
                    "Distribute preview video clips"
                ]
            },
            {
                "phase": "Final Push",
                "start_date": final_push_date.strftime("%Y-%m-%d"),
                "end_date": event_date.strftime("%Y-%m-%d"),
                "activities": [
                    "Send reminder emails",
                    "Increase social media frequency",
                    "Direct outreach to high-value prospects",
                    "Last chance messaging"
                ]
            },
            {
                "phase": "Post-Event",
                "start_date": event_date.strftime("%Y-%m-%d"),
                "end_date": (event_date + timedelta(days=14)).strftime("%Y-%m-%d"),
                "activities": [
                    "Thank you emails with recording",
                    "Share event highlights",
                    "Follow-up with attendees",
                    "Re-engagement with no-shows"
                ]
            }
        ]
        
        # Generate channel-specific content
        channel_content = {}
        
        # Email content
        channel_content["email"] = {
            "announcement": {
                "subject": f"Announcing: {event.name} - {event.date.strftime('%B %d, %Y')}",
                "key_elements": [
                    "Event value proposition",
                    "Date and time with timezone",
                    "Speaker highlights",
                    "Early bird incentive",
                    "Clear registration CTA"
                ]
            },
            "reminder_sequence": [
                {
                    "timing": "7 days before",
                    "subject": f"Coming Soon: {event.name} - Save Your Spot",
                    "focus": "Content value and limited spots"
                },
                {
                    "timing": "3 days before",
                    "subject": f"Your {event.name} Access Details",
                    "focus": "Preparation and what to expect"
                },
                {
                    "timing": "1 day before",
                    "subject": f"Tomorrow: {event.name} - Final Reminder",
                    "focus": "Last chance and quick access link"
                }
            ],
            "follow_up": {
                "attendees": {
                    "subject": f"Thanks for Attending {event.name} - Here's What's Next",
                    "key_elements": [
                        "Thank you message",
                        "Recording access",
                        "Resource downloads",
                        "Next steps/CTA",
                        "Feedback request"
                    ]
                },
                "no_shows": {
                    "subject": f"Missed {event.name}? Here's What You Missed",
                    "key_elements": [
                        "Recording access",
                        "Key takeaways",
                        "Limited-time offer",
                        "Next event information"
                    ]
                }
            }
        }
        
        # Social media content
        channel_content["social_media"] = {
            "linkedin": [
                {
                    "content_type": "Announcement Post",
                    "timing": "30 days before",
                    "key_elements": [
                        "Professional event graphic",
                        "Clear value proposition",
                        "Speaker credentials",
                        "Registration link",
                        "Relevant hashtags"
                    ]
                },
                {
                    "content_type": "Speaker Highlight",
                    "timing": "21 days before",
                    "key_elements": [
                        "Speaker headshot",
                        "Expertise highlights",
                        "Topic preview",
                        "Registration link"
                    ]
                },
                {
                    "content_type": "Content Teaser",
                    "timing": "14 days before",
                    "key_elements": [
                        "Key insight preview",
                        "Problem being solved",
                        "Registration link with early bird ending reminder"
                    ]
                },
                {
                    "content_type": "Final Reminder",
                    "timing": "3 days before",
                    "key_elements": [
                        "Last chance messaging",
                        "Quick registration link",
                        "FOMO element"
                    ]
                }
            ],
            "twitter": [
                {
                    "content_type": "Announcement Thread",
                    "timing": "30 days before",
                    "key_elements": [
                        "Eye-catching graphic",
                        "Thread with event details",
                        "Speaker introductions",
                        "Registration link",
                        "Relevant hashtags"
                    ]
                },
                {
                    "content_type": "Quote Graphics",
                    "timing": "Weekly leading up to event",
                    "key_elements": [
                        "Insightful quotes related to topics",
                        "Event branding",
                        "Registration link"
                    ]
                },
                {
                    "content_type": "Countdown Posts",
                    "timing": "7 days before, then daily",
                    "key_elements": [
                        "Days remaining",
                        "Quick value proposition",
                        "Registration link"
                    ]
                }
            ]
        }
        
        # Landing page elements
        landing_page = {
            "url_structure": f"/events/{event.type.lower().replace(' ', '-')}/{event.date.strftime('%Y-%m-%d')}/{event.name.lower().replace(' ', '-')}",
            "key_sections": [
                {
                    "section": "Hero",
                    "elements": [
                        "Event name and date",
                        "Compelling headline",
                        "Brief value proposition",
                        "Registration button"
                    ]
                },
                {
                    "section": "Event Details",
                    "elements": [
                        "Date and time with timezone",
                        "Format and duration",
                        "Platform information",
                        "Cost (free or paid)"
                    ]
                },
                {
                    "section": "Value Proposition",
                    "elements": [
                        "3-5 key takeaways",
                        "Who should attend",
                        "Problem being solved"
                    ]
                },
                {
                    "section": "Speakers",
                    "elements": [
                        "Headshots",
                        "Bios",
                        "Credentials",
                        "Social proof"
                    ]
                },
                {
                    "section": "Agenda",
                    "elements": [
                        "Timeline",
                        "Session descriptions",
                        "Engagement opportunities"
                    ]
                },
                {
                    "section": "Registration Form",
                    "elements": [
                        "Minimal required fields",
                        "Clear value exchange",
                        "Privacy policy reference",
                        "Confirmation mechanism"
                    ]
                },
                {
                    "section": "FAQ",
                    "elements": [
                        "Technical requirements",
                        "Recording availability",
                        "Cancellation policy",
                        "Contact information"
                    ]
                }
            ]
        }
        
        return {
            "campaign_name": f"{event.name} Promotional Campaign",
            "target_audience": event.target_audience,
            "promotional_timeline": promotional_timeline,
            "channel_content": channel_content,
            "landing_page": landing_page,
            "registration_goal": event.expected_attendees,
            "key_metrics": [
                "Landing page conversion rate",
                "Email open and click-through rates",
                "Social media engagement",
                "Registration to attendance ratio",
                "Cost per registration"
            ],
            "success_criteria": {
                "registration_target": event.expected_attendees,
                "attendance_rate": "65%+",
                "engagement_score": "7/10+",
                "lead_quality": "40%+ MQLs"
            }
        }
    
    def _generate_technical_requirements(self, technical_setup: Dict[str, Any], event: Event) -> Dict[str, Any]:
        """Generate technical requirements for the event."""
        # Determine platform based on event type and format
        platform = "Zoom Webinar"
        if event.type.lower() == "workshop" and event.expected_attendees < 100:
            platform = "Zoom Meeting"
        elif event.format.lower() == "in-person":
            platform = "On-site AV + Zoom for hybrid component"
        
        # Generate platform configuration
        platform_config = {
            "zoom_webinar": {
                "account_type": "Licensed Pro with Webinar add-on",
                "capacity_needed": max(100, event.expected_attendees + 50),  # Buffer
                "key_settings": [
                    "Q&A enabled",
                    "Polling enabled",
                    "Chat moderation on",
                    "Registration required",
                    "Practice session enabled",
                    "Cloud recording enabled",
                    "Automatic transcription enabled"
                ],
                "branding_elements": [
                    "Custom virtual background for hosts",
                    "Branded waiting room message",
                    "Co-branded slides for intro/outro"
                ],
                "presenter_settings": [
                    "Host and co-host roles assigned",
                    "Panelist invitations for speakers",
                    "Screen sharing permissions"
                ]
            }
        }
        
        # Generate registration platform configuration
        registration_config = {
            "eventbrite": {
                "event_type": "Online Event",
                "visibility": "Public",
                "ticket_types": [
                    {
                        "name": "General Admission",
                        "price": "Free",
                        "quantity": event.expected_attendees * 2  # Allow overbooking
                    }
                ],
                "form_fields": [
                    {"name": "First Name", "type": "text", "required": True},
                    {"name": "Last Name", "type": "text", "required": True},
                    {"name": "Email", "type": "email", "required": True},
                    {"name": "Company", "type": "text", "required": True},
                    {"name": "Job Title", "type": "text", "required": True},
                    {"name": "Company Size", "type": "dropdown", "required": False},
                    {"name": "How did you hear about us?", "type": "dropdown", "required": False}
                ],
                "confirmation_email": {
                    "sender": "Guild-AI Events",
                    "subject": f"You're registered for {event.name}",
                    "key_elements": [
                        "Thank you message",
                        "Event details recap",
                        "Add to calendar link",
                        "Preparation instructions"
                    ]
                }
            }
        }
        
        # Generate integrations configuration
        integrations_config = {
            "crm_integration": {
                "platform": "HubSpot",
                "data_flow": [
                    {
                        "direction": "Registration to CRM",
                        "data_points": ["Contact information", "Registration date", "Registration source"],
                        "automation": "Create/update contact and add to event campaign"
                    },
                    {
                        "direction": "Attendance to CRM",
                        "data_points": ["Attendance status", "Attendance duration", "Engagement metrics"],
                        "automation": "Update contact properties and trigger follow-up workflow"
                    }
                ],
                "lead_scoring": {
                    "registration": 5,
                    "attendance": 10,
                    "question_asked": 5,
                    "resource_downloaded": 5
                }
            },
            "email_integration": {
                "platform": "HubSpot Email",
                "workflows": [
                    {
                        "name": "Event Reminder Sequence",
                        "triggers": "Registration",
                        "emails": ["7-day reminder", "1-day reminder", "1-hour reminder"]
                    },
                    {
                        "name": "Post-Event Follow-up",
                        "triggers": "Event Completion",
                        "segmentation": ["Attended", "Registered but didn't attend"],
                        "emails": ["Thank you/Recording", "Resource follow-up", "Next steps"]
                    }
                ]
            }
        }
        
        # Generate technical checklist
        technical_checklist = [
            {
                "timeline": "2 weeks before",
                "tasks": [
                    "Set up webinar in Zoom",
                    "Configure registration in Eventbrite",
                    "Set up tracking links and UTM parameters",
                    "Test platform integrations",
                    "Create event in CRM"
                ]
            },
            {
                "timeline": "1 week before",
                "tasks": [
                    "Technical rehearsal with speakers",
                    "Test all engagement features (polls, Q&A)",
                    "Prepare backup plans for technical issues",
                    "Set up recording storage and processing",
                    "Prepare moderator and host guidelines"
                ]
            },
            {
                "timeline": "Day before",
                "tasks": [
                    "Final platform check",
                    "Verify all speakers have access",
                    "Test presentation sharing",
                    "Prepare backup presentation copies",
                    "Check audio and video quality"
                ]
            },
            {
                "timeline": "1 hour before",
                "tasks": [
                    "Host and speakers join early",
                    "Sound and video check",
                    "Review agenda and timing",
                    "Test polls and interactive elements",
                    "Prepare welcome slide"
                ]
            }
        ]
        
        return {
            "event_platform": {
                "primary_platform": platform,
                "configuration": platform_config
            },
            "registration_platform": {
                "platform": "Eventbrite",
                "configuration": registration_config
            },
            "integrations": integrations_config,
            "technical_checklist": technical_checklist,
            "required_team_roles": [
                {
                    "role": "Technical Producer",
                    "responsibilities": [
                        "Platform setup and configuration",
                        "Technical rehearsal management",
                        "Live event technical support",
                        "Recording management"
                    ]
                },
                {
                    "role": "Event Host/Moderator",
                    "responsibilities": [
                        "Speaker introductions",
                        "Agenda management",
                        "Q&A facilitation",
                        "Audience engagement"
                    ]
                },
                {
                    "role": "Chat Moderator",
                    "responsibilities": [
                        "Monitor and respond to chat",
                        "Flag questions for Q&A",
                        "Troubleshoot attendee issues",
                        "Share relevant resources"
                    ]
                }
            ],
            "contingency_plans": {
                "speaker_no-show": "Backup speaker or host covers content",
                "technical_failure": "Switch to backup platform or pre-recorded content",
                "low_attendance": "Proceed as planned with increased interaction",
                "platform_outage": "Reschedule with immediate communication"
            }
        }
    
    def _generate_event_timeline(self, event: Event, content_objects: Dict[str, EventContent]) -> Dict[str, Any]:
        """Generate comprehensive event timeline."""
        # Calculate key dates based on event date
        event_date = event.date
        
        planning_start = event_date - timedelta(days=60)
        content_deadline = event_date - timedelta(days=14)
        promotion_start = event_date - timedelta(days=30)
        technical_setup = event_date - timedelta(days=14)
        rehearsal_date = event_date - timedelta(days=7)
        
        # Generate planning timeline
        planning_timeline = [
            {
                "phase": "Strategy & Planning",
                "start_date": planning_start.strftime("%Y-%m-%d"),
                "end_date": (planning_start + timedelta(days=10)).strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Event strategy finalized",
                    "Target audience defined",
                    "Event format selected",
                    "Key objectives established",
                    "Success metrics defined"
                ]
            },
            {
                "phase": "Content Development",
                "start_date": (planning_start + timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": content_deadline.strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Content themes established",
                    "Speakers confirmed",
                    "Presentation outlines approved",
                    "Engagement elements designed",
                    "Final content review"
                ]
            },
            {
                "phase": "Promotion & Marketing",
                "start_date": promotion_start.strftime("%Y-%m-%d"),
                "end_date": event_date.strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Promotional assets created",
                    "Landing page published",
                    "Email sequences set up",
                    "Social media campaign launched",
                    "Partner promotions activated"
                ]
            },
            {
                "phase": "Technical Preparation",
                "start_date": technical_setup.strftime("%Y-%m-%d"),
                "end_date": (event_date - timedelta(days=1)).strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Platform configured",
                    "Integrations tested",
                    "Technical rehearsal completed",
                    "Backup plans established",
                    "Final technical check"
                ]
            },
            {
                "phase": "Event Execution",
                "start_date": event_date.strftime("%Y-%m-%d"),
                "end_date": event_date.strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Pre-event team briefing",
                    "Live event management",
                    "Attendee engagement facilitation",
                    "Technical support",
                    "Recording capture"
                ]
            },
            {
                "phase": "Post-Event Activities",
                "start_date": (event_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                "end_date": (event_date + timedelta(days=14)).strftime("%Y-%m-%d"),
                "key_milestones": [
                    "Recording processing and distribution",
                    "Attendee follow-up",
                    "Performance analysis",
                    "Lead handoff to sales",
                    "Event retrospective"
                ]
            }
        ]
        
        # Generate event day schedule
        event_duration_minutes = event.duration
        
        # Calculate time blocks
        start_time = datetime.combine(event_date.date(), datetime.strptime("13:00", "%H:%M").time())  # Default to 1 PM
        pre_event_time = start_time - timedelta(minutes=30)
        end_time = start_time + timedelta(minutes=event_duration_minutes)
        post_event_time = end_time + timedelta(minutes=15)
        
        # Create event day schedule
        event_day_schedule = [
            {
                "time_block": f"{pre_event_time.strftime('%H:%M')} - {start_time.strftime('%H:%M')}",
                "activity": "Pre-Event Setup",
                "description": "Technical checks, speaker briefing, platform preparation",
                "responsible": "Technical Producer, Host, Speakers"
            }
        ]
        
        # Add content segments to schedule
        current_time = start_time
        for i, content in enumerate(sorted(content_objects.values(), key=lambda x: x.duration, reverse=True)):
            segment_end = current_time + timedelta(minutes=content.duration)
            
            event_day_schedule.append({
                "time_block": f"{current_time.strftime('%H:%M')} - {segment_end.strftime('%H:%M')}",
                "activity": content.title,
                "description": content.description,
                "format": content.format,
                "responsible": ", ".join([speaker.get("name", "Speaker") for speaker in content.speakers]) if content.speakers else "Host"
            })
            
            current_time = segment_end
            
            # Add short breaks between major segments
            if i < len(content_objects) - 1 and content.duration > 15:
                break_end = current_time + timedelta(minutes=5)
                event_day_schedule.append({
                    "time_block": f"{current_time.strftime('%H:%M')} - {break_end.strftime('%H:%M')}",
                    "activity": "Short Break/Transition",
                    "description": "Brief pause, attendee engagement, transition to next segment",
                    "responsible": "Host"
                })
                current_time = break_end
        
        # Add post-event activities
        event_day_schedule.append({
            "time_block": f"{end_time.strftime('%H:%M')} - {post_event_time.strftime('%H:%M')}",
            "activity": "Post-Event Wrap-up",
            "description": "Final Q&A, next steps, call-to-action, event conclusion",
            "responsible": "Host, Technical Producer"
        })
        
        return {
            "event_name": event.name,
            "event_date": event_date.strftime("%Y-%m-%d"),
            "planning_timeline": planning_timeline,
            "event_day_schedule": event_day_schedule,
            "key_deadlines": {
                "content_finalization": content_deadline.strftime("%Y-%m-%d"),
                "technical_rehearsal": rehearsal_date.strftime("%Y-%m-%d"),
                "promotional_assets": (promotion_start + timedelta(days=3)).strftime("%Y-%m-%d"),
                "registration_target": (event_date - timedelta(days=1)).strftime("%Y-%m-%d"),
                "post_event_analysis": (event_date + timedelta(days=7)).strftime("%Y-%m-%d")
            },
            "responsibility_matrix": {
                "event_strategy": "Marketing Manager",
                "content_development": "Content Team",
                "speaker_management": "Event Coordinator",
                "promotional_campaign": "Marketing Team",
                "technical_setup": "Technical Producer",
                "event_hosting": "Event Host/Moderator",
                "post_event_follow_up": "Marketing & Sales Teams"
            }
        }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "event_types": ["Webinars", "Workshops", "Conferences", "Meetups", "Product Launches"],
            "delivery_formats": ["Virtual", "In-person", "Hybrid"],
            "platform_integrations": ["Zoom", "Eventbrite", "HubSpot", "LinkedIn Events"]
        }
