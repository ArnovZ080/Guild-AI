import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WorkflowVisualizer from './WorkflowVisualizer';

const WorkflowStatusPage = () => {
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        // NOTE: This assumes the API server is running on port 5000
        // and that the dev server is proxying requests. This may need
        // to be configured in vite.config.js for local development.
        const response = await fetch(`/api/workflows/${workflowId}/status`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setWorkflow(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowStatus();

    // Set up polling to get live updates
    const interval = setInterval(fetchWorkflowStatus, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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

      <h2>Execution Plan (DAG)</h2>
      <WorkflowVisualizer dagDefinition={workflow.dag_definition} />

      {/* TODO: Add real-time logs and human override controls here */}
    </div>
  );
};

export default WorkflowStatusPage;
