import React from 'react';
import { motion } from 'framer-motion';
import { X, Target, MapPin, ChevronRight, Clock, MessageCircle, Mail, Activity } from 'lucide-react';

const stageOrder = ['lead', 'prospect', 'trial', 'customer', 'evangelist'];

const CustomerJourneyModal = ({ open, onClose, customer }) => {
  if (!open || !customer) return null;

  const currentStage = String(customer.lifecycle_stage || 'lead').toLowerCase();
  const stageIndex = stageOrder.indexOf(currentStage);
  const touchpoints = Array.isArray(customer.touchpoints) ? customer.touchpoints : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg"><Target className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Journey</h2>
              <p className="text-sm text-gray-600">{customer.name} • current stage: <span className="capitalize">{currentStage}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stages */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {stageOrder.map((stage, idx) => (
              <div key={stage} className={`border rounded-lg p-4 text-center ${idx <= stageIndex ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-sm font-semibold capitalize ${idx <= stageIndex ? 'text-indigo-700' : 'text-gray-700'}`}>{stage}</div>
                {idx === stageIndex && <div className="mt-1 text-xs text-indigo-700">Current</div>}
              </div>
            ))}
          </div>

          {/* Touchpoints */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-gray-700" /><h3 className="font-semibold text-gray-900">Recent touchpoints</h3></div>
            {touchpoints.length === 0 ? (
              <div className="text-sm text-gray-600">No recent touchpoints recorded.</div>
            ) : (
              <div className="space-y-2">
                {touchpoints.map((tp, i) => {
                  const Icon = tp.type === 'email' ? Mail : tp.type === 'chat' ? MessageCircle : Activity;
                  return (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-700" />
                        <span className="capitalize text-sm text-gray-800">{tp.type}</span>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(tp.date).toLocaleDateString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 text-right">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700">Close</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerJourneyModal;


