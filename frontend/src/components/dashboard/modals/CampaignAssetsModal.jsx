import React from 'react';
import { X, FileText, Image, Video, Mail } from 'lucide-react';

const CampaignAssetsModal = ({ isOpen, onClose, assets = {} }) => {
  if (!isOpen) return null;

  const { copy = [], images = [], videos = [], emails = [] } = assets || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Assets</h2>
            <p className="text-sm text-gray-600">All associated creative and copy</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Copy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{copy.length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <Image className="w-4 h-4" />
                <span className="text-sm font-medium">Images</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{images.length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">Videos</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{videos.length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Emails</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{emails.length}</div>
            </div>
          </div>

          {[{label:'Copy', items:copy, icon:FileText}, {label:'Images', items:images, icon:Image}, {label:'Videos', items:videos, icon:Video}, {label:'Emails', items:emails, icon:Mail}].map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center space-x-2 mb-2">
                <section.icon className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">{section.label}</h3>
                <span className="text-xs text-gray-500">({section.items.length})</span>
              </div>
              {section.items.length === 0 ? (
                <div className="text-sm text-gray-500">No {section.label.toLowerCase()} added yet.</div>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {section.items.map((item, i) => (
                    <li key={i} className="p-2 border border-gray-200 rounded">
                      {typeof item === 'string' ? item : (item?.name || item?.title || 'Untitled')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignAssetsModal;


