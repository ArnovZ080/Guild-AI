import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Video } from 'lucide-react';

const categories = {
  "Project Management": [
    { key: "asana", label: "Asana", icon: "📋" },
    { key: "linear", label: "Linear", icon: "🔧" },
    { key: "monday", label: "Monday.com", icon: "📅" },
    { key: "notion", label: "Notion", icon: "📝" },
  ],
  "Payments & Finance": [
    { key: "stripe", label: "Stripe", icon: "💳" },
    { key: "square", label: "Square", icon: "💰" },
    { key: "paypal", label: "PayPal", icon: "🅿️" },
    { key: "xero", label: "Xero", icon: "📊" },
    { key: "quickbooks", label: "QuickBooks", icon: "📈" },
  ],
  "Marketing & Engagement": [
    { key: "intercom", label: "Intercom", icon: "💬" },
    { key: "fireflies", label: "Fireflies", icon: "🎙️" },
    { key: "canva", label: "Canva", icon: "🎨" },
    { key: "cloudinary", label: "Cloudinary", icon: "☁️" },
    { key: "hubspot", label: "HubSpot", icon: "🎯" },
    { key: "facebook", label: "Facebook", icon: "📘" },
    { key: "instagram", label: "Instagram", icon: "📷" },
    { key: "linkedin", label: "LinkedIn", icon: "💼" },
    { key: "whatsapp", label: "WhatsApp Business", icon: "💬" },
    { key: "messenger", label: "Facebook Messenger", icon: "💭" },
  ],
  "Dev & Deployment": [
    { key: "vercel", label: "Vercel", icon: "⚡" },
    { key: "netlify", label: "Netlify", icon: "🌐" },
    { key: "sentry", label: "Sentry", icon: "🐛" },
    { key: "github", label: "GitHub", icon: "🐙" },
  ],
  "Automation Platforms": [
    { key: "zapier", label: "Zapier", icon: "⚡" },
    { key: "workato", label: "Workato", icon: "🔗" },
    { key: "n8n", label: "n8n", icon: "🔄" },
    { key: "make", label: "Make (Integromat)", icon: "🛠️" },
  ],
  "Storage & Files": [
    { key: "googledrive", label: "Google Drive", icon: "📁" },
    { key: "onedrive", label: "OneDrive", icon: "☁️" },
    { key: "dropbox", label: "Dropbox", icon: "📦" },
    { key: "box", label: "Box", icon: "📋" },
  ],
};

const IntegrationsStep = ({ onNext, onScreenRecord }) => {
  const [selected, setSelected] = useState({});
  const [activeTab, setActiveTab] = useState(Object.keys(categories)[0]);
  const [showCustom, setShowCustom] = useState(false);
  const [customService, setCustomService] = useState('');

  const toggleIntegration = (key) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    const chosen = Object.keys(selected).filter(k => selected[k]);
    onNext({ selectedSoftware: chosen });
  };

  const handleAddCustom = () => {
    if (customService.trim()) {
      setSelected(prev => ({ ...prev, [customService.toLowerCase()]: true }));
      setCustomService('');
      setShowCustom(false);
    }
  };

  const selectedCount = Object.keys(selected).filter(k => selected[k]).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">🔌 Connect Your Tools</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect the tools you already use so Guild can work seamlessly with your existing workflow. 
          Don't worry if you don't see something — we can learn new tools by watching you use them.
        </p>
      </motion.div>

      {/* Selected count */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
        >
          <p className="text-blue-800 font-medium">
            {selectedCount} tool{selectedCount !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {Object.keys(categories).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of integrations */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {categories[activeTab].map(service => (
          <motion.div
            key={service.key}
            onClick={() => toggleIntegration(service.key)}
            className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all duration-200 ${
              selected[service.key]
                ? "bg-blue-50 border-blue-500 text-blue-900"
                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-25"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-2">{service.icon}</div>
            <div className="text-sm font-medium">{service.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom service input */}
      {showCustom ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              placeholder="Enter service name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customService.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setShowCustom(true)}
            className="text-sm text-gray-500 hover:text-blue-600 underline flex items-center space-x-1 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Don't see your tool? Add it here</span>
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <button
          onClick={onScreenRecord}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Video className="w-4 h-4" />
          <span>🎥 Record Workflow Instead</span>
        </button>
        
        <motion.button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-4 h-4" />
          <span>Continue</span>
        </motion.button>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          You can always add or remove integrations later in your settings
        </p>
      </div>
    </div>
  );
};

export default IntegrationsStep;
