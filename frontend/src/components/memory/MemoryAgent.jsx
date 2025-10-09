import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Database, Search, Plus, Trash2, Edit, Save, X,
  Clock, User, Bot, MessageSquare, FileText, Tag, Star,
  TrendingUp, TrendingDown, Filter, Download, Upload,
  Lightbulb, Target, Zap, CheckCircle, AlertCircle
} from 'lucide-react';
import { useCelebrations, CelebrationType } from "../celebrations/MicroCelebrations.jsx';

const MemoryAgent = () => {
  const [memories, setMemories] = useState([
    {
      id: '1',
      type: 'conversation',
      title: 'Marketing Strategy Discussion',
      content: 'User discussed expanding into new markets with focus on digital marketing channels. Key points: budget allocation, target demographics, timeline Q2 2024.',
      tags: ['marketing', 'strategy', 'expansion'],
      importance: 'high',
      createdAt: new Date(2024, 0, 10),
      lastAccessed: new Date(2024, 0, 12),
      accessCount: 15,
      source: 'Voice Agent',
      context: {
        participants: ['User', 'Strategy Agent'],
        duration: '45 minutes',
        outcome: 'Action plan created'
      }
    },
    {
      id: '2',
      type: 'insight',
      title: 'Customer Behavior Pattern',
      content: 'Analysis shows 78% of high-value customers engage with content between 2-4 PM. Peak conversion rate occurs on Tuesdays and Thursdays.',
      tags: ['analytics', 'customer-behavior', 'optimization'],
      importance: 'medium',
      createdAt: new Date(2024, 0, 8),
      lastAccessed: new Date(2024, 0, 11),
      accessCount: 8,
      source: 'Analytics Agent',
      context: {
        dataPoints: 1250,
        confidence: 0.92,
        recommendation: 'Schedule content for optimal times'
      }
    },
    {
      id: '3',
      type: 'task',
      title: 'Q1 Financial Review',
      content: 'Completed comprehensive financial review. Revenue up 23%, expenses controlled at 15% increase. Key metrics: $125K revenue, $85K expenses, $40K profit.',
      tags: ['finance', 'review', 'q1'],
      importance: 'high',
      createdAt: new Date(2024, 0, 5),
      lastAccessed: new Date(2024, 0, 12),
      accessCount: 12,
      source: 'Financial Agent',
      context: {
        period: 'Q1 2024',
        status: 'completed',
        nextAction: 'Q2 planning'
      }
    },
    {
      id: '4',
      type: 'learning',
      title: 'Content Performance Optimization',
      content: 'Discovered that video content performs 3x better than text posts. User prefers educational content over promotional. Engagement peaks with 2-3 minute videos.',
      tags: ['content', 'optimization', 'video'],
      importance: 'medium',
      createdAt: new Date(2024, 0, 3),
      lastAccessed: new Date(2024, 0, 9),
      accessCount: 6,
      source: 'Content Agent',
      context: {
        experiments: 12,
        successRate: 0.85,
        recommendation: 'Increase video content production'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMemory, setNewMemory] = useState({
    type: 'conversation',
    title: '',
    content: '',
    tags: [],
    importance: 'medium'
  });
  const { triggerCelebration } = useCelebrations();

  // Filter memories
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || memory.type === filterType;
    const matchesImportance = filterImportance === 'all' || memory.importance === filterImportance;
    
    return matchesSearch && matchesType && matchesImportance;
  });

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      conversation: MessageSquare,
      insight: Lightbulb,
      task: Target,
      learning: Brain,
      document: FileText
    };
    return icons[type] || Database;
  };

  // Get type color
  const getTypeColor = (type) => {
    const colors = {
      conversation: 'text-blue-600 bg-blue-100',
      insight: 'text-yellow-600 bg-yellow-100',
      task: 'text-green-600 bg-green-100',
      learning: 'text-purple-600 bg-purple-100',
      document: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  // Get importance color
  const getImportanceColor = (importance) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[importance] || 'text-gray-600 bg-gray-100';
  };

  // Create new memory
  const createMemory = () => {
    const memory = {
      id: Date.now().toString(),
      ...newMemory,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      source: 'User',
      context: {}
    };
    
    setMemories(prev => [memory, ...prev]);
    setNewMemory({
      type: 'conversation',
      title: '',
      content: '',
      tags: [],
      importance: 'medium'
    });
    setIsCreating(false);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Memory saved! 🧠",
      intensity: 'normal'
    });
  };

  // Delete memory
  const deleteMemory = (id) => {
    setMemories(prev => prev.filter(memory => memory.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  // Update memory access
  const updateMemoryAccess = (id) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id 
        ? { ...memory, lastAccessed: new Date(), accessCount: memory.accessCount + 1 }
        : memory
    ));
  };

  // Memory card component
  const MemoryCard = ({ memory }) => {
    const TypeIcon = getTypeIcon(memory.type);
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          setSelectedMemory(memory);
          updateMemoryAccess(memory.id);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(memory.type)}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{memory.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{memory.type}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImportanceColor(memory.importance)}`}>
              {memory.importance}
            </span>
            <span className="text-xs text-gray-500">{memory.source}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{memory.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {memory.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {memory.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{memory.tags.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{memory.lastAccessed.toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Memory detail modal
  const MemoryDetailModal = () => {
    if (!selectedMemory) return null;

    const TypeIcon = getTypeIcon(selectedMemory.type);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getTypeColor(selectedMemory.type)}`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMemory.title}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedMemory.type)}`}>
                      {selectedMemory.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImportanceColor(selectedMemory.importance)}`}>
                      {selectedMemory.importance}
                    </span>
                    <span className="text-sm text-gray-600">{selectedMemory.source}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Content</h3>
                  <p className="text-gray-700">{selectedMemory.content}</p>
                </div>

                {/* Context Information */}
                {selectedMemory.context && Object.keys(selectedMemory.context).length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Context</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMemory.context).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Memory Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Memory Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-semibold">{selectedMemory.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Accessed</span>
                      <span className="font-semibold">{selectedMemory.lastAccessed.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Access Count</span>
                      <span className="font-semibold">{selectedMemory.accessCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source</span>
                      <span className="font-semibold">{selectedMemory.source}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span>Edit Memory</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <Star className="w-4 h-4" />
                    <span>Add to Favorites</span>
                  </button>
                  <button 
                    onClick={() => deleteMemory(selectedMemory.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Memory</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Memory Agent</h1>
            <p className="text-gray-600 mt-2">AI-powered memory management and context retention</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="conversation">Conversations</option>
              <option value="insight">Insights</option>
              <option value="task">Tasks</option>
              <option value="learning">Learning</option>
              <option value="document">Documents</option>
            </select>

            <select
              value={filterImportance}
              onChange={(e) => setFilterImportance(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Importance</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredMemories.length} of {memories.length} memories
          </div>
        </div>
      </div>

      {/* Memory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{memories.length}</div>
              <div className="text-sm text-gray-600">Total Memories</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {memories.reduce((sum, memory) => sum + memory.accessCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Accesses</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {memories.filter(m => m.importance === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {memories.filter(m => m.type === 'learning').length}
              </div>
              <div className="text-sm text-gray-600">Learning Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMemories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </AnimatePresence>
      </div>

      {/* Memory Detail Modal */}
      <MemoryDetailModal />

      {/* Create Memory Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Memory</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newMemory.type}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="conversation">Conversation</option>
                    <option value="insight">Insight</option>
                    <option value="task">Task</option>
                    <option value="learning">Learning</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newMemory.title}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter memory title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newMemory.content}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter memory content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Importance</label>
                  <select
                    value={newMemory.importance}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, importance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMemory}
                    disabled={!newMemory.title || !newMemory.content}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Memory
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryAgent;
