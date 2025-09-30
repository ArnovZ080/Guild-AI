import React from 'react';
import { X } from 'lucide-react';

const WorkflowViewerModal = ({ open, onClose, title = 'Automation Workflow', steps = [] }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4">
          {steps.length === 0 ? (
            <div className="text-sm text-gray-600">No steps available. Connect CRM Automation to load sequence.</div>
          ) : (
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {steps.map((s, idx) => (
                <li key={idx}>
                  <div className="font-medium">{s.name || `Step ${idx+1}`}</div>
                  <div className="text-gray-600">{s.description || 'Automated action'}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowViewerModal;


