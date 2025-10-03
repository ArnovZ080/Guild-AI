import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';

const CustomerHealthCheckModal = ({ open, onClose, customer }) => {
  if (!open || !customer) return null;

  const riskColor = (risk) => (
    risk === 'low' ? 'text-green-600 bg-green-100' :
    risk === 'medium' ? 'text-yellow-600 bg-yellow-100' :
    risk === 'high' ? 'text-orange-600 bg-orange-100' :
    'text-red-600 bg-red-100'
  );

  const healthBand = customer.health_score >= 80 ? 'Excellent' : customer.health_score >= 60 ? 'Good' : customer.health_score >= 40 ? 'Warning' : 'Critical';

  const insights = [
    `Engagement score at ${customer.engagement_score}/100 indicates ${customer.engagement_score >= 80 ? 'strong' : customer.engagement_score >= 60 ? 'moderate' : 'weak'} usage.`,
    `Sentiment score ${(customer.sentiment_score * 100).toFixed(0)}% derived from support and messaging history.`,
    `Churn risk labeled '${customer.churn_risk}' based on recent activity and support tickets.`
  ];

  const recommendedActions = [
    customer.churn_risk === 'high' || customer.churn_risk === 'critical'
      ? 'Trigger win-back sequence with personalized incentive'
      : 'Schedule success check-in to reinforce value',
    customer.engagement_score < 70
      ? 'Enroll in onboarding refresh and send product tips'
      : 'Offer advanced feature walkthrough or webinar invite',
    customer.support_tickets > 2
      ? 'Proactive support: review last tickets and send summary'
      : 'Share best-practice guide tailored to segment'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg"><Heart className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Health Check</h2>
              <p className="text-sm text-gray-600">{customer.name} • {customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Health Score</div>
              <div className="text-3xl font-bold text-gray-900">{customer.health_score}</div>
              <div className="text-xs text-gray-600">Band: {healthBand}</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Churn Risk</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(customer.churn_risk)}`}>{customer.churn_risk}</span>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Engagement</div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">{customer.engagement_score}/100</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3"><Info className="w-4 h-4 text-gray-600" /><h3 className="font-semibold text-gray-900">Why we say this</h3></div>
            <ul className="space-y-2 text-sm text-gray-700">
              {insights.map((it, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />{it}</li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-700" /><h3 className="font-semibold text-gray-900">Recommended next actions</h3></div>
            <ul className="space-y-2 text-sm">
              {recommendedActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />{a}</li>
              ))}
            </ul>
            {(customer.health_score < 60) && (
              <div className="mt-3 flex items-start gap-2 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                Prioritize retention steps; orchestrator can launch a win-back workflow upon approval.
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

export default CustomerHealthCheckModal;


