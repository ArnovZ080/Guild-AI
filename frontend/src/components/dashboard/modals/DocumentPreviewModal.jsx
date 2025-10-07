import React from 'react';

export default function DocumentPreviewModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null;
  const isIframePreview = canPreview(document);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 truncate" title={document.name}>{document.name || 'Preview'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
          </div>
          {isIframePreview ? (
            <iframe src={document.url} title="preview" className="w-full h-[70vh] border rounded" />
          ) : (
            <div className="text-gray-700">
              <p>Preview not available. {document.url ? 'Opening in new tab...' : 'No URL available.'}</p>
              {document.url && (
                <div className="mt-3">
                  <a href={document.url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-blue-500 text-white text-sm">Open</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function canPreview(doc) {
  if (!doc?.url) return false;
  const url = String(doc.url).toLowerCase();
  if (url.endsWith('.pdf')) return true;
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') || url.endsWith('.svg')) return true;
  return false;
}


