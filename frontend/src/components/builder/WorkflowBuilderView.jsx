import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', type: 'input', data: { label: 'Client Data Input', status: 'completed' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Content Strategist', status: 'completed' }, position: { x: 250, y: 100 } },
  { id: '3', data: { label: 'Copywriter', status: 'running' }, position: { x: 250, y: 200 } },
  { id: '4', type: 'output', data: { label: 'Final Email', status: 'pending' }, position: { x: 250, y: 300 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

const NodesSidebar = () => {
    return (
        <aside className="w-64 bg-gray-800 p-4 text-white">
            <h3 className="text-lg font-bold mb-4">Nodes</h3>
            <div className="bg-gray-700 p-2 rounded mb-2 cursor-grab">Input Node</div>
            <div className="bg-gray-700 p-2 rounded mb-2 cursor-grab">AI Agent Node</div>
            <div className="bg-gray-700 p-2 rounded mb-2 cursor-grab">Output Node</div>
        </aside>
    );
};

const TopBar = ({ onSave, onExecute }) => {
    return (
        <div className="absolute top-0 left-0 right-0 bg-gray-800 p-2 flex justify-end space-x-2 z-10">
            <button onClick={onExecute} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Run</button>
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
    );
}

const nodeClassName = (node) => {
    switch (node.data.status) {
        case 'running': return 'border-yellow-500 border-2';
        case 'completed': return 'border-green-500 border-2';
        case 'failed': return 'border-red-500 border-2';
        default: return '';
    }
};

const Builder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { toObject } = useReactFlow();

  // Simulate real-time execution updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.data.status === 'running') {
            // Finish the running node and start the next one
            const nextNodeId = edges.find((edge) => edge.source === node.id)?.target;
            if (nextNodeId) {
              return { ...node, data: { ...node.data, status: 'completed' } };
            }
          }
          const prevNodeId = edges.find((edge) => edge.target === node.id)?.source;
          const prevNode = currentNodes.find(n => n.id === prevNodeId);
          if (prevNode?.data.status === 'completed' && node.data.status === 'pending') {
            return { ...node, data: { ...node.data, status: 'running' } };
          }
          return node;
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [edges, setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSave = useCallback(async () => { /* ... save logic ... */ }, [toObject]);
  const handleExecute = useCallback(async () => { /* ... execute logic ... */ }, []);

  return (
    <div className="flex-grow h-full relative">
        <TopBar onSave={handleSave} onExecute={handleExecute} />
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="pt-16"
            nodeClassName={nodeClassName}
        >
            <Background />
            <Controls />
        </ReactFlow>
    </div>
  );
};

const WorkflowBuilderView = () => (
    <div className="flex h-screen bg-gray-900">
        <ReactFlowProvider>
            <NodesSidebar />
            <Builder />
        </ReactFlowProvider>
    </div>
);

export default WorkflowBuilderView;
