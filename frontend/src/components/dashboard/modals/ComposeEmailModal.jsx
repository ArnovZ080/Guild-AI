import React, { useState, useEffect } from 'react';
import { X, Send, Shield, Brain, Image, Upload, Sparkles, Palette } from 'lucide-react';
import { ContentIntelligenceAPIService, useCreativeAssets } from '../../../services/contentIntelligenceApi';
import ChatEmailComposeAssistantModal from './ChatEmailComposeAssistantModal.jsx';

const ComposeEmailModal = ({ open, onClose, defaultSegmentId, onSent, defaultTo }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState(defaultSegmentId || 'all');
  const [attachments, setAttachments] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [enrichPersonalization, setEnrichPersonalization] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [compliance, setCompliance] = useState(null);
  const [checking, setChecking] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [customizeBrand, setCustomizeBrand] = useState(false);
  const api = new ContentIntelligenceAPIService();
  const { assets } = useCreativeAssets();

  useEffect(() => {
    if (open) {
      try {
        const onboardingData = localStorage.getItem('guild_onboarding_data');
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          setBrandData({
            voice: data.brandVoice || data.answers?.[11] || 'Professional',
            colors: data.brandColours || data.answers?.[12] || '#6366F1,#EC4899',
            fonts: data.brandFonts || 'Inter, sans-serif',
            logo: data.brandLogo || null
          });
        }
        if (defaultTo) {
          setTo(defaultTo);
        }
      } catch (e) {
        console.log('No brand data found');
      }
    }
  }, [open]);

  if (!open) return null;

  const send = async () => {
    setSending(true);
    try {
      const res = await api.sendEmail({ to, cc, bcc, subject, body, segment, attachments, assets: selectedAssets, brand: customizeBrand? brandData : null });
      onSent && onSent(res);
      onClose();
    } finally {
      setSending(false);
    }
  };

  const checkCompliance = async () => {
    setChecking(true);
    try {
      const result = await api.getEmailCompliance({ to, cc, bcc, subject, body });
      setCompliance(result?.data || { pass: true, issues: [] });
    } finally {
      setChecking(false);
    }
  };

  const enrichWithPersonalization = async () => {
    if (!to.trim()) {
      alert('Please enter recipient email first');
      return;
    }
    setEnriching(true);
    try {
      const result = await api.request('/content/enrich-personalization', {
        method: 'POST',
        body: JSON.stringify({ email: to, subject, body, brand: brandData })
      });
      if (result?.data) {
        setSubject(result.data.subject || subject);
        setBody(result.data.body || body);
      }
    } finally {
      setEnriching(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
              <p className="text-sm text-gray-600">Send a personalized email</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
            <input value={segment} onChange={e=>setSegment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="segment id or 'all'" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
              <input value={to} onChange={e=>setTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
              <input value={cc} onChange={e=>setCc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
              <input value={bcc} onChange={e=>setBcc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="optional" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
            <div className="mt-1 text-xs text-gray-500">Tip: Keep paragraphs short. Use one clear CTA.</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media & Assets</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={()=>setShowAssetPicker(!showAssetPicker)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                <Image className="w-4 h-4 mr-2"/>Asset Library
              </button>
              <label className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center cursor-pointer">
                <Upload className="w-4 h-4 mr-2"/>Upload File
                <input type="file" multiple onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
              </label>
              <button className="px-3 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors text-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 mr-2"/>AI Generate Image
              </button>
            </div>
            {showAssetPicker && (
              <div className="mt-3 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                {(assets?.items || assets?.assets || assets || []).slice(0,12).map(a => (
                  <div key={a.asset_id||a.id} className={`border rounded p-2 cursor-pointer ${selectedAssets.includes(a.asset_id||a.id)?'border-purple-500 bg-purple-50':'border-gray-200'}`} onClick={()=>setSelectedAssets(prev=>prev.includes(a.asset_id||a.id)?prev.filter(id=>id!==(a.asset_id||a.id)):[...prev, a.asset_id||a.id])}>
                    <div className="text-xs truncate">{a.name}</div>
                  </div>
                ))}
              </div>
            )}
            {attachments.length>0 && (
              <div className="mt-2 text-xs text-gray-700">Attachments: {attachments.map(f=>f.name).join(', ')}</div>
            )}
            {selectedAssets.length>0 && (
              <div className="mt-2 text-xs text-gray-700">{selectedAssets.length} asset(s) selected from library</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Styling</label>
            {!customizeBrand ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Using Onboarding Brand Data</div>
                    <div className="text-xs text-gray-600 mt-1">Voice: {brandData?.voice} • Colors: {brandData?.colors}</div>
                  </div>
                  <button onClick={()=>setCustomizeBrand(true)} className="text-xs text-purple-600 hover:text-purple-700 font-medium">Customize</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Brand Voice</label>
                  <input value={brandData?.voice||''} onChange={e=>setBrandData(p=>({...p,voice:e.target.value}))} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Brand Colors</label>
                  <input value={brandData?.colors||''} onChange={e=>setBrandData(p=>({...p,colors:e.target.value}))} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" placeholder="#6366F1,#EC4899" />
                </div>
              </div>
            )}
          </div>

          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Enrich with Personalization Data</div>
                <div className="text-xs text-gray-600 mt-1">AI will rewrite email using contact enrichment (name, company, role, recent activity)</div>
              </div>
              <button onClick={enrichWithPersonalization} disabled={enriching || !to.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50">
                {enriching?'Enriching...':'Enrich Now'}
              </button>
            </div>
          </div>

          {compliance && (
            <div className={`rounded-lg border p-4 ${compliance.pass?'border-green-200 bg-green-50':'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-700"/>
                <div className="text-sm font-semibold">Send Readiness: {compliance.pass ? 'Pass ✓' : 'Needs Attention'}</div>
              </div>
              {(compliance.issues||[]).length>0 && (
                <ul className="mt-2 space-y-1 text-xs text-gray-700">
                  {compliance.issues.map(issue => (
                    <li key={issue.id} className="flex items-start">
                      <span className="font-medium capitalize mr-1">{issue.label}:</span>
                      <span>{issue.why}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button onClick={()=>setShowAssistant(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            Let an Agent write your email
          </button>
          <div className="flex items-center gap-3">
            <button onClick={checkCompliance} disabled={checking} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
              {checking?'Checking...':'Check Compliance'}
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
              Cancel
            </button>
            <button onClick={send} disabled={sending || !subject.trim() || !body.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
              {sending?'Sending...':'Send Email'}
            </button>
          </div>
        </div>
      </div>
      <ChatEmailComposeAssistantModal
        open={showAssistant}
        onClose={()=>setShowAssistant(false)}
        onApply={async (draft)=>{
          try {
            // Judge Layer gate generated draft before applying
            let profile = null;
            try {
              const res = await fetch('/api/profile');
              const json = await res.json();
              profile = json?.data || null;
            } catch {}
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';
            const payload = {
              brief: {
                objective: 'Compose email draft',
                goals: { clarity: 'high', brand_alignment: 'enforce' },
                audience: to ? { description: to } : undefined,
                topic: draft.subject || subject || 'Email draft'
              },
              platforms: ['email'],
              brand: profile ? { voice: profile.brand_voice, colors: profile.brand_colors, guidelines: profile.guidelines } : undefined
            };
            const resp = await fetch(`${apiBase}/content/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const judge = await resp.json();
            if (judge?.data?.approved === false) {
              const score = judge?.data?.overall_score;
              alert(`Draft failed quality gate${typeof score==='number'?` (score: ${Math.round(score*100)/100})`:''}. Please refine with the assistant and try again.`);
              return;
            }
            setSubject(draft.subject||'');
            setBody(draft.body||'');
            setShowAssistant(false);
          } catch {
            alert('Could not validate draft quality. Please try again.');
          }
        }}
        context={{ to, segment }}
      />
    </div>
  );
};

export default ComposeEmailModal;
