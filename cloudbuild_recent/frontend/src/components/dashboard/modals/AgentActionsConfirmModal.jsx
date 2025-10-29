import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Zap } from 'lucide-react';

const AgentActionsConfirmModal = ({ title = 'Confirm Agent Actions', description, actions = [], onCancel, onProceed }) => {
  const [selected, setSelected] = useState(new Set(actions));

  const toggle = (action) => {
    const next = new Set(selected);
    if (next.has(action)) next.delete(action); else next.add(action);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-800 mb-2">Selected actions</div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {actions.map((a) => (
                <label key={a} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={selected.has(a)} onChange={() => toggle(a)} />
                  <span className="text-sm text-gray-800">{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
            <button onClick={() => onProceed(Array.from(selected))} className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Proceed
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentActionsConfirmModal;
