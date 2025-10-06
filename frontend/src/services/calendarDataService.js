/**
 * Calendar Data Service
 * Centralized service for all calendar data operations
 * Uses mock data for now, ready to swap with real API calls
 */

import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from 'date-fns';

class CalendarDataService {
  constructor() {
    // Initialize with localStorage or default data
    this.events = this.loadEvents();
    this.preferences = this.loadPreferences();
    this.analytics = this.loadAnalytics();
  }

  // ==================== EVENTS ====================

  loadEvents() {
    const stored = localStorage.getItem('guild_calendar_events');
    if (stored) {
      const events = JSON.parse(stored);
      // Convert date strings back to Date objects
      return events.map(e => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt)
      }));
    }
    return this.generateMockEvents();
  }

  saveEvents() {
    localStorage.setItem('guild_calendar_events', JSON.stringify(this.events));
  }

  getEvents(filters = {}) {
    let filtered = [...this.events];

    if (filters.startDate) {
      filtered = filtered.filter(e => e.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(e => e.date <= filters.endDate);
    }

    if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search))
      );
    }

    return filtered.sort((a, b) => a.date - b.date);
  }

  getEventById(id) {
    return this.events.find(e => e.id === id);
  }

  createEvent(eventData) {
    const newEvent = {
      id: `evt_${Date.now()}`,
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: eventData.tasks || [],
      isPinned: eventData.isPinned || false,
      isRecurring: eventData.isRecurring || false,
      recurrenceRule: eventData.recurrenceRule || null
    };

    this.events.push(newEvent);
    this.saveEvents();

    // If recurring, generate instances
    if (newEvent.isRecurring && newEvent.recurrenceRule) {
      this.generateRecurringInstances(newEvent);
    }

    return newEvent;
  }

  updateEvent(id, updates) {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = {
        ...this.events[index],
        ...updates,
        updatedAt: new Date()
      };
      this.saveEvents();
      return this.events[index];
    }
    return null;
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.saveEvents();
    return true;
  }

  rescheduleEvent(id, newDate, newTime) {
    const event = this.getEventById(id);
    if (event) {
      const [hours, minutes] = newTime.split(':');
      const updatedDate = new Date(newDate);
      updatedDate.setHours(parseInt(hours), parseInt(minutes));
      
      return this.updateEvent(id, {
        date: updatedDate,
        time: newTime
      });
    }
    return null;
  }

  pinEvent(id) {
    return this.updateEvent(id, { isPinned: true });
  }

  unpinEvent(id) {
    return this.updateEvent(id, { isPinned: false });
  }

  // ==================== TASKS ====================

  addTaskToEvent(eventId, task) {
    const event = this.getEventById(eventId);
    if (event) {
      const newTask = {
        id: `task_${Date.now()}`,
        text: task,
        completed: false,
        createdAt: new Date()
      };
      
      const tasks = [...(event.tasks || []), newTask];
      return this.updateEvent(eventId, { tasks });
    }
    return null;
  }

  toggleTaskCompletion(eventId, taskId) {
    const event = this.getEventById(eventId);
    if (event && event.tasks) {
      const tasks = event.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return this.updateEvent(eventId, { tasks });
    }
    return null;
  }

  deleteTask(eventId, taskId) {
    const event = this.getEventById(eventId);
    if (event && event.tasks) {
      const tasks = event.tasks.filter(t => t.id !== taskId);
      return this.updateEvent(eventId, { tasks });
    }
    return null;
  }

  // ==================== RECURRING EVENTS ====================

  generateRecurringInstances(event, until = addMonths(new Date(), 3)) {
    if (!event.isRecurring || !event.recurrenceRule) return;

    const { frequency, count = 12, interval = 1 } = event.recurrenceRule;
    const instances = [];
    let currentDate = new Date(event.date);

    for (let i = 1; i < count; i++) {
      if (frequency === 'daily') {
        currentDate = addDays(currentDate, interval);
      } else if (frequency === 'weekly') {
        currentDate = addWeeks(currentDate, interval);
      } else if (frequency === 'monthly') {
        currentDate = addMonths(currentDate, interval);
      }

      if (currentDate > until) break;

      const instance = {
        ...event,
        id: `${event.id}_instance_${i}`,
        date: new Date(currentDate),
        isRecurringInstance: true,
        parentEventId: event.id,
        instanceNumber: i
      };

      instances.push(instance);
    }

    this.events.push(...instances);
    this.saveEvents();
  }

  // ==================== OPTIMIZATION ====================

  optimizeSchedule(preferences = {}) {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    const weekEvents = this.getEvents({
      startDate: weekStart,
      endDate: weekEnd
    }).filter(e => !e.isPinned); // Don't optimize pinned events

    const suggestions = [];

    // Detect back-to-back meetings
    weekEvents.forEach((event, index) => {
      if (index < weekEvents.length - 1) {
        const nextEvent = weekEvents[index + 1];
        const eventEnd = new Date(event.date.getTime() + (event.duration || 60) * 60000);
        
        if (Math.abs(eventEnd - nextEvent.date) < 5 * 60000) { // Less than 5 min gap
          suggestions.push({
            type: 'add_buffer',
            event_id: event.id,
            reason: 'Add buffer between meetings',
            impact: 'Reduces context switching stress',
            confidence: 0.92
          });
        }
      }
    });

    // Detect overloaded days
    const eventsByDay = {};
    weekEvents.forEach(event => {
      const day = format(event.date, 'yyyy-MM-dd');
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;
    });

    Object.entries(eventsByDay).forEach(([day, count]) => {
      if (count > 5) {
        suggestions.push({
          type: 'redistribute',
          day,
          count,
          reason: `${count} events on ${day} - redistribute to lighter days`,
          impact: 'Better workload balance',
          confidence: 0.88
        });
      }
    });

    return {
      suggestions,
      totalTimeSaved: suggestions.length * 15, // Mock calculation
      productivityIncrease: suggestions.length * 5
    };
  }

  // ==================== ANALYTICS ====================

  loadAnalytics() {
    const stored = localStorage.getItem('guild_calendar_analytics');
    return stored ? JSON.parse(stored) : {};
  }

  saveAnalytics() {
    localStorage.setItem('guild_calendar_analytics', JSON.stringify(this.analytics));
  }

  calculateDailyAnalytics(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = this.getEvents({
      startDate: dayStart,
      endDate: dayEnd
    });

    const breakdown = {
      deepWork: 0,
      meetings: 0,
      admin: 0,
      personal: 0,
      breaks: 0
    };

    dayEvents.forEach(event => {
      const duration = event.duration || 60;
      if (event.type === 'meeting') breakdown.meetings += duration;
      else if (event.type === 'break' || event.type === 'wellness') breakdown.breaks += duration;
      else if (event.type === 'personal') breakdown.personal += duration;
      else if (event.type === 'financial' || event.type === 'content') breakdown.admin += duration;
      else breakdown.deepWork += duration;
    });

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

    return {
      date: format(date, 'yyyy-MM-dd'),
      breakdown,
      percentages: {
        deepWork: Math.round((breakdown.deepWork / total) * 100),
        meetings: Math.round((breakdown.meetings / total) * 100),
        admin: Math.round((breakdown.admin / total) * 100),
        personal: Math.round((breakdown.personal / total) * 100),
        breaks: Math.round((breakdown.breaks / total) * 100)
      },
      totalTime: total,
      eventCount: dayEvents.length,
      overloadScore: dayEvents.length > 8 ? 'high' : dayEvents.length > 5 ? 'medium' : 'low'
    };
  }

  getWeeklyAnalytics() {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const analytics = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      analytics.push(this.calculateDailyAnalytics(day));
    }

    return analytics;
  }

  getHistoricalAnalytics(months = 3) {
    const data = [];
    const today = new Date();

    for (let i = months; i >= 0; i--) {
      const month = addMonths(today, -i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthEvents = this.getEvents({
        startDate: monthStart,
        endDate: monthEnd
      });

      data.push({
        month: format(month, 'MMM yyyy'),
        totalEvents: monthEvents.length,
        meetings: monthEvents.filter(e => e.type === 'meeting').length,
        efficiency: 0.75 + Math.random() * 0.2, // Mock efficiency score
        burnoutRisk: monthEvents.length > 100 ? 'high' : monthEvents.length > 60 ? 'medium' : 'low'
      });
    }

    return data;
  }

  // ==================== PREFERENCES ====================

  loadPreferences() {
    const stored = localStorage.getItem('guild_calendar_preferences');
    return stored ? JSON.parse(stored) : {
      maxMeetingsPerDay: 5,
      minBreakTime: 15,
      noMeetingsAfter: '18:00',
      noMeetingsBefore: '08:00',
      deepWorkHours: ['08:00-11:00'],
      autoInsertBreaks: true,
      optimizationEnabled: true,
      timezone: 'UTC'
    };
  }

  savePreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    localStorage.setItem('guild_calendar_preferences', JSON.stringify(this.preferences));
  }

  getPreferences() {
    return this.preferences;
  }

  // ==================== VOICE COMMANDS ====================

  parseVoiceCommand(transcript) {
    const lower = transcript.toLowerCase();

    // Schedule commands
    if (lower.includes('schedule') || lower.includes('add') || lower.includes('create')) {
      return {
        action: 'create_event',
        data: this.extractEventFromText(transcript)
      };
    }

    // Move/reschedule commands
    if (lower.includes('move') || lower.includes('reschedule')) {
      return {
        action: 'reschedule',
        data: this.extractRescheduleData(transcript)
      };
    }

    // Delete commands
    if (lower.includes('delete') || lower.includes('cancel') || lower.includes('remove')) {
      return {
        action: 'delete',
        data: this.extractEventReference(transcript)
      };
    }

    // Show/view commands
    if (lower.includes('show') || lower.includes('what') || lower.includes('view')) {
      return {
        action: 'show',
        data: this.extractViewRequest(transcript)
      };
    }

    return {
      action: 'unknown',
      transcript
    };
  }

  extractEventFromText(text) {
    // Simple extraction - can be enhanced with NLP
    return {
      title: text.replace(/schedule|add|create|event|meeting/gi, '').trim(),
      natural_language: text
    };
  }

  extractRescheduleData(text) {
    return {
      instruction: text
    };
  }

  extractEventReference(text) {
    return {
      reference: text
    };
  }

  extractViewRequest(text) {
    if (text.includes('today')) return 'today';
    if (text.includes('tomorrow')) return 'tomorrow';
    if (text.includes('week')) return 'week';
    if (text.includes('month')) return 'month';
    return 'today';
  }

  // ==================== MOCK DATA GENERATION ====================

  generateMockEvents() {
    const events = [];
    const today = new Date();
    
    // Generate events for the next 30 days
    for (let i = -7; i < 30; i++) {
      const date = addDays(today, i);
      
      // 60% chance of events on weekdays
      if (date.getDay() !== 0 && date.getDay() !== 6 && Math.random() > 0.4) {
        const eventCount = Math.floor(Math.random() * 4) + 1;
        
        for (let j = 0; j < eventCount; j++) {
          events.push(this.generateMockEvent(date));
        }
      }
    }

    return events;
  }

  generateMockEvent(date) {
    const types = ['meeting', 'personal', 'financial', 'content', 'wellness', 'agent_task'];
    const priorities = ['low', 'medium', 'high'];
    const titles = {
      meeting: ['Team Standup', 'Client Call', 'Strategy Session', 'Product Review', 'Q&A Session'],
      personal: ['Lunch with Wife', 'Dentist Appointment', 'Gym', 'Coffee with Friend', 'Grocery Shopping'],
      financial: ['Budget Review', 'Invoice Processing', 'Financial Planning', 'Tax Preparation', 'Expense Report'],
      content: ['Blog Post Writing', 'Social Media Planning', 'Content Calendar', 'Video Editing', 'Newsletter Draft'],
      wellness: ['Yoga Session', 'Meditation', 'Walk', 'Gym Workout', 'Stretching'],
      agent_task: ['Report Generation', 'Data Analysis', 'CRM Update', 'Email Campaign', 'Analytics Review']
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    
    const eventDate = new Date(date);
    eventDate.setHours(hour, minute, 0, 0);

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: titles[type][Math.floor(Math.random() * titles[type].length)],
      description: 'Auto-generated mock event',
      type,
      priority,
      date: eventDate,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
      agentCreated: type === 'agent_task',
      isPinned: false,
      isRecurring: false,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Singleton instance
const calendarDataService = new CalendarDataService();

export default calendarDataService;

