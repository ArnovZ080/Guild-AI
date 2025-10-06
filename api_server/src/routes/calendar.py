"""
Calendar API Routes
Handles calendar events, optimization, sync, and AI-powered features
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import json
import re

router = APIRouter(prefix="/calendar", tags=["calendar"])


# ==================== MODELS ====================

class EventType(str, Enum):
    MEETING = "meeting"
    PERSONAL = "personal"
    FINANCIAL = "financial"
    CONTENT = "content"
    WELLNESS = "wellness"
    AGENT_TASK = "agent_task"
    GOAL = "goal"
    BREAK = "break"


class EventPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RecurrenceFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class CalendarEvent(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    type: EventType
    priority: EventPriority = EventPriority.MEDIUM
    start_time: datetime
    end_time: datetime
    duration: Optional[int] = None  # in minutes
    location: Optional[str] = None
    attendees: List[str] = []
    agent_created: bool = False
    related_agents: List[str] = []
    agent_tasks: List[str] = []
    is_recurring: bool = False
    recurrence_rule: Optional[Dict[str, Any]] = None
    notification_enabled: bool = True
    sound_enabled: bool = False
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    external_calendar_id: Optional[str] = None  # For Google/Outlook sync
    external_source: Optional[str] = None  # "google", "outlook", etc.
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class NaturalLanguageEventCreate(BaseModel):
    user_id: str
    natural_language: str
    # e.g., "Lunch with John at noon Thursday" or "Weekly standup every Monday at 9am"


class EventOptimizationRequest(BaseModel):
    user_id: str
    date_range: Optional[Dict[str, datetime]] = None
    preferences: Dict[str, Any] = {}
    constraints: Dict[str, Any] = {
        "max_meetings_per_day": 5,
        "min_break_time": 15,
        "no_meetings_after": "18:00",
        "deep_work_hours": ["08:00-11:00"]
    }


class RecurringReportSchedule(BaseModel):
    user_id: str
    report_types: List[str]  # ['business', 'financial', 'customer', etc.]
    frequency: RecurrenceFrequency
    day: Optional[str] = None  # For weekly: 'monday', 'tuesday', etc.
    time: str  # "09:00"
    start_date: Optional[datetime] = None


class RescheduleRequest(BaseModel):
    user_id: str
    event_ids: List[str]
    auto_suggest: bool = True


class BreakScheduleRequest(BaseModel):
    user_id: str
    break_type: str  # 'short', 'medium', 'lunch', 'walk'
    date: datetime
    time: str
    duration: int
    notification: bool = True
    sound: bool = True


# ==================== NATURAL LANGUAGE PARSING ====================

class NaturalLanguageParser:
    """Parse natural language into structured calendar events"""
    
    # Time patterns
    TIME_PATTERNS = {
        'noon': '12:00',
        'midnight': '00:00',
        'morning': '09:00',
        'afternoon': '14:00',
        'evening': '18:00'
    }
    
    # Day patterns
    DAY_PATTERNS = {
        'monday': 0, 'mon': 0,
        'tuesday': 1, 'tue': 1, 'tues': 1,
        'wednesday': 2, 'wed': 2,
        'thursday': 3, 'thu': 3, 'thurs': 3,
        'friday': 4, 'fri': 4,
        'saturday': 5, 'sat': 5,
        'sunday': 6, 'sun': 6
    }
    
    @classmethod
    def parse(cls, text: str) -> Dict[str, Any]:
        """Parse natural language text into event structure"""
        text = text.lower().strip()
        result = {
            'title': '',
            'start_time': None,
            'duration': 60,  # default 1 hour
            'type': EventType.MEETING,
            'is_recurring': False
        }
        
        # Check for recurring patterns
        if any(word in text for word in ['every', 'weekly', 'daily', 'monthly']):
            result['is_recurring'] = True
            result['recurrence_rule'] = cls._parse_recurrence(text)
        
        # Extract time
        time_match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm)?', text)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            meridiem = time_match.group(3)
            
            if meridiem == 'pm' and hour < 12:
                hour += 12
            elif meridiem == 'am' and hour == 12:
                hour = 0
                
            result['time'] = f"{hour:02d}:{minute:02d}"
        else:
            # Check for keyword times
            for keyword, time_str in cls.TIME_PATTERNS.items():
                if keyword in text:
                    result['time'] = time_str
                    break
        
        # Extract day
        today = datetime.now()
        target_date = today
        
        if 'tomorrow' in text:
            target_date = today + timedelta(days=1)
        elif 'today' in text:
            target_date = today
        elif 'next week' in text:
            target_date = today + timedelta(days=7)
        else:
            # Check for specific day names
            for day_name, day_num in cls.DAY_PATTERNS.items():
                if day_name in text:
                    days_ahead = day_num - today.weekday()
                    if days_ahead <= 0:  # Target day already happened this week
                        days_ahead += 7
                    target_date = today + timedelta(days=days_ahead)
                    break
        
        # Set start_time
        if 'time' in result:
            hour, minute = map(int, result['time'].split(':'))
            result['start_time'] = target_date.replace(
                hour=hour, minute=minute, second=0, microsecond=0
            )
        else:
            result['start_time'] = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        # Extract title (everything before time/day indicators)
        title_text = text
        # Remove time and day references to get clean title
        for pattern in [r'\d{1,2}:?\d{2}?\s*(am|pm)?', r'at\s+\w+', r'on\s+\w+', 
                        r'tomorrow', r'today', r'next week', r'every \w+']:
            title_text = re.sub(pattern, '', title_text, flags=re.IGNORECASE)
        
        result['title'] = ' '.join(title_text.split()).strip().title()
        
        # Detect event type from keywords
        if any(word in text for word in ['meeting', 'call', 'zoom', 'teams']):
            result['type'] = EventType.MEETING
        elif any(word in text for word in ['lunch', 'dinner', 'breakfast', 'coffee']):
            result['type'] = EventType.PERSONAL
        elif any(word in text for word in ['workout', 'gym', 'yoga', 'exercise']):
            result['type'] = EventType.WELLNESS
        elif any(word in text for word in ['report', 'review', 'financial', 'budget']):
            result['type'] = EventType.FINANCIAL
        elif any(word in text for word in ['write', 'post', 'content', 'blog']):
            result['type'] = EventType.CONTENT
        
        return result
    
    @classmethod
    def _parse_recurrence(cls, text: str) -> Dict[str, Any]:
        """Parse recurrence patterns from text"""
        recurrence = {
            'frequency': RecurrenceFrequency.WEEKLY
        }
        
        if 'daily' in text or 'every day' in text:
            recurrence['frequency'] = RecurrenceFrequency.DAILY
        elif 'weekly' in text or 'every week' in text:
            recurrence['frequency'] = RecurrenceFrequency.WEEKLY
        elif 'monthly' in text or 'every month' in text:
            recurrence['frequency'] = RecurrenceFrequency.MONTHLY
        elif 'yearly' in text or 'every year' in text:
            recurrence['frequency'] = RecurrenceFrequency.YEARLY
        
        # Extract specific day for weekly recurrence
        if recurrence['frequency'] == RecurrenceFrequency.WEEKLY:
            for day_name, day_num in cls.DAY_PATTERNS.items():
                if day_name in text:
                    recurrence['day'] = day_name
                    break
        
        return recurrence


# ==================== API ENDPOINTS ====================

@router.get("/events")
async def get_events(
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    type: Optional[EventType] = None
):
    """Get calendar events for a user within a date range"""
    # TODO: Implement database query
    # For now, return mock data structure
    return {
        "success": True,
        "events": [],
        "count": 0
    }


@router.post("/events")
async def create_event(event: CalendarEvent):
    """Create a new calendar event"""
    # TODO: Save to database
    event.id = f"evt_{datetime.now().timestamp()}"
    event.created_at = datetime.now()
    event.updated_at = datetime.now()
    
    # TODO: Sync to external calendars if configured
    # if event.external_source:
    #     await sync_to_external_calendar(event)
    
    return {
        "success": True,
        "event": event.dict(),
        "message": "Event created successfully"
    }


@router.post("/events/natural")
async def create_event_from_natural_language(request: NaturalLanguageEventCreate):
    """Create event from natural language input"""
    parser = NaturalLanguageParser()
    parsed_data = parser.parse(request.natural_language)
    
    # Create event from parsed data
    event = CalendarEvent(
        user_id=request.user_id,
        title=parsed_data.get('title', 'Untitled Event'),
        type=parsed_data.get('type', EventType.MEETING),
        start_time=parsed_data['start_time'],
        end_time=parsed_data['start_time'] + timedelta(minutes=parsed_data.get('duration', 60)),
        duration=parsed_data.get('duration', 60),
        is_recurring=parsed_data.get('is_recurring', False),
        recurrence_rule=parsed_data.get('recurrence_rule')
    )
    
    # Save event
    event.id = f"evt_{datetime.now().timestamp()}"
    event.created_at = datetime.now()
    event.updated_at = datetime.now()
    
    return {
        "success": True,
        "event": event.dict(),
        "parsed_input": request.natural_language,
        "interpretation": parsed_data
    }


@router.put("/events/{event_id}")
async def update_event(event_id: str, event: CalendarEvent):
    """Update an existing calendar event"""
    # TODO: Update in database
    event.updated_at = datetime.now()
    
    return {
        "success": True,
        "event": event.dict(),
        "message": "Event updated successfully"
    }


@router.delete("/events/{event_id}")
async def delete_event(event_id: str, user_id: str):
    """Delete a calendar event"""
    # TODO: Delete from database
    
    return {
        "success": True,
        "message": "Event deleted successfully"
    }


@router.post("/optimize")
async def optimize_schedule(request: EventOptimizationRequest):
    """AI-powered schedule optimization"""
    # TODO: Implement actual AI optimization logic
    # This would:
    # 1. Analyze current schedule
    # 2. Identify conflicts and overload
    # 3. Suggest optimal rescheduling
    # 4. Consider user preferences and constraints
    # 5. Calculate time savings and productivity impact
    
    return {
        "success": True,
        "optimizations": [
            {
                "event_id": "evt_123",
                "current_time": "2024-01-15T14:00:00",
                "suggested_time": "2024-01-15T10:00:00",
                "reason": "Batch similar meetings together",
                "impact": "Saves 30 minutes in context switching",
                "confidence": 0.92
            }
        ],
        "summary": "Found 5 optimization opportunities",
        "total_time_saved": 120,  # minutes
        "productivity_increase": 15  # percentage
    }


@router.post("/recurring-reports")
async def schedule_recurring_reports(request: RecurringReportSchedule):
    """Schedule recurring report generation"""
    # Create recurring event for report generation
    start_time = request.start_date or datetime.now()
    
    # Calculate next occurrence based on frequency
    if request.frequency == RecurrenceFrequency.WEEKLY and request.day:
        # Calculate next occurrence of specified day
        pass
    
    hour, minute = map(int, request.time.split(':'))
    start_time = start_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    event = CalendarEvent(
        user_id=request.user_id,
        title=f"📊 {', '.join(request.report_types).title()} Report",
        description=f"Recurring {request.frequency.value} report generation",
        type=EventType.AGENT_TASK,
        priority=EventPriority.MEDIUM,
        start_time=start_time,
        end_time=start_time + timedelta(minutes=30),
        duration=30,
        agent_created=True,
        is_recurring=True,
        recurrence_rule={
            "frequency": request.frequency.value,
            "day": request.day,
            "time": request.time,
            "report_types": request.report_types
        },
        metadata={
            "report_types": request.report_types,
            "auto_generated": True
        }
    )
    
    # TODO: Save to database and schedule background task
    
    return {
        "success": True,
        "event": event.dict(),
        "message": f"Recurring {request.frequency.value} reports scheduled"
    }


@router.post("/reschedule")
async def smart_reschedule(request: RescheduleRequest):
    """Smart rescheduling with AI suggestions"""
    # TODO: Implement AI-powered rescheduling logic
    
    return {
        "success": True,
        "rescheduled_events": [],
        "suggestions": []
    }


@router.post("/break")
async def schedule_break(request: BreakScheduleRequest):
    """Schedule a break with notification"""
    hour, minute = map(int, request.time.split(':'))
    start_time = request.date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    break_types = {
        'short': {'name': 'Short Break', 'icon': '☕'},
        'medium': {'name': 'Coffee Break', 'icon': '🍵'},
        'lunch': {'name': 'Lunch Break', 'icon': '🍱'},
        'walk': {'name': 'Walking Break', 'icon': '🚶'}
    }
    
    break_info = break_types.get(request.break_type, break_types['short'])
    
    event = CalendarEvent(
        user_id=request.user_id,
        title=f"{break_info['icon']} {break_info['name']}",
        description="Scheduled break for rest and recovery",
        type=EventType.BREAK,
        priority=EventPriority.MEDIUM,
        start_time=start_time,
        end_time=start_time + timedelta(minutes=request.duration),
        duration=request.duration,
        notification_enabled=request.notification,
        sound_enabled=request.sound,
        agent_created=True,
        metadata={"break_type": request.break_type}
    )
    
    # TODO: Save to database and schedule notification
    
    return {
        "success": True,
        "event": event.dict(),
        "message": "Break scheduled successfully"
    }


@router.get("/insights")
async def get_calendar_insights(user_id: str, days: int = 7):
    """Get AI-generated calendar insights"""
    # TODO: Implement actual analytics
    # This would analyze:
    # - Time allocation
    # - Meeting density
    # - Workload balance
    # - Productivity patterns
    
    return {
        "success": True,
        "insights": {
            "week_load": 72,
            "productivity_trend": "up",
            "suggestions": [
                "Your week is 72% full — optimal.",
                "Consider batching similar meetings on Tuesday.",
                "You've worked 5 consecutive days — schedule downtime."
            ],
            "time_allocation": {
                "deep_work": 35,
                "meetings": 30,
                "admin": 20,
                "personal": 10,
                "breaks": 5
            },
            "burnout_risk": "low",
            "efficiency_score": 0.85
        }
    }


@router.get("/sync/status")
async def get_sync_status(user_id: str):
    """Get external calendar sync status"""
    # TODO: Check actual sync status with Google/Outlook
    
    return {
        "success": True,
        "synced_calendars": [],
        "last_sync": None,
        "pending_sync": 0
    }


@router.post("/sync/google")
async def sync_with_google_calendar(user_id: str, background_tasks: BackgroundTasks):
    """Trigger Google Calendar sync"""
    # TODO: Implement Google Calendar API sync
    
    return {
        "success": True,
        "message": "Google Calendar sync initiated"
    }


@router.post("/sync/outlook")
async def sync_with_outlook(user_id: str, background_tasks: BackgroundTasks):
    """Trigger Outlook Calendar sync"""
    # TODO: Implement Outlook Calendar API sync
    
    return {
        "success": True,
        "message": "Outlook Calendar sync initiated"
    }

