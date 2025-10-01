import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

const EditTemplateModal = ({ open, onClose, template }) => {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || 'newsletter');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [colors, setColors] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setType(template.type || 'newsletter');
    }
  }, [template]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Template</h2>
              <p className="text-sm text-gray-600">Customize template settings and branding</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="newsletter">Newsletter</option>
                <option value="promo">Promo</option>
                <option value="nurture">Nurture</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Subject Line</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Enter default subject..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Body</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="Enter template HTML or text..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Voice</label>
              <input value={brandVoice} onChange={e=>setBrandVoice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., Professional, Friendly" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
              <input value={colors} onChange={e=>setColors(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="#6366F1,#EC4899" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
            Cancel
          </button>
          <button onClick={()=>{ alert('Template saved'); onClose(); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTemplateModal;

