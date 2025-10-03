import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';

const ScheduleCallModal = ({ open, onClose, customer, onConfirm }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setNotes(`Call with ${customer?.name || 'customer'} about account health and next steps.`);
    }
  }, [open, customer]);

  if (!open) return null;

  const confirm = () => {
    const payload = { when: `${date} ${time}`.trim(), notes, customer };
    onConfirm && onConfirm(payload);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Schedule Call</h3>
          </div>
          <button onClick={()=>onClose&&onClose()} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={5} value={notes} onChange={e=>setNotes(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={()=>onClose&&onClose()} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button onClick={confirm} className="px-4 py-2 bg-green-600 text-white rounded flex items-center">
            <Check className="w-4 h-4 mr-2" />Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCallModal;


