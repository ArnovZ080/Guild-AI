/**
 * Agent Activity Feed - Centralized Transparency Dashboard
 * Shows all autonomous agent actions in real-time
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bot,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Zap,
  TrendingUp,
  Database,
  Settings,
  MessageSquare,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw,
  Bell,
  BellOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import enhancedOrchestratorService from '../../services/EnhancedOrchestratorService.js';
import workflowExecutionService from '../../services/WorkflowExecutionService.js';

const AgentActivityFeed = ({ userId, isCompact = false, maxEvents = 20 }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load initial activity
  useEffect(() => {
    loadActivity();
  }, [userId]);

  // Listen for workflow execution changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'guild_running_workflows' || e.key === 'guild_completed_workflows') {
        loadActivity();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isLive || !userId) return;

    const unsubscribe = enhancedOrchestratorService.subscribeToAgentActivity(
      userId,
      (newEvents) => {
        setEvents((prev) => {
          // Merge new events, avoiding duplicates
          const eventMap = new Map();
          [...prev, ...newEvents].forEach(event => {
            const key = `${event.timestamp}_${event.event_type}`;
            eventMap.set(key, event);
          });
          return Array.from(eventMap.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, maxEvents);
        });
      }
    );

    return unsubscribe;
  }, [userId, isLive]);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(event => 
        event.event_type.includes(filter) || 
        (filter === 'important' && (event.event_type.includes('failed') || event.event_type.includes('approval')))
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(event.data).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchTerm]);

  const loadActivity = async () => {
    setIsLoading(true);
    
    // Load orchestrator activity
    const result = await enhancedOrchestratorService.getRecentActivity(userId, maxEvents);
    const orchestratorEvents = result.success ? (result.events || []) : [];
    
    // Load workflow execution events from WorkflowExecutionService
    const runningWorkflows = workflowExecutionService.getRunningWorkflows();
    const completedWorkflows = workflowExecutionService.getCompletedWorkflows();
    
    // Convert workflow executions to activity events
    const workflowEvents = [...runningWorkflows, ...completedWorkflows].map(workflow => ({
      id: `workflow-${workflow.id}`,
      event_type: workflow.status === 'completed' ? 'workflow_completed' : 'workflow_running',
      timestamp: workflow.started_at,
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      agent_id: 'orchestrator',
      agent_name: 'Unified Orchestrator',
      data: {
        workflow_description: workflow.description,
        orchestrator_instructions: workflow.orchestrator_instructions,
        execution_result: workflow.execution_result,
        natural_language_descriptions: workflow.natural_language_descriptions,
        progress: workflow.progress,
        current_step: workflow.current_step,
        isFromBuilder: workflow.isFromBuilder || true
      },
      status: workflow.status,
      importance: 'high'
    }));
    
    // Combine and sort all events
    const allEvents = [...orchestratorEvents, ...workflowEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxEvents);
    
    setEvents(allEvents);
    setIsLoading(false);
  };

  const getEventIcon = (eventType) => {
    if (eventType.includes('workflow')) return <Zap className="w-4 h-4" />;
    if (eventType.includes('step')) return <Activity className="w-4 h-4" />;
    if (eventType.includes('completed')) return <CheckCircle className="w-4 h-4" />;
    if (eventType.includes('failed')) return <AlertTriangle className="w-4 h-4" />;
    if (eventType.includes('approval')) return <Eye className="w-4 h-4" />;
    if (eventType.includes('data')) return <Database className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getEventColor = (eventType) => {
    if (eventType.includes('completed')) return 'text-green-600 bg-green-100';
    if (eventType.includes('failed')) return 'text-red-600 bg-red-100';
    if (eventType.includes('running') || eventType.includes('started')) return 'text-blue-600 bg-blue-100';
    if (eventType.includes('approval')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const exportActivityLog = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-activity-${new Date().toISOString()}.json`;
    link.click();
  };

  if (isCompact && !isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Agent Activity</span>
          {events.length > 0 && (
            <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
              {events.length}
            </span>
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg ${isCompact ? 'fixed bottom-4 right-4 z-50 w-96 max-h-[600px]' : 'w-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Agent Activity Feed</h3>
            <p className="text-sm text-gray-600">Real-time autonomous operations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`p-2 rounded-lg transition-colors ${
              isLive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={isLive ? 'Live updates enabled' : 'Live updates disabled'}
          >
            {isLive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={loadActivity}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh activity"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={exportActivityLog}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export activity log"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          {isCompact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 flex-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              <option value="workflow">Workflows</option>
              <option value="step">Steps</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="approval">Approvals</option>
              <option value="important">Important</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className={`overflow-y-auto ${isCompact ? 'max-h-96' : 'max-h-[600px]'} p-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading agent activity...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agent activity yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Agents will appear here as they work autonomously
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}_${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(selectedEvent?.timestamp === event.timestamp ? null : event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getEventColor(event.event_type)}`}>
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {event.workflow_name || 'System Operation'}
                        </p>
                        {event.data?.step_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {event.data.step_name}
                          </p>
                        )}
                        {event.data?.agent && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Bot className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{event.data.agent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                      {event.data?.judge_score && (
                        <span className="text-xs font-medium text-blue-600">
                          {(event.data.judge_score * 100).toFixed(0)}% quality
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedEvent?.timestamp === event.timestamp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          {event.data && Object.keys(event.data).length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-2">Event Data:</h5>
                              <div className="bg-gray-50 rounded p-3 max-h-48 overflow-auto">
                                <pre className="text-xs text-gray-800">
                                  {JSON.stringify(event.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {event.workflow_id && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Workflow ID:</span>
                              <code className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                {event.workflow_id.substring(0, 12)}...
                              </code>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!isCompact && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{events.length}</div>
              <div className="text-xs text-gray-600">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.event_type.includes('completed')).length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.event_type.includes('running') || e.event_type.includes('started')).length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {events.filter(e => e.event_type.includes('failed')).length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AgentActivityFeed;

