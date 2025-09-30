import React, { useEffect, useState } from 'react';
import { X, Mail, Clock } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const ContactDrawer = ({ open, onClose, email }) => {
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !email) return;
      const [p, t, s] = await Promise.all([
        api.getContactProfile(email),
        api.getContactTimeline(email),
        api.getPersonalizationSuggestions(email)
      ]);
      setProfile(p?.data || null);
      setTimeline(t?.data?.events || []);
      setSuggestions(s?.data?.suggestions || []);
    };
    load();
  }, [open, email]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Contact</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 text-sm overflow-y-auto">
          {profile && (
            <div className="border rounded p-3">
              <div className="font-medium">{profile.name} <span className="text-gray-500">({profile.email})</span></div>
              <div className="text-xs text-gray-600">{profile.role} @ {profile.company} • {profile.location}</div>
              <div className="text-xs text-gray-600 mt-1">Segments: {(profile.segments||[]).join(', ')}</div>
              <div className="text-xs text-gray-600 mt-1">Engagement Score: {(Math.round((profile.engagement_score||0)*100))}%</div>
            </div>
          )}

          <div className="border rounded p-3">
            <div className="font-medium mb-2">Timeline</div>
            <div className="space-y-2">
              {timeline.map((e, idx) => (
                <div key={idx} className="flex items-start text-xs">
                  <Clock className="w-3 h-3 mr-2 mt-0.5 text-gray-500"/>
                  <div>
                    <div className="text-gray-800">{new Date(e.ts).toLocaleString()} — {e.type.replace('_',' ')} {e.subject?`• ${e.subject}`:''}</div>
                    {e.details && <div className="text-gray-600">{e.details}</div>}
                  </div>
                </div>
              ))}
              {timeline.length===0 && <div className="text-xs text-gray-600">No recent activity.</div>}
            </div>
          </div>

          <div className="border rounded p-3">
            <div className="font-medium mb-2">Personalization Hints</div>
            <ul className="list-disc pl-5 text-xs text-gray-700">
              {suggestions.map(s => (
                <li key={s.id}><span className="font-medium capitalize">{s.field}</span>: {s.text} — Why: {s.why}</li>
              ))}
              {suggestions.length===0 && <li className="text-gray-600">No hints available.</li>}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ContactDrawer;


