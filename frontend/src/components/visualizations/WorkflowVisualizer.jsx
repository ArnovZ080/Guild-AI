import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const WorkflowVisualizer = ({ dagDefinition }) => {
  const { nodes, edges } = useMemo(() => {
    if (!dagDefinition || !dagDefinition.nodes) {
      return { nodes: [], edges: [] };
    }

    const initialNodes = [];
    const initialEdges = [];
    const nodePositions = {}; // To store positions for layout

    // A simple layout algorithm
    dagDefinition.nodes.forEach((node, index) => {
      // Basic vertical layout
      const position = { x: 100, y: index * 150 };
      nodePositions[node.id] = position;

      initialNodes.push({
        id: node.id,
        type: 'default', // or a custom node type
        data: { label: `${node.name}\nTask: ${node.task.substring(0, 50)}...` },
        position,
      });

      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach(depId => {
          initialEdges.push({
            id: `e-${depId}-${node.id}`,
            source: depId,
            target: node.id,
            type: 'smoothstep',
            animated: true,
          });
        });
      }
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [dagDefinition]);

  if (!nodes || nodes.length === 0) {
    return <div>No workflow plan to display.</div>;
  }

  return (
    <div style={{ height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default WorkflowVisualizer;
