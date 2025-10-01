import React, { useState, useEffect } from 'react';
import { X, FileText, Bold, Italic, Underline, Type, Image, Upload } from 'lucide-react';

const EditTemplateModal = ({ open, onClose, template }) => {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || 'newsletter');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [colors, setColors] = useState('');
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [headerLevel, setHeaderLevel] = useState('body');

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
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-2">
                <select value={headerLevel} onChange={e=>setHeaderLevel(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs">
                  <option value="body">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100" title="Bold"><Bold className="w-4 h-4"/></button>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100" title="Italic"><Italic className="w-4 h-4"/></button>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100" title="Underline"><Underline className="w-4 h-4"/></button>
                <select value={fontSize} onChange={e=>setFontSize(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs">
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>
                <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs">
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier</option>
                  <option value="Inter, sans-serif">Inter</option>
                </select>
                <label className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer flex items-center text-xs">
                  <Image className="w-4 h-4 mr-1"/>Insert Image
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <textarea value={body} onChange={e=>setBody(e.target.value)} rows={12} className="w-full px-3 py-2 focus:outline-none text-sm resize-none" placeholder="Enter template content..." style={{ fontFamily, fontSize: `${fontSize}px` }} />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Import from provider: 
              <button className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">Mailchimp</button>
              <button className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">ConvertKit</button>
            </div>
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

