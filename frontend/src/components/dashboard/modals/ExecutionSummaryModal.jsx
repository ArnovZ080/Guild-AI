import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Brain, Users, Target, Zap, Shield } from 'lucide-react';

const ExecutionSummaryModal = ({ open, onClose, title = 'Workflow Submitted', steps = [], agents = [] }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e)=>e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600"><CheckCircle className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">For full transparency, here are the exact steps and agents involved.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-blue-600" /> Steps to be executed</h3>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800">{s}</div>
              ))}
              {steps.length === 0 && <div className="text-sm text-gray-600">No steps provided.</div>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" /> Agents involved</h3>
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">{a}</span>
              ))}
              {agents.length === 0 && <div className="text-sm text-gray-600">No agents listed.</div>}
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2"><Shield className="w-3 h-3" /> All actions are logged for auditability.</div>
        </div>

        <div className="p-6 border-t bg-gray-50 text-right">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700">Close</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExecutionSummaryModal;


