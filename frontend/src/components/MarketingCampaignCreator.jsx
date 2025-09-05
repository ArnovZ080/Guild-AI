import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2, CheckCircle, XCircle, FileText, BrainCircuit, Bot } from 'lucide-react';

const API_URL = '/api'; // Use the Vite proxy to connect to local backend

const nodeStatusIcons = {
    pending: <FileText className="h-4 w-4 text-gray-500" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const CustomNode = ({ data }) => (
    <Card className={`border-2 ${data.status === 'running' ? 'border-blue-500' : 'border-transparent'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
            {nodeStatusIcons[data.status] || <FileText className="h-4 w-4 text-gray-500" />}
        </CardHeader>
        <CardContent>
            <p className="text-xs text-muted-foreground">{data.description}</p>
        </CardContent>
    </Card>
);

const nodeTypes = { custom: CustomNode };

const MarketingCampaignCreator = () => {
    const [view, setView] = useState('input'); // 'input', 'approval', 'monitoring'
    const [objective, setObjective] = useState('');
    const [audienceDesc, setAudienceDesc] = useState('');
    const [notes, setNotes] = useState('');

    const [workflow, setWorkflow] = useState(null);
    const [workflowId, setWorkflowId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // --- API Calls ---
    const generatePlan = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/workflows/contracts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objective,
                    target_audience: { description: audienceDesc },
                    additional_notes: notes,
                }),
            });
            if (!response.ok) throw new Error('Failed to generate plan.');
            const data = await response.json();
            setWorkflow(data.workflow_definition);
            setWorkflowId(data.id);
            setView('approval');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
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
            if (!response.ok) return; // Don't throw error on failed poll
            const data = await response.json();

            // Update node statuses
            setNodes((nds) =>
                nds.map((node) => {
                    const execution = data.executions.find((ex) => ex.node_id === node.id);
                    return { ...node, data: { ...node.data, status: execution ? execution.status : 'pending' } };
                })
            );

            // If workflow is finished, stop polling
            if (data.status === 'completed' || data.status === 'failed') {
                // Polling stops in useEffect cleanup
                return;
            }

        } catch (err) {
            console.error("Polling error:", err);
        }
    }, [view, workflowId, setNodes]);

    // --- Effects ---
    useEffect(() => {
        if (workflow) {
            const initialNodes = workflow.tasks.map((task, i) => ({
                id: task.task_id,
                type: 'custom',
                data: { label: task.agent, description: task.description, status: 'pending' },
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
            const interval = setInterval(pollWorkflowStatus, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [view, pollWorkflowStatus]);

    // --- Render Logic ---
    const renderInputView = () => (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center"><BrainCircuit className="mr-2" /> New Marketing Campaign</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={generatePlan}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="objective">Primary Objective</Label>
                            <Textarea id="objective" value={objective} onChange={e => setObjective(e.target.value)} placeholder="e.g., Launch our new AI-powered copywriting tool and get 1,000 signups." required />
                        </div>
                        <div>
                            <Label htmlFor="audience">Target Audience</Label>
                            <Textarea id="audience" value={audienceDesc} onChange={e => setAudienceDesc(e.target.value)} placeholder="e.g., Marketing professionals and small business owners interested in AI and content creation." required />
                        </div>
                        <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Focus on social media marketing and a strong landing page. We need to be better than Copy.ai." />
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate AI Plan'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    const renderApprovalView = () => (
        <div className="w-full h-[70vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">Approve AI-Generated Plan</h2>
            <div className="flex-grow border rounded-lg">
                <ReactFlowProvider>
                    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView nodeTypes={nodeTypes}>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
            <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" onClick={() => setView('input')}>Back</Button>
                <Button onClick={approveAndExecute} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Approve & Execute'}
                </Button>
            </div>
        </div>
    );

    const renderMonitoringView = () => (
         <div className="w-full h-[70vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
                <Bot className="mr-2" /> AI Team is At Work
            </h2>
            <div className="flex-grow border rounded-lg">
                <ReactFlowProvider>
                    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView nodeTypes={nodeTypes}>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );

    return (
        <div className="p-4 flex justify-center items-center h-full">
            {view === 'input' && renderInputView()}
            {view === 'approval' && renderApprovalView()}
            {view === 'monitoring' && renderMonitoringView()}
        </div>
    );
};

export default MarketingCampaignCreator;
