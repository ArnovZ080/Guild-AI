import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  FileText, 
  BrainCircuit, 
  Bot, 
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';

const API_URL = 'http://localhost:8000';

const nodeStatusIcons = {
    pending: <FileText className="h-4 w-4 text-gray-500" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const EnhancedCustomNode = ({ data }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'failed':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()} transition-all duration-300 hover:shadow-lg`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
            {nodeStatusIcons[data.status] || <FileText className="h-4 w-4 text-gray-500" />}
        </CardHeader>
        <CardContent>
            <p className="text-xs text-muted-foreground">{data.description}</p>
            {data.estimatedTime && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {data.estimatedTime}
              </div>
            )}
        </CardContent>
    </Card>
);
};

const nodeTypes = { custom: EnhancedCustomNode };

const EnhancedMarketingCampaignCreator = () => {
  const { getCurrentMode, updateUserProfile } = usePsychologicalOptimization();
  const { triggerTaskCompletionCelebration } = useCelebrations();
  
  const [view, setView] = useState('input');
  const [objective, setObjective] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [campaignType, setCampaignType] = useState('launch');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('30');

  const [workflow, setWorkflow] = useState(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          accent: 'sky-dawn',
          text: 'text-sky-dusk',
          card: 'bg-white/90 backdrop-blur-sm',
          border: 'border-sky-200'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep',
          card: 'bg-white/95 backdrop-blur-sm',
          border: 'border-forest-200'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          accent: 'earth-warm',
          text: 'text-earth-sand',
          card: 'bg-white/85 backdrop-blur-sm',
          border: 'border-earth-200'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep',
          card: 'bg-white/95 backdrop-blur-sm',
          border: 'border-forest-200'
        };
    }
  };

  const modeStyles = getModeStyles();

  const campaignTypes = [
    {
      id: 'launch',
      name: 'Product Launch',
      icon: '🚀',
      description: 'Launch a new product or service to market',
      estimatedImpact: 'High',
      complexity: 'High'
    },
    {
      id: 'awareness',
      name: 'Brand Awareness',
      icon: '👁️',
      description: 'Increase brand recognition and visibility',
      estimatedImpact: 'Medium',
      complexity: 'Medium'
    },
    {
      id: 'conversion',
      name: 'Lead Generation',
      icon: '🎯',
      description: 'Generate qualified leads and conversions',
      estimatedImpact: 'High',
      complexity: 'Medium'
    },
    {
      id: 'retention',
      name: 'Customer Retention',
      icon: '💝',
      description: 'Retain and engage existing customers',
      estimatedImpact: 'Medium',
      complexity: 'Low'
    }
  ];

  const generatePlan = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress updates for psychological effect
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const response = await fetch(`${API_URL}/workflows/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          target_audience: { description: audienceDesc },
          additional_notes: notes,
          campaign_type: campaignType,
          budget: budget,
          timeline: timeline
        }),
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) throw new Error('Failed to generate plan.');
      
      const data = await response.json();
      setWorkflow(data.workflow_definition);
      setWorkflowId(data.id);
      
      // Trigger celebration for plan generation
      triggerTaskCompletionCelebration({
        name: 'Marketing campaign plan generated',
        difficulty: 'hard',
        type: 'milestone_reached',
        isLinkedToMajorGoal: true,
        revenueImpact: budget ? parseInt(budget) * 0.3 : 5000
      });
      
      setView('approval');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const approveAndExecute = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/workflows/${workflowId}/approve`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to approve and execute workflow.');
      
      // Update user profile with campaign activity
      updateUserProfile({ 
        activeCampaigns: true,
        marketingActivity: 'high',
        lastCampaignType: campaignType
      });
      
      // Trigger celebration for campaign launch
      triggerTaskCompletionCelebration({
        name: 'Marketing campaign launched',
        difficulty: 'hard',
        type: 'task_complete',
        isLinkedToMajorGoal: true,
        revenueImpact: budget ? parseInt(budget) : 10000
      });
      
      setView('monitoring');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pollWorkflowStatus = useCallback(async () => {
    if (view !== 'monitoring' || !workflowId) return;

    try {
      const response = await fetch(`${API_URL}/workflows/${workflowId}/status`);
      if (!response.ok) return;
      const data = await response.json();

      // Update node statuses with psychological feedback
      setNodes((nds) =>
        nds.map((node) => {
          const execution = data.executions.find((ex) => ex.node_id === node.id);
          const newStatus = execution ? execution.status : 'pending';
          
          // Trigger micro-celebration for completed tasks
          if (node.data.status !== 'completed' && newStatus === 'completed') {
            triggerTaskCompletionCelebration({
              name: `${node.data.label} completed`,
              difficulty: 'medium',
              type: 'task_complete',
              isLinkedToMajorGoal: true,
              revenueImpact: 1000
            });
          }
          
          return { 
            ...node, 
            data: { 
              ...node.data, 
              status: newStatus,
              estimatedTime: execution?.estimated_completion || node.data.estimatedTime
            } 
          };
        })
      );

      // Check if workflow is finished
      if (data.status === 'completed' || data.status === 'failed') {
        if (data.status === 'completed') {
          triggerTaskCompletionCelebration({
            name: 'Marketing campaign completed successfully',
            difficulty: 'hard',
            type: 'milestone_reached',
            isLinkedToMajorGoal: true,
            revenueImpact: budget ? parseInt(budget) * 2 : 15000
          });
        }
        return;
      }

    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [view, workflowId, setNodes, triggerTaskCompletionCelebration, budget]);

  useEffect(() => {
    if (workflow) {
      const initialNodes = workflow.tasks.map((task, i) => ({
        id: task.task_id,
        type: 'custom',
        data: { 
          label: task.agent, 
          description: task.description, 
          status: 'pending',
          estimatedTime: task.estimated_time || '5-10 min'
        },
        position: { x: i * 250, y: 100 },
      }));
      
      const initialEdges = workflow.tasks.flatMap(task =>
        task.dependencies.map(dep => ({
          id: `e-${dep}-${task.task_id}`,
          source: dep,
          target: task.task_id,
          animated: true,
        }))
      );
      
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [workflow, setNodes, setEdges]);

  useEffect(() => {
    if (view === 'monitoring') {
      const interval = setInterval(pollWorkflowStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [view, pollWorkflowStatus]);

  const renderInputView = () => (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-3xl font-bold ${modeStyles.text} mb-4`}>
            🎯 Marketing Campaign Creator
          </h1>
          <p className="text-lg text-gray-600">
            Let our AI team create a comprehensive marketing strategy tailored to your goals
          </p>
        </motion.div>

        <Card className={`${modeStyles.card} border ${modeStyles.border} shadow-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2" /> Campaign Strategy Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={generatePlan} className="space-y-6">
              {/* Campaign Type Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Campaign Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        campaignType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                      onClick={() => setCampaignType(type.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Impact: {type.estimatedImpact}</span>
                        <span>Complexity: {type.complexity}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)} 
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline (Days)</Label>
                  <Input 
                    id="timeline" 
                    type="number" 
                    value={timeline} 
                    onChange={e => setTimeline(e.target.value)} 
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="objective">Primary Objective</Label>
                <Textarea 
                  id="objective" 
                  value={objective} 
                  onChange={e => setObjective(e.target.value)} 
                  placeholder="e.g., Launch our new AI-powered copywriting tool and get 1,000 signups." 
                  required 
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Textarea 
                  id="audience" 
                  value={audienceDesc} 
                  onChange={e => setAudienceDesc(e.target.value)} 
                  placeholder="e.g., Marketing professionals and small business owners interested in AI and content creation." 
                  required 
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="e.g., Focus on social media marketing and a strong landing page. We need to be better than Copy.ai." 
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating AI Strategy...</span>
                    {progress > 0 && (
                      <span className="ml-2 text-sm">({Math.round(progress)}%)</span>
                    )}
                  </div>
                ) : (
                  'Generate AI Marketing Plan'
                )}
              </Button>

              {isLoading && progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApprovalView = () => (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className={`text-2xl font-bold ${modeStyles.text} mb-4`}>
            📋 Review AI-Generated Campaign Plan
          </h2>
          <p className="text-gray-600">
            Our AI team has created a comprehensive strategy. Review the workflow below and approve when ready.
          </p>
        </motion.div>

        <div className="h-[70vh] border rounded-lg bg-white shadow-lg">
          <ReactFlowProvider>
            <ReactFlow 
              nodes={nodes} 
              edges={edges} 
              onNodesChange={onNodesChange} 
              onEdgesChange={onEdgesChange} 
              fitView 
              nodeTypes={nodeTypes}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => setView('input')}>
            Back to Setup
          </Button>
          <Button onClick={approveAndExecute} disabled={isLoading} size="lg">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching Campaign...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Approve & Launch Campaign</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMonitoringView = () => (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className={`text-2xl font-bold ${modeStyles.text} mb-4 flex items-center justify-center`}>
            <Bot className="mr-2" /> AI Marketing Team in Action
          </h2>
          <p className="text-gray-600">
            Your marketing campaign is being executed by our specialized AI agents. Watch the progress in real-time.
          </p>
        </motion.div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className={`${modeStyles.card} border ${modeStyles.border}`}>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{nodes.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className={`${modeStyles.card} border ${modeStyles.border}`}>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {nodes.filter(n => n.data.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className={`${modeStyles.card} border ${modeStyles.border}`}>
            <CardContent className="p-4 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {nodes.filter(n => n.data.status === 'running').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card className={`${modeStyles.card} border ${modeStyles.border}`}>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {budget ? `$${budget}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Budget</div>
            </CardContent>
          </Card>
        </div>

        <div className="h-[60vh] border rounded-lg bg-white shadow-lg">
          <ReactFlowProvider>
            <ReactFlow 
              nodes={nodes} 
              edges={edges} 
              onNodesChange={onNodesChange} 
              onEdgesChange={onEdgesChange} 
              fitView 
              nodeTypes={nodeTypes}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === 'input' && renderInputView()}
      {view === 'approval' && renderApprovalView()}
      {view === 'monitoring' && renderMonitoringView()}
    </>
  );
};

export default EnhancedMarketingCampaignCreator;
