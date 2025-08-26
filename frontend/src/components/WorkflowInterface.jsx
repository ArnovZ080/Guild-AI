import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Target, Clock, Users, CheckCircle } from 'lucide-react';
import WorkflowStatusPage from './WorkflowStatusPage'; // Import the status page

const deliverableTypes = [
  { id: 'brief', name: 'Brief', icon: FileText },
  { id: 'ad_copy', name: 'Ad Copy', icon: Target },
  { id: 'calendar', name: 'Calendar', icon: Clock },
  { id: 'listing', name: 'Listing Pack', icon: Users },
  { id: 'seo', name: 'SEO Checklist', icon: CheckCircle }
];

// We will fetch data rooms from the API in the future
const mockDataRooms = [
  { id: 'room-1', name: 'Marketing Assets (Google Drive)' },
  { id: 'room-2', name: 'Brand Guidelines (Local Workspace)' },
];

export function WorkflowInterface() {
  const [contractRequest, setContractRequest] = useState({
    title: '',
    objective: '',
    deliverables: [],
    dataRooms: [],
  });
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setContractRequest({ ...contractRequest, [field]: value });
  };

  const handleDeliverableToggle = (deliverableId) => {
    const updated = contractRequest.deliverables.includes(deliverableId)
      ? contractRequest.deliverables.filter(id => id !== deliverableId)
      : [...contractRequest.deliverables, deliverableId];
    handleInputChange('deliverables', updated);
  };

  const handleDataRoomToggle = (dataRoomId) => {
    const updated = contractRequest.dataRooms.includes(dataRoomId)
      ? contractRequest.dataRooms.filter(id => id !== dataRoomId)
      : [...contractRequest.dataRooms, dataRoomId];
    handleInputChange('dataRooms', updated);
  };

  const createAndExecuteWorkflow = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Create the contract
      const createContractResponse = await fetch('/api/workflows/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractRequest),
      });

      if (!createContractResponse.ok) {
        throw new Error('Failed to create contract');
      }
      const createdContract = await createContractResponse.json();

      // Step 2: Execute the workflow for the created contract
      const executeWorkflowResponse = await fetch(`/api/workflows/contracts/${createdContract.id}/execute`, {
        method: 'POST',
      });

      if (!executeWorkflowResponse.ok) {
        throw new Error('Failed to start workflow execution');
      }
      const executionData = await executeWorkflowResponse.json();

      // Set the running workflow ID to switch the view
      setRunningWorkflowId(executionData.workflow_id);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If a workflow is running, show the status page
  if (runningWorkflowId) {
    return (
      <div>
        <WorkflowStatusPage workflowId={runningWorkflowId} />
        <Button onClick={() => setRunningWorkflowId(null)} className="mt-4">
          Create Another Workflow
        </Button>
      </div>
    );
  }

  // Otherwise, show the contract creation form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Workflow</CardTitle>
        <CardDescription>
          Define your project, and the AI workforce will handle the rest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={contractRequest.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., 'Q3 Marketing Campaign for New Product'"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objective</Label>
          <Textarea
            id="objective"
            value={contractRequest.objective}
            onChange={(e) => handleInputChange('objective', e.target.value)}
            placeholder="Describe your goals. e.g., 'Generate leads for our new SaaS product by creating compelling ad copy and a research-backed blog post.'"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Select Deliverables</Label>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {deliverableTypes.map((d) => (
              <div key={d.id} className="flex items-center space-x-3">
                <Checkbox
                  id={d.id}
                  checked={contractRequest.deliverables.includes(d.id)}
                  onCheckedChange={() => handleDeliverableToggle(d.id)}
                />
                <label htmlFor={d.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <d.icon className="h-5 w-5" />
                  {d.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Data Rooms (for context)</Label>
          <div className="space-y-2 pt-2">
            {mockDataRooms.map((room) => (
              <div key={room.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`room-${room.id}`}
                  checked={contractRequest.dataRooms.includes(room.id)}
                  onCheckedChange={() => handleDataRoomToggle(room.id)}
                />
                <label htmlFor={`room-${room.id}`} className="text-sm font-medium cursor-pointer">
                  {room.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={createAndExecuteWorkflow}
          disabled={isLoading || !contractRequest.title || !contractRequest.objective}
          className="w-full"
        >
          {isLoading ? 'Starting...' : 'Create & Execute Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}
