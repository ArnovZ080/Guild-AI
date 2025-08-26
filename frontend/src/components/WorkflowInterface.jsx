import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Target, Clock, Users, CheckCircle } from 'lucide-react';
import WorkflowStatusPage from './WorkflowStatusPage';
import WorkflowVisualizer from './WorkflowVisualizer';

const deliverableTypes = [
  { id: 'brief', name: 'Brief', icon: FileText },
  { id: 'ad_copy', name: 'Ad Copy', icon: Target },
  { id: 'calendar', name: 'Calendar', icon: Clock },
  { id: 'listing', name: 'Listing Pack', icon: Users },
  { id: 'seo', name: 'SEO Checklist', icon: CheckCircle }
];

const mockDataRooms = [
  { id: 'room-1', name: 'Marketing Assets (Google Drive)' },
  { id: 'room-2', name: 'Brand Guidelines (Local Workspace)' },
];

export function WorkflowInterface() {
  const [view, setView] = useState('form'); // 'form', 'approval', 'status'
  const [contractRequest, setContractRequest] = useState({
    title: '', objective: '', context: '', special_notes: '',
    target_audience: '', deliverables: [], dataRooms: [], zapier_webhook_url: ''
  });
  const [plannedWorkflow, setPlannedWorkflow] = useState(null);
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setContractRequest({ ...contractRequest, [field]: value });
  };

  const handleDeliverableToggle = (id) => {
    const updated = contractRequest.deliverables.includes(id) ? contractRequest.deliverables.filter(i => i !== id) : [...contractRequest.deliverables, id];
    handleInputChange('deliverables', updated);
  };

  const handleDataRoomToggle = (id) => {
    const updated = contractRequest.dataRooms.includes(id) ? contractRequest.dataRooms.filter(i => i !== id) : [...contractRequest.dataRooms, id];
    handleInputChange('dataRooms', updated);
  };

  const createAndPlanWorkflow = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const createContractRes = await fetch('/api/workflows/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractRequest),
      });
      if (!createContractRes.ok) throw new Error('Failed to create contract');
      const createdContract = await createContractRes.json();

      const planWorkflowRes = await fetch(`/api/workflows/contracts/${createdContract.id}/plan`, {
        method: 'POST',
      });
      if (!planWorkflowRes.ok) throw new Error('Failed to create workflow plan');
      const plannedData = await planWorkflowRes.json();

      setPlannedWorkflow(plannedData);
      setView('approval');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const approveAndExecute = async () => {
    if (!plannedWorkflow) return;
    setIsLoading(true);
    setError(null);
    try {
      const approveRes = await fetch(`/api/workflows/${plannedWorkflow.id}/approve`, {
        method: 'POST',
      });
      if (!approveRes.ok) throw new Error('Failed to approve workflow');

      setRunningWorkflowId(plannedWorkflow.id);
      setView('status');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetView = () => {
    setView('form');
    setPlannedWorkflow(null);
    setRunningWorkflowId(null);
    setContractRequest({
      title: '', objective: '', context: '', special_notes: '',
      target_audience: '', deliverables: [], dataRooms: [], zapier_webhook_url: ''
    });
  };

  if (view === 'status') {
    return (
      <div>
        <WorkflowStatusPage workflowId={runningWorkflowId} />
        <Button onClick={resetView} className="mt-4">
          Create Another Workflow
        </Button>
      </div>
    );
  }

  if (view === 'approval') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approve Workflow Plan</CardTitle>
          <CardDescription>Review the generated plan before execution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WorkflowVisualizer dagDefinition={plannedWorkflow.dag_definition} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setView('form')}>Back to Edit</Button>
            <Button onClick={approveAndExecute} disabled={isLoading}>
              {isLoading ? 'Executing...' : 'Approve & Execute'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default view is 'form'
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Workflow</CardTitle>
        <CardDescription>Define your project, and the AI workforce will handle the rest.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* All form fields go here... */}
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" value={contractRequest.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., 'Q3 Marketing Campaign'" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objective">Objective</Label>
          <Textarea id="objective" value={contractRequest.objective} onChange={(e) => handleInputChange('objective', e.target.value)} placeholder="Describe your primary goal..." rows={4} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_audience">Target Audience</Label>
          <Input id="target_audience" value={contractRequest.target_audience} onChange={(e) => handleInputChange('target_audience', e.target.value)} placeholder="e.g., 'Real estate agents in Cape Town'" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="context">Context</Label>
          <Textarea id="context" value={contractRequest.context} onChange={(e) => handleInputChange('context', e.target.value)} placeholder="Provide relevant background information..." rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="special_notes">Special Notes</Label>
          <Textarea id="special_notes" value={contractRequest.special_notes} onChange={(e) => handleInputChange('special_notes', e.target.value)} placeholder="e.g., 'Use a formal tone.'" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Deliverables</Label>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {deliverableTypes.map((d) => (
              <div key={d.id} className="flex items-center space-x-3">
                <Checkbox id={d.id} checked={contractRequest.deliverables.includes(d.id)} onCheckedChange={() => handleDeliverableToggle(d.id)} />
                <label htmlFor={d.id} className="flex items-center gap-2 text-sm font-medium"><d.icon className="h-5 w-5" />{d.name}</label>
              </div>
            ))}
          </div>
        </div>
         <div className="space-y-2">
          <Label htmlFor="zapier_webhook_url">Zapier Webhook URL (Optional)</Label>
          <Input id="zapier_webhook_url" value={contractRequest.zapier_webhook_url} onChange={(e) => handleInputChange('zapier_webhook_url', e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/..." />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={createAndPlanWorkflow} disabled={isLoading || !contractRequest.title || !contractRequest.objective} className="w-full">
          {isLoading ? 'Generating Plan...' : 'Generate Workflow Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
