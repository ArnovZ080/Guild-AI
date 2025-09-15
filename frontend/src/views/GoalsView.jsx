import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Brain,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

// Mock goals data
const mockGoals = [
  {
    id: '1',
    title: 'Increase Monthly Revenue by 25%',
    description: 'Achieve $50,000 monthly recurring revenue by end of Q2',
    type: 'financial',
    priority: 'high',
    timeframe: 'long-term',
    targetDate: new Date(2024, 5, 30),
    progress: 65,
    status: 'in-progress',
    agentAssigned: 'strategy',
    milestones: [
      { id: '1', title: 'Launch new pricing tier', completed: true, dueDate: new Date(2024, 0, 15) },
      { id: '2', title: 'Acquire 50 new customers', completed: true, dueDate: new Date(2024, 1, 15) },
      { id: '3', title: 'Implement upselling strategy', completed: false, dueDate: new Date(2024, 2, 15) },
      { id: '4', title: 'Optimize conversion funnel', completed: false, dueDate: new Date(2024, 3, 15) }
    ],
    metrics: {
      current: 32500,
      target: 50000,
      unit: 'USD'
    },
    createdAt: new Date(2023, 11, 1),
    lastUpdated: new Date(2024, 0, 10)
  },
  {
    id: '2',
    title: 'Expand to 3 New Markets',
    description: 'Launch operations in Europe, Asia, and Latin America',
    type: 'growth',
    priority: 'high',
    timeframe: 'medium-term',
    targetDate: new Date(2024, 8, 30),
    progress: 30,
    status: 'in-progress',
    agentAssigned: 'strategy',
    milestones: [
      { id: '1', title: 'Market research completed', completed: true, dueDate: new Date(2024, 0, 30) },
      { id: '2', title: 'Legal entity setup', completed: false, dueDate: new Date(2024, 1, 30) },
      { id: '3', title: 'Local team hiring', completed: false, dueDate: new Date(2024, 2, 30) },
      { id: '4', title: 'Product localization', completed: false, dueDate: new Date(2024, 3, 30) }
    ],
    metrics: {
      current: 1,
      target: 3,
      unit: 'markets'
    },
    createdAt: new Date(2023, 11, 15),
    lastUpdated: new Date(2024, 0, 8)
  },
  {
    id: '3',
    title: 'Improve Customer Satisfaction Score',
    description: 'Achieve 95% customer satisfaction rating',
    type: 'quality',
    priority: 'medium',
    timeframe: 'short-term',
    targetDate: new Date(2024, 2, 31),
    progress: 80,
    status: 'in-progress',
    agentAssigned: 'support',
    milestones: [
      { id: '1', title: 'Implement feedback system', completed: true, dueDate: new Date(2024, 0, 15) },
      { id: '2', title: 'Train support team', completed: true, dueDate: new Date(2024, 0, 30) },
      { id: '3', title: 'Optimize response times', completed: false, dueDate: new Date(2024, 1, 15) },
      { id: '4', title: 'Launch customer success program', completed: false, dueDate: new Date(2024, 1, 30) }
    ],
    metrics: {
      current: 87,
      target: 95,
      unit: '%'
    },
    createdAt: new Date(2023, 11, 20),
    lastUpdated: new Date(2024, 0, 12)
  },
  {
    id: '4',
    title: 'Launch Mobile App',
    description: 'Release iOS and Android applications',
    type: 'product',
    priority: 'medium',
    timeframe: 'medium-term',
    targetDate: new Date(2024, 6, 30),
    progress: 15,
    status: 'planning',
    agentAssigned: 'development',
    milestones: [
      { id: '1', title: 'UI/UX design completed', completed: false, dueDate: new Date(2024, 1, 15) },
      { id: '2', title: 'Development started', completed: false, dueDate: new Date(2024, 2, 1) },
      { id: '3', title: 'Beta testing', completed: false, dueDate: new Date(2024, 4, 15) },
      { id: '4', title: 'App store submission', completed: false, dueDate: new Date(2024, 5, 30) }
    ],
    metrics: {
      current: 0,
      target: 2,
      unit: 'platforms'
    },
    createdAt: new Date(2024, 0, 1),
    lastUpdated: new Date(2024, 0, 5)
  }
];

// Goal Card Component
const GoalCard = ({ goal, onClick }) => {
  const daysRemaining = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onClick(goal)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGoalTypeStyle(goal.type)}`}>
          {goal.type}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{daysRemaining} days left</span>
        <span className="capitalize">{goal.status}</span>
      </div>
    </motion.div>
  );
};

// Goal Detail Modal Component
const GoalDetailModal = ({ goal, isOpen, onClose, onEdit, onUpdateProgress, onAIInsights }) => {
  if (!isOpen || !goal) return null;
  
  const daysRemaining = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{goal.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{goal.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getGoalTypeStyle(goal.type)}`}>
                  {goal.type}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {goal.priority}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{goal.metrics.current}</div>
                <div className="text-sm text-gray-500">Current</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{goal.metrics.target}</div>
                <div className="text-sm text-gray-500">Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
                <div className="text-sm text-gray-500">Days Left</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Milestones</h4>
              <div className="space-y-2">
                {goal.milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center space-x-3">
                    {milestone.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${milestone.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                      {milestone.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {milestone.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex space-x-3">
            <button
              onClick={() => onEdit(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Goal</span>
            </button>
            <button
              onClick={() => onUpdateProgress(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
            <button
              onClick={() => onAIInsights(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

const GoalsView = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Add Goal Modal states
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: 'growth',
    priority: 'medium',
    timeframe: 'medium-term',
    targetDate: '',
    agentAssigned: 'strategy'
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [agentQuestions, setAgentQuestions] = useState([]);
  const [goalClarification, setGoalClarification] = useState({});
  const { triggerCelebration } = useCelebrations();

  // Goal detail modal handlers
  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetailModal(true);
  };

  const handleEditGoal = (goal) => {
    console.log('Editing goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Editing goal: ${goal.title} ✏️`,
      intensity: 'normal'
    });
    // In real implementation, this would open an edit form
  };

  const handleUpdateProgress = (goal) => {
    console.log('Updating progress for goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Updating progress for: ${goal.title} 📊`,
      intensity: 'normal'
    });
    // In real implementation, this would open a progress update form
  };

  const handleAIInsights = (goal) => {
    console.log('Getting AI insights for goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `AI insights generated for: ${goal.title} 🤖`,
      intensity: 'high'
    });
    // In real implementation, this would trigger AI analysis
  };
    // In real implementation, this would open the progress update modal
  };

  const handleAIInsights = (goal) => {
    console.log('Getting AI insights for goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Generating AI insights for "${goal.title}"... 🧠`,
      intensity: 'normal'
    });
    // In real implementation, this would trigger AI analysis
  };

  // Agent questions for goal clarification
  const goalClarificationQuestions = [
    {
      id: 'goal_type',
      question: "What type of goal is this?",
      type: 'select',
      options: [
        { value: 'financial', label: 'Financial (Revenue, Profit, Cost Reduction)' },
        { value: 'growth', label: 'Growth (Customers, Market Share, Expansion)' },
        { value: 'quality', label: 'Quality (Product, Service, Process Improvement)' },
        { value: 'operational', label: 'Operational (Efficiency, Automation, Systems)' },
        { value: 'personal', label: 'Personal (Skills, Leadership, Development)' }
      ]
    },
    {
      id: 'specificity',
      question: "Can you be more specific about what you want to achieve?",
      type: 'textarea',
      placeholder: "Describe the specific outcome you want to see..."
    },
    {
      id: 'measurement',
      question: "How will you measure success?",
      type: 'textarea',
      placeholder: "What metrics or indicators will show you've achieved this goal?"
    },
    {
      id: 'timeline',
      question: "What's your target timeline?",
      type: 'select',
      options: [
        { value: 'short-term', label: 'Short-term (1-3 months)' },
        { value: 'medium-term', label: 'Medium-term (3-12 months)' },
        { value: 'long-term', label: 'Long-term (1+ years)' }
      ]
    },
    {
      id: 'priority',
      question: "How important is this goal?",
      type: 'select',
      options: [
        { value: 'high', label: 'High Priority (Critical for business success)' },
        { value: 'medium', label: 'Medium Priority (Important but not urgent)' },
        { value: 'low', label: 'Low Priority (Nice to have)' }
      ]
    },
    {
      id: 'resources',
      question: "What resources do you have available for this goal?",
      type: 'textarea',
      placeholder: "Budget, team members, tools, time, etc."
    },
    {
      id: 'obstacles',
      question: "What obstacles might you face?",
      type: 'textarea',
      placeholder: "Potential challenges, risks, or barriers..."
    }
  ];

  // Handle goal clarification answers
  const handleGoalClarification = (questionId, answer) => {
    setGoalClarification(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Move to next question or complete goal creation
  const handleNextQuestion = () => {
    if (currentQuestion < goalClarificationQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Create the goal with all clarification data
      createGoalFromClarification();
    }
  };

  // Create goal from clarification data
  const createGoalFromClarification = () => {
    const newGoal = {
      id: Date.now().toString(),
      title: goalClarification.specificity || goalForm.title,
      description: `Goal created through agent clarification. ${goalClarification.measurement ? `Success measured by: ${goalClarification.measurement}` : ''}`,
      type: goalClarification.goal_type || goalForm.type,
      priority: goalClarification.priority || goalForm.priority,
      timeframe: goalClarification.timeline || goalForm.timeframe,
      targetDate: new Date(Date.now() + (goalClarification.timeline === 'short-term' ? 90 : goalClarification.timeline === 'medium-term' ? 365 : 730) * 24 * 60 * 60 * 1000),
      progress: 0,
      status: 'planning',
      agentAssigned: 'strategy',
      milestones: [],
      metrics: {
        current: 0,
        target: 100,
        unit: 'percentage'
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      clarification: goalClarification
    };

    setGoals(prev => [newGoal, ...prev]);
    setShowAddGoal(false);
    setCurrentQuestion(0);
    setGoalClarification({});
    setGoalForm({
      title: '',
      description: '',
      type: 'growth',
      priority: 'medium',
      timeframe: 'medium-term',
      targetDate: '',
      agentAssigned: 'strategy'
    });

    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Goal created and locked in! 🎯",
      intensity: 'high'
    });
  };

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesTimeframe = filterTimeframe === 'all' || goal.timeframe === filterTimeframe;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    
    return matchesType && matchesTimeframe && matchesStatus;
  });

  // Get goal type styling
  const getGoalTypeStyle = (type) => {
    const styles = {
      financial: 'bg-green-100 text-green-800 border-green-200',
      growth: 'bg-blue-100 text-blue-800 border-blue-200',
      quality: 'bg-purple-100 text-purple-800 border-purple-200',
      product: 'bg-orange-100 text-orange-800 border-orange-200',
      marketing: 'bg-pink-100 text-pink-800 border-pink-200',
      operational: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority styling
  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      'planning': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'planning': Clock,
      'in-progress': PlayCircle,
      'completed': CheckCircle2,
      'paused': AlertCircle,
      'cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  // Calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Goals & Objectives</h1>
          <button
            onClick={() => {
              setShowAddGoal(true);
              triggerCelebration(CelebrationType.TASK_COMPLETE, {
                message: "Setting new goal! 🎯",
                intensity: 'normal'
              });
            }}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="growth">Growth</option>
              <option value="quality">Quality</option>
              <option value="product">Product</option>
              <option value="marketing">Marketing</option>
              <option value="operational">Operational</option>
            </select>

            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="short-term">Short-term</option>
              <option value="medium-term">Medium-term</option>
              <option value="long-term">Long-term</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredGoals.length} of {goals.length} goals
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onClick={handleGoalClick} />
          ))}
        </AnimatePresence>
      </div>

      {/* Goal Detail Modal */}
      <GoalDetailModal 
        goal={selectedGoal}
        isOpen={showGoalDetailModal}
        onClose={() => setShowGoalDetailModal(false)}
        onEdit={handleEditGoal}
        onUpdateProgress={handleUpdateProgress}
        onAIInsights={handleAIInsights}
      />

      {/* Add Goal Modal with Agent Clarification */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Goal Clarification Agent</h2>
                    <p className="text-gray-600">Let me help you create a clear, actionable goal</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setCurrentQuestion(0);
                    setGoalClarification({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestion + 1} of {goalClarificationQuestions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / goalClarificationQuestions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / goalClarificationQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Question */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {goalClarificationQuestions[currentQuestion].question}
                  </h3>
                </div>

                {/* Question Input */}
                {goalClarificationQuestions[currentQuestion].type === 'select' ? (
                  <div className="space-y-3">
                    {goalClarificationQuestions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleGoalClarification(goalClarificationQuestions[currentQuestion].id, option.value)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                          goalClarification[goalClarificationQuestions[currentQuestion].id] === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium text-gray-900">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={goalClarification[goalClarificationQuestions[currentQuestion].id] || ''}
                      onChange={(e) => handleGoalClarification(goalClarificationQuestions[currentQuestion].id, e.target.value)}
                      placeholder={goalClarificationQuestions[currentQuestion].placeholder}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (currentQuestion > 0) {
                        setCurrentQuestion(currentQuestion - 1);
                      } else {
                        setShowAddGoal(false);
                        setCurrentQuestion(0);
                        setGoalClarification({});
                      }
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {currentQuestion === 0 ? 'Cancel' : 'Previous'}
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={!goalClarification[goalClarificationQuestions[currentQuestion].id]}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>
                      {currentQuestion === goalClarificationQuestions.length - 1 ? 'Lock It Down!' : 'Next'}
                    </span>
                    {currentQuestion === goalClarificationQuestions.length - 1 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
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

export default GoalsView;
