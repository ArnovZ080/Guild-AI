import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Building, Tag, Globe } from 'lucide-react';

const empty = {
  name: '',
  email: '',
  phone: '',
  company: '',
  segment: '',
  location: '',
  notes: ''
};

const CreateCustomerModal = ({ open, onClose, onCreate, segments = [] }) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const set = (k,v) => setForm(prev => ({ ...prev, [k]: v }));
  const canSave = form.name.trim() && form.email.trim();

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // For now, return the new record upward; backend/agent can persist
      const customer = {
        customer_id: `cust_${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        customer_segment: (form.segment || 'new_customers').toLowerCase().replace(/\s+/g,'_'),
        lifecycle_stage: 'lead',
        company: form.company || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
        health_score: 60,
        engagement_score: 50,
        support_tickets: 0,
        total_orders: 0,
        total_spent: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        tags: [form.segment].filter(Boolean)
      };
      onCreate && onCreate(customer);
      onClose && onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Create Contact</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e=>set('name', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={form.email} onChange={e=>set('email', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded" placeholder="email@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={form.phone} onChange={e=>set('phone', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded" placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={form.company} onChange={e=>set('company', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded" placeholder="Company Inc." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
              {Array.isArray(segments) && segments.length > 0 ? (
                <select value={form.segment} onChange={e=>set('segment', e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option value="">No segment</option>
                  {segments.map(seg => (
                    <option key={seg.segment_id || seg.name} value={seg.name}>{seg.name}</option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={form.segment} onChange={e=>set('segment', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded" placeholder="VIP / Enterprise / New Customers" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={form.location} onChange={e=>set('location', e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded" placeholder="City, Country" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e=>set('notes', e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" placeholder="Context for future communication..." />
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded mr-2">Cancel</button>
          <button disabled={!canSave || saving} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving? 'Saving...' : 'Create Contact'}</button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;


