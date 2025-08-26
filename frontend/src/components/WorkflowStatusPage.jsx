import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WorkflowVisualizer from './WorkflowVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw, AlertCircle, Clock } from 'lucide-react';

const API_BASE_URL = '/api';

const StatusIcon = ({ status }) => {
  if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'running') return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
  if (status === 'failed') return <AlertCircle className="h-5 w-5 text-red-500" />;
  return <Clock className="h-5 w-5 text-gray-500" />;
};


const WorkflowStatusPage = () => {
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, executionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/workflows/${workflowId}/status`),
          fetch(`${API_BASE_URL}/workflows/${workflowId}/executions`)
        ]);

        if (!statusRes.ok) throw new Error('Failed to fetch workflow status');
        if (!executionsRes.ok) throw new Error('Failed to fetch workflow executions');

        const statusData = await statusRes.json();
        const executionsData = await executionsRes.json();

        setWorkflow(statusData);
        setExecutions(executionsData);

        // Stop polling if workflow is in a terminal state
        if (statusData.status === 'completed' || statusData.status === 'failed') {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err.message);
        clearInterval(intervalRef.current);

      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch
    const intervalRef = React.useRef();
    intervalRef.current = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalRef.current);

  }, [workflowId]);

  if (loading) {
    return <div>Loading workflow status...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!workflow) {
    return <div>Workflow not found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Workflow Status</h1>
      <p><strong>ID:</strong> {workflow.id}</p>
      <p><strong>Status:</strong> <span style={{ color: workflow.status === 'completed' ? 'green' : 'orange' }}>{workflow.status}</span></p>
      <p><strong>Progress:</strong> {Math.round(workflow.progress * 100)}%</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader><CardTitle>Execution Plan (DAG)</CardTitle></CardHeader>
          <CardContent>
            <WorkflowVisualizer dagDefinition={workflow.dag_definition} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Execution Steps</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {executions.length > 0 ? (
              executions.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <StatusIcon status={step.status} />
                  <div>
                    <p className="font-medium">{step.agent_name}</p>
                    <p className="text-sm text-muted-foreground">Node: {step.node_id}</p>
                    {/* Optionally display output data */}
                    {step.output_data && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(step.output_data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Waiting for execution to start...</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default WorkflowStatusPage;
