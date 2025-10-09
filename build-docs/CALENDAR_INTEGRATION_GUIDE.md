# Calendar Data Source Integration Guide

This document outlines how the Personal Operating System Calendar integrates with various data sources to collect events, meetings, anniversaries, birthdays, and special dates.

## Overview

The calendar system is designed to aggregate data from **multiple sources** to provide a unified view of all scheduled events, important dates, and time commitments. This ensures nothing is missed and all information is centralized.

## Supported Data Sources

### 1. **External Calendar Services**
- **Google Calendar** (Primary integration)
- **Microsoft Outlook Calendar**
- **Apple Calendar / iCloud**
- **CalDAV-compatible calendars**

#### Integration Method:
```javascript
// Example: Google Calendar Integration
const googleCalendarAPI = {
  endpoint: '/api/integrations/google/calendar',
  method: 'GET',
  authentication: 'OAuth 2.0',
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ]
};

// Fetch events from Google Calendar
async function syncGoogleCalendar() {
  const response = await fetch('/api/calendar/sync/google', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const events = await response.json();
  return events.items.map(event => ({
    id: event.id,
    title: event.summary,
    date: new Date(event.start.dateTime || event.start.date),
    time: event.start.dateTime ? extractTime(event.start.dateTime) : 'All Day',
    duration: calculateDuration(event.start, event.end),
    location: event.location,
    attendees: event.attendees?.map(a => a.email) || [],
    description: event.description,
    source: 'google_calendar',
    externalId: event.id
  }));
}
```

### 2. **CRM Systems**
- **Customer meetings and appointments**
- **Follow-up reminders**
- **Client birthdays and anniversaries**
- **Contract renewal dates**

#### Integration Points:
- **Salesforce** - `/api/integrations/salesforce/events`
- **HubSpot** - `/api/integrations/hubspot/meetings`
- **Pipedrive** - `/api/integrations/pipedrive/activities`
- **Custom CRM** - `/api/crm/events`

#### Data Collected:
- Scheduled meetings with clients
- Follow-up reminders
- Client birthdays and company anniversaries
- Important milestone dates (contract signing, renewal dates)
- Customer onboarding dates

### 3. **Communication Platforms**
- **Slack** - Channel reminders, scheduled messages
- **Microsoft Teams** - Scheduled meetings
- **Zoom** - Upcoming webinars and meetings
- **Google Meet** - Meeting links and schedules

#### Integration Example:
```javascript
// Slack integration for reminders and scheduled messages
const slackIntegration = {
  endpoint: '/api/integrations/slack/reminders',
  collectTypes: [
    'scheduled_messages',
    'channel_reminders',
    'direct_message_reminders',
    'workflow_scheduled_tasks'
  ]
};
```

### 4. **Customer Intelligence Agent**
The Customer Intelligence Agent provides:
- Customer birthdays
- Customer anniversaries (signup date, first purchase)
- Important customer milestones
- Churn risk alerts (schedule check-in meetings)
- High-value customer engagement dates

#### Agent API:
```javascript
// Fetch customer important dates
GET /api/agents/customer-intelligence/important-dates

Response:
{
  "customer_birthdays": [
    {
      "customer_name": "John Smith",
      "date": "2024-03-15",
      "type": "birthday",
      "action_suggestion": "Send personalized birthday message"
    }
  ],
  "anniversaries": [
    {
      "customer_name": "TechCorp Inc",
      "date": "2024-01-20",
      "type": "client_anniversary",
      "years": 3,
      "action_suggestion": "Schedule appreciation call"
    }
  ],
  "upcoming_renewals": [...],
  "engagement_reminders": [...]
}
```

### 5. **Project Management Tools**
- **Asana** - Task deadlines, project milestones
- **Trello** - Card due dates
- **Monday.com** - Timeline events
- **Jira** - Sprint deadlines, release dates

### 6. **Email Platforms**
- **Gmail** - Calendar invites from emails
- **Outlook** - Meeting requests
- **Email parsing** - Extract dates/times from email content

#### Smart Email Parsing:
```javascript
// Extract event information from emails
const emailParser = {
  detectPatterns: [
    /meeting.*on\s+(\w+\s+\d+)/gi,  // "meeting on January 15"
    /scheduled\s+for\s+(\d{1,2}:\d{2})/gi,  // "scheduled for 3:30"
    /(\d{1,2}\/\d{1,2}\/\d{4})/g,  // "01/15/2024"
  ],
  createCalendarEvent: true,
  requireConfirmation: true
};
```

### 7. **Financial Systems**
- **Stripe** - Subscription renewal dates, invoice due dates
- **QuickBooks** - Bill payment dates, tax deadlines
- **PayPal** - Recurring payment schedules

### 8. **Social Media Platforms**
- **LinkedIn** - Connection birthdays, work anniversaries
- **Facebook** - Friend birthdays (if integrated)
- **Twitter/X** - Scheduled posts

### 9. **HR & Team Management**
- **BambooHR** - Employee birthdays, work anniversaries
- **Workday** - Team events, company holidays
- **Internal systems** - Team member special dates

## Data Synchronization Architecture

### Real-time Sync
```javascript
// WebSocket connection for real-time updates
const calendarSocket = new WebSocket('wss://api.guild-ai.com/calendar/sync');

calendarSocket.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch(update.type) {
    case 'new_event':
      addEventToCalendar(update.data);
      break;
    case 'event_updated':
      updateCalendarEvent(update.data);
      break;
    case 'event_deleted':
      removeCalendarEvent(update.data.id);
      break;
  }
};
```

### Periodic Sync
```javascript
// Scheduled sync every 15 minutes for external sources
const syncSchedule = {
  interval: '*/15 * * * *',  // Every 15 minutes
  sources: [
    'google_calendar',
    'outlook_calendar',
    'crm_events',
    'project_management',
    'communication_platforms'
  ]
};
```

## Event Categorization & Enrichment

All imported events are automatically categorized and enriched:

```javascript
const eventEnrichment = {
  // Automatic categorization
  categorize: (event) => {
    if (event.source === 'crm' || event.attendees?.some(a => isCustomer(a))) {
      return 'meeting';
    }
    if (event.title.toLowerCase().includes('birthday')) {
      return 'personal';
    }
    if (event.title.toLowerCase().includes('financial') || event.source === 'stripe') {
      return 'financial';
    }
    return 'meeting';
  },
  
  // Add AI context
  enrichWithAI: async (event) => {
    const aiContext = await fetch('/api/agents/context', {
      method: 'POST',
      body: JSON.stringify({ event })
    });
    
    event.aiSummary = aiContext.summary;
    event.recommendations = aiContext.recommendations;
    event.relatedAgents = aiContext.suggestedAgents;
    
    return event;
  },
  
  // Link related data
  linkRelatedData: (event) => {
    // Link to customer records if it's a client meeting
    if (event.type === 'meeting' && event.attendees) {
      event.customerRecords = findCustomerRecords(event.attendees);
    }
    
    // Link to project data if it's a project meeting
    if (event.tags?.includes('project')) {
      event.projectData = findProjectData(event.title);
    }
    
    return event;
  }
};
```

## Priority & Intelligent Scheduling

### Auto-Priority Assignment
```javascript
const priorityRules = {
  high: [
    'customer meetings with enterprise clients',
    'board meetings',
    'investor calls',
    'customer churn risk meetings',
    'contract deadlines',
    'tax deadlines'
  ],
  medium: [
    'team meetings',
    'project milestones',
    'content review',
    'regular check-ins'
  ],
  low: [
    'social events',
    'informal catch-ups',
    'optional workshops'
  ]
};

function assignPriority(event) {
  // Check customer value
  if (event.customerRecords?.some(c => c.lifetime_value > 100000)) {
    return 'high';
  }
  
  // Check keywords in title
  for (const [priority, keywords] of Object.entries(priorityRules)) {
    if (keywords.some(keyword => event.title.toLowerCase().includes(keyword))) {
      return priority;
    }
  }
  
  return 'medium';
}
```

## Agent Integration for Event Management

### PA Agent Scheduling
```javascript
// PA Agent can schedule events from natural language
const paScheduling = {
  input: "Schedule a quarterly review with Sarah next Thursday at 2pm",
  
  process: async () => {
    // 1. Parse intent
    const intent = await nlpParse(input);
    
    // 2. Check availability
    const availability = await checkAvailability(intent.date, intent.time);
    
    // 3. Find attendee
    const attendee = await findPerson(intent.person);
    
    // 4. Create event
    const event = {
      title: intent.eventType,
      date: intent.date,
      time: intent.time,
      attendees: [attendee.email],
      duration: 60,
      agentCreated: true,
      relatedAgents: ['pa_agent', 'calendar_harmony_agent']
    };
    
    // 5. Save and send invites
    await saveEvent(event);
    await sendCalendarInvite(attendee.email, event);
    
    return event;
  }
};
```

### Calendar Harmony Agent
```javascript
// Monitors and optimizes calendar
const calendarHarmonyAgent = {
  monitor: async () => {
    const events = await getUpcomingEvents(7); // Next 7 days
    
    // Detect overload
    const overloadedDays = detectOverload(events);
    if (overloadedDays.length > 0) {
      await suggestRebalancing(overloadedDays);
    }
    
    // Detect conflicts
    const conflicts = detectConflicts(events);
    if (conflicts.length > 0) {
      await resolveConflicts(conflicts);
    }
    
    // Suggest breaks
    const needsBreaks = analyzeBreakNeeds(events);
    if (needsBreaks) {
      await suggestBreaks(events);
    }
  }
};
```

## Data Privacy & Security

- **OAuth 2.0** for all third-party integrations
- **Encrypted storage** of sensitive calendar data
- **Granular permissions** - Users control what data is synced
- **GDPR compliant** - Users can export/delete all data
- **SOC 2 Type II** security standards

## Setup Instructions

### 1. Enable Calendar Integrations in Settings

```javascript
// Navigate to Settings > Integrations > Calendar
const setup = {
  step1: "Connect Google Calendar",
  step2: "Connect Outlook (optional)",
  step3: "Enable CRM event sync",
  step4: "Configure data collection preferences",
  step5: "Set sync frequency"
};
```

### 2. Configure Data Sources

In the ConnectorManager component:
```javascript
const connectorConfig = {
  googleCalendar: {
    enabled: true,
    syncFrequency: 'realtime',
    eventTypes: ['meetings', 'all-day-events', 'reminders']
  },
  crm: {
    enabled: true,
    syncFrequency: '15min',
    collectBirthdays: true,
    collectAnniversaries: true,
    collectMilestones: true
  },
  projectManagement: {
    enabled: true,
    tools: ['asana', 'trello'],
    syncDeadlines: true
  }
};
```

### 3. Test Integration

```bash
# Test calendar sync
curl -X POST http://localhost:3000/api/calendar/test-sync \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
{
  "status": "success",
  "sources_synced": 5,
  "events_imported": 47,
  "errors": []
}
```

## Troubleshooting

### Common Issues

1. **Events not syncing**: Check OAuth tokens haven't expired
2. **Duplicate events**: Ensure deduplication logic is enabled
3. **Missing birthdays**: Verify CRM integration permissions
4. **Slow sync**: Reduce sync frequency or enable background jobs

## Future Enhancements

- **AI-powered event prediction** - Predict likely recurring events
- **Smart conflict resolution** - Auto-reschedule based on priorities
- **Travel time calculation** - Factor in commute between events
- **Weather-aware scheduling** - Suggest indoor alternatives for outdoor events
- **Team availability matching** - Find best times for group meetings

---

## Quick Reference: API Endpoints

```
POST /api/calendar/sync                  # Trigger full sync
GET  /api/calendar/events                # Get all events
POST /api/calendar/event                 # Create new event
PUT  /api/calendar/event/:id             # Update event
DELETE /api/calendar/event/:id           # Delete event
GET  /api/calendar/sources               # List connected sources
POST /api/calendar/sources/connect       # Connect new source
POST /api/calendar/sources/disconnect    # Disconnect source
GET  /api/calendar/birthdays             # Get upcoming birthdays
GET  /api/calendar/anniversaries         # Get upcoming anniversaries
POST /api/calendar/optimize              # Trigger AI optimization
GET  /api/calendar/conflicts             # Detect conflicts
POST /api/calendar/auto-schedule         # AI-powered scheduling
```

## Support

For integration support, contact the Guild AI team or consult the full API documentation at `/docs/api/calendar`.

