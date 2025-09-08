import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const WorkflowStatusPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading workflows
    const mockWorkflows = [
      {
        id: '1',
        name: 'Lead Generation Campaign',
        description: 'Automated lead generation and nurturing workflow',
        status: 'running',
        progress: 75,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        agents: [
          { name: 'Research Agent', status: 'completed', progress: 100 },
          { name: 'Scraper Agent', status: 'running', progress: 80 },
          { name: 'Lead Personalization Agent', status: 'pending', progress: 0 },
          { name: 'Email Agent', status: 'pending', progress: 0 }
        ],
        metrics: {
          leadsGenerated: 45,
          emailsSent: 23,
          responses: 3,
          conversionRate: 13.0
        }
      },
      {
        id: '2',
        name: 'Content Marketing Pipeline',
        description: 'Automated content creation and distribution workflow',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        completedTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        agents: [
          { name: 'Content Strategist Agent', status: 'completed', progress: 100 },
          { name: 'Writer Agent', status: 'completed', progress: 100 },
          { name: 'SEO Agent', status: 'completed', progress: 100 },
          { name: 'Social Media Agent', status: 'completed', progress: 100 }
        ],
        metrics: {
          articlesCreated: 5,
          socialPosts: 15,
          keywordsOptimized: 25,
          engagementRate: 8.5
        }
      },
      {
        id: '3',
        name: 'Customer Onboarding Sequence',
        description: 'Automated customer onboarding and welcome sequence',
        status: 'paused',
        progress: 30,
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        agents: [
          { name: 'Onboarding Agent', status: 'completed', progress: 100 },
          { name: 'Email Agent', status: 'paused', progress: 30 },
          { name: 'Training Agent', status: 'pending', progress: 0 },
          { name: 'Support Agent', status: 'pending', progress: 0 }
        ],
        metrics: {
          customersOnboarded: 12,
          emailsSent: 8,
          trainingCompleted: 3,
          satisfactionScore: 4.2
        }
      }
    ];

    setTimeout(() => {
      setWorkflows(mockWorkflows);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'completed': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200';
      case 'paused': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'failed': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      case 'pending': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
      case 'running': return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200';
      case 'paused': return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200';
      case 'failed': return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200';
      case 'pending': return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (estimatedCompletion) => {
    const now = new Date();
    const diff = estimatedCompletion - now;
    if (diff <= 0) return 'Completed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Status</h2>
          <p className="text-gray-600">Monitor your automated workflows and agent activities</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Create Workflow</Button>
          <Button>View All</Button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter(w => w.status === 'running').length}
                </p>
              </div>
              <div className="text-2xl">🔄</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {workflows.filter(w => w.status === 'completed').length}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {workflows.filter(w => w.status === 'paused').length}
                </p>
              </div>
              <div className="text-2xl">⏸️</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-600">
                  {workflows.length}
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    {workflow.status === 'running' && (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{workflow.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        workflow.progress >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        workflow.progress >= 75 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                        workflow.progress >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                        workflow.progress >= 25 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                        'bg-gradient-to-r from-gray-400 to-slate-500'
                      }`}
                      style={{ width: `${workflow.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Started</p>
                    <p className="text-gray-600">{formatTime(workflow.startTime)}</p>
                  </div>
                  {workflow.status === 'running' && workflow.estimatedCompletion && (
                    <div>
                      <p className="font-medium text-gray-900">ETA</p>
                      <p className="text-gray-600">{getTimeRemaining(workflow.estimatedCompletion)}</p>
                    </div>
                  )}
                  {workflow.status === 'completed' && workflow.completedTime && (
                    <div>
                      <p className="font-medium text-gray-900">Completed</p>
                      <p className="text-gray-600">{formatTime(workflow.completedTime)}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Agents</p>
                    <p className="text-gray-600">
                      {workflow.agents.filter(a => a.status === 'completed').length} / {workflow.agents.length}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {workflow.status === 'running' && (
                    <Button variant="outline" size="sm">
                      Pause
                    </Button>
                  )}
                  {workflow.status === 'paused' && (
                    <Button variant="outline" size="sm">
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
          </CardContent>
        </Card>
          </motion.div>
        ))}
      </div>

      {/* Workflow Detail Modal */}
      <AnimatePresence>
        {selectedWorkflow && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWorkflow(null)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedWorkflow.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedWorkflow.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedWorkflow(null)}
                  >
                    Close
                  </Button>
                </div>

                {/* Workflow Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{selectedWorkflow.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        selectedWorkflow.progress >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        selectedWorkflow.progress >= 75 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                        selectedWorkflow.progress >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                        selectedWorkflow.progress >= 25 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                        'bg-gradient-to-r from-gray-400 to-slate-500'
                      }`}
                      style={{ width: `${selectedWorkflow.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Agent Status */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Status</h4>
                  <div className="space-y-3">
                    {selectedWorkflow.agents.map((agent, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.status === 'completed' ? 'bg-green-500' :
                            agent.status === 'running' ? 'bg-blue-500' :
                            agent.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-600">Progress: {agent.progress}%</p>
                          </div>
                        </div>
                        <Badge className={getAgentStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedWorkflow.metrics).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{value}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowStatusPage;