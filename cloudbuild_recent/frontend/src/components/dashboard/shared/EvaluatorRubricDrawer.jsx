import React from 'react';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <div className="text-xs text-gray-500 mr-2">{label}</div>
    <div className="text-xs text-gray-900 font-medium text-right">{value ?? '—'}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <div className="text-xs font-semibold text-gray-700 mb-2">{title}</div>
    <div className="rounded border border-gray-200 bg-white p-3">{children}</div>
  </div>
);

const EvaluatorRubricDrawer = ({ open, onClose, data }) => {
  if (!open) return null;
  const judge = data?.judge || {};
  const seo = data?.seo || {};
  const compliance = data?.compliance || {};
  const overall = data?.overall_score;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 mb-4 rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900">Evaluator Rubric</div>
            {typeof overall === 'number' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${overall >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Overall: {(overall * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <Section title="Judge">
            <Row label="Status" value={judge?.judge_layer_results?.status || '—'} />
            <Row label="Threshold" value={judge?.judge_layer_results?.threshold ?? '—'} />
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Evaluations</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(judge?.judge_layer_results?.evaluations || []).map((e, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-2">
                    <div className="text-xs font-medium text-gray-900">{e.agent}</div>
                    <Row label="Score" value={typeof e.score === 'number' ? (e.score * 100).toFixed(0) + '%' : '—'} />
                    <div className="text-xs text-gray-600 mt-1">{e.feedback}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          <Section title="SEO">
            <div className="text-xs text-gray-700 whitespace-pre-wrap">{seo?.data?.analysis || 'No SEO analysis available'}</div>
          </Section>
          <Section title="Compliance">
            <div className="text-xs text-gray-700">{compliance?.content_planning ? 'Compliance review included' : 'No compliance issues reported'}</div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorRubricDrawer;


