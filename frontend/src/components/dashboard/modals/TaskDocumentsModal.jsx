import React, { useEffect, useState } from 'react';

export default function TaskDocumentsModal({ isOpen, onClose, seedDoc, onPreview, onDownload }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isOpen || !seedDoc) return;
      setIsLoading(true);
      setError(null);
      try {
        // Prefer workflow deliverables if available
        if (seedDoc.workflowId) {
          const res = await fetch(`/api/workflows/${encodeURIComponent(seedDoc.workflowId)}/deliverables`);
          if (res.ok) {
            const data = await res.json();
            if (!ignore) setItems(Array.isArray(data?.data) ? data.data : (data || []));
          }
        }
        // Fallback to listing documents in same data room
        if (!seedDoc.workflowId && seedDoc.dataRoomId) {
          const res = await fetch(`/api/data-rooms/${encodeURIComponent(seedDoc.dataRoomId)}/documents`);
          if (res.ok) {
            const dj = await res.json();
            const list = dj?.data?.documents || dj?.documents || [];
            if (!ignore) setItems(list);
          }
        }
        // Load evaluator results (Judge) for transparency
        try {
          const judgeRes = await fetch('/api/agents/judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign: { document_id: seedDoc.id, path: seedDoc.name } })
          });
          if (judgeRes.ok) {
            const judgeData = await judgeRes.json();
            if (!ignore) setAnalysis(judgeData);
          }
        } catch {}
        // Load workflow executions/activity logs if workflowId available
        if (seedDoc.workflowId) {
          try {
            const [coreRes, orchRes] = await Promise.all([
              fetch(`/api/workflows/${encodeURIComponent(seedDoc.workflowId)}/executions`).catch(() => null),
              fetch(`/api/agents/orchestrate/executions/${encodeURIComponent(seedDoc.workflowId)}`).catch(() => null),
            ]);
            let merged = [];
            if (coreRes && coreRes.ok) {
              const ex = await coreRes.json();
              if (Array.isArray(ex)) merged = merged.concat(ex);
            }
            if (orchRes && orchRes.ok) {
              const ox = await orchRes.json();
              if (Array.isArray(ox)) merged = merged.concat(ox);
            }
            // Sort by timestamp if present
            merged.sort((a, b) => {
              const ta = Date.parse(a.ts || a.timestamp || a.created_at || 0) || 0;
              const tb = Date.parse(b.ts || b.timestamp || b.created_at || 0) || 0;
              return tb - ta;
            });
            if (!ignore) setExecutions(merged);
          } catch {}
        }
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load task documents');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [isOpen, seedDoc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Documents for Task</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
          </div>
          {isLoading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((it) => (
                    <div key={it.id || it.file_path || it.path} className="border rounded-lg p-4">
                      <div className="font-medium text-gray-900 truncate" title={it.title || it.path}>{it.title || it.path?.split('/')?.pop() || 'Untitled'}</div>
                      <div className="text-sm text-gray-500 mb-2">{it.type || it.mime || ''}</div>
                      <div className="flex gap-2">
                        <button onClick={() => onPreview({ name: it.title || it.path, url: it.url || it.file_path, mime: it.mime })} className="px-3 py-1 rounded bg-blue-500 text-white text-sm">Preview</button>
                        <button onClick={() => onDownload({ id: it.id || it.file_path, name: it.title || it.path }, 'original')} className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm">Download</button>
                      </div>
                    </div>
                  ))}
                  {!items.length && <div className="text-gray-600">No documents found for this task.</div>}
                </div>

                {analysis && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">AI Analysis (Judge)</h3>
                    {analysis.scores && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-sm">
                        {Object.entries(analysis.scores).map(([k,v]) => (
                          <div key={k} className="bg-white rounded p-2 flex items-center justify-between"><span className="capitalize text-gray-600">{k}</span><span className="font-semibold">{v}</span></div>
                        ))}
                      </div>
                    )}
                    {Array.isArray(analysis.feedback) && analysis.feedback.length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-gray-800">
                        {analysis.feedback.map((f, idx) => (<li key={idx}>{f}</li>))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Workflow Activity Log</h4>
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {executions.map((ex) => (
                      <div key={ex.id || ex.execution_id} className="bg-white rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{ex.agent_name || ex.agent_type || 'Agent'}</span>
                          <span className="text-gray-500">{ex.status || ''}</span>
                        </div>
                        {ex.result && <div className="text-gray-600 mt-1 truncate" title={JSON.stringify(ex.result)}>{typeof ex.result === 'string' ? ex.result : JSON.stringify(ex.result)}</div>}
                      </div>
                    ))}
                    {!executions.length && <div className="text-gray-500 text-sm">No activity logs available.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


