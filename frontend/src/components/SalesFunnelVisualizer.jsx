import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const SalesFunnelVisualizer = ({ funnelPlan }) => {
  const { nodes, edges } = useMemo(() => {
    if (!funnelPlan || !funnelPlan.stages) {
      return { nodes: [], edges: [] };
    }

    const initialNodes = [];
    const initialEdges = [];

    funnelPlan.stages.forEach((stage, index) => {
      const position = { x: 250, y: index * 250 };
      initialNodes.push({
        id: stage.name.replace(/\s+/g, '-').toLowerCase(),
        type: 'default',
        data: { label: (
          <div>
            <strong>{stage.name}</strong>
            <p style={{ fontSize: '12px', margin: 0 }}>{stage.strategy}</p>
            <p style={{ fontSize: '10px', marginTop: '5px' }}>
              Content: {stage.content_needed.join(', ')}
            </p>
          </div>
        )},
        position,
        style: { width: 300, border: '1px solid #1a1a1a', borderRadius: '8px' }
      });

      if (index > 0) {
        const prevStage = funnelPlan.stages[index - 1];
        initialEdges.push({
          id: `e-${prevStage.name}-${stage.name}`,
          source: prevStage.name.replace(/\s+/g, '-').toLowerCase(),
          target: stage.name.replace(/\s+/g, '-').toLowerCase(),
          type: 'smoothstep',
        });
      }
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [funnelPlan]);

  if (!nodes || nodes.length === 0) {
    return <div>No sales funnel plan to display.</div>;
  }

  return (
    <div style={{ height: '600px', border: '1px solid #ddd', borderRadius: '8px' }}>
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

export default SalesFunnelVisualizer;
