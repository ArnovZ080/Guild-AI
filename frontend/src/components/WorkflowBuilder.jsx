import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const API_BASE = '/api/workflow-builder';

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState({});
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkflows();
    loadTemplates();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch(`${API_BASE}/workflows`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (err) {
      setError('Failed to load workflows');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (err) {
      setError('Failed to load templates');
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow)
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewWorkflow({ name: '', description: '' });
        loadWorkflows();
        setSelectedWorkflow(data.workflow_id);
      }
    } catch (err) {
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const addNode = async (workflowId, templateId, position = [100, 100]) => {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          position: position
        })
      });
      
      if (response.ok) {
        // Refresh workflow data
        if (selectedWorkflow === workflowId) {
          // Trigger refresh of selected workflow
        }
      }
    } catch (err) {
      setError('Failed to add node');
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Workflow execution started! Execution ID: ${data.execution_id}`);
      }
    } catch (err) {
      setError('Failed to execute workflow');
    }
  };

  const renderTemplatePalette = () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Node Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(templates).map(([category, templateList]) => (
          <div key={category}>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">{category}</h4>
            <div className="space-y-2">
              {templateList.map((template) => (
                <div
                  key={template.template_id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => selectedWorkflow && addNode(selectedWorkflow, template.template_id)}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600">{template.description}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {template.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderWorkflowList = () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.workflow_id}
              className={`p-3 border rounded-lg cursor-pointer ${
                selectedWorkflow === workflow.workflow_id
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedWorkflow(workflow.workflow_id)}
            >
              <div className="font-medium">{workflow.name}</div>
              <div className="text-sm text-gray-600">{workflow.description}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{workflow.node_count} nodes</Badge>
                <Badge variant="outline">{workflow.connection_count} connections</Badge>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              placeholder="Enter workflow name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              placeholder="Enter workflow description"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={createWorkflow} 
            disabled={loading || !newWorkflow.name.trim()}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Workflow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkflowCanvas = () => {
    if (!selectedWorkflow) {
      return (
        <Card className="flex-1">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🎨</div>
              <div>Select a workflow to start building</div>
              <div className="text-sm">Or create a new one to get started</div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const workflow = workflows.find(w => w.workflow_id === selectedWorkflow);
    
    return (
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workflow?.name}</CardTitle>
              <p className="text-sm text-gray-600">{workflow?.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Validate
              </Button>
              <Button 
                onClick={() => executeWorkflow(selectedWorkflow)}
                size="sm"
              >
                Execute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🚧</div>
              <div>Visual Canvas Coming Soon!</div>
              <div className="text-sm">
                Drag and drop nodes here to build your workflow
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Visual Workflow Builder</h1>
        <p className="text-gray-600">
          Build powerful workflows by combining AI agents with visual automation skills
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Sidebar - Workflows */}
        {renderWorkflowList()}
        
        {/* Center - Workflow Canvas */}
        {renderWorkflowCanvas()}
        
        {/* Right Sidebar - Node Templates */}
        {renderTemplatePalette()}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">What You Can Build</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-medium mb-2">📧 Email Automation</div>
            <div className="text-sm text-gray-600">
              Automate client emails using Apple Mail with AI-generated content
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-medium mb-2">📊 Data Processing</div>
            <div className="text-sm text-gray-600">
              Extract data from websites and process with AI analysis
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-medium mb-2">🎯 Marketing Campaigns</div>
            <div className="text-sm text-gray-600">
              Create and execute multi-channel marketing campaigns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
