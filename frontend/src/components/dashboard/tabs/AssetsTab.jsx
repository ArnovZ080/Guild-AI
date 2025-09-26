import React from 'react';
import { Image, Plus } from 'lucide-react';

const AssetsTab = ({ assets }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Image className="w-5 h-5 text-green-500 mr-2" />
            Creative Assets Library
          </h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Upload Asset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(assets || []).map((asset, index) => (
            <div key={asset.asset_id || index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">{asset.name}</p>
                <p className="text-xs text-gray-500">{asset.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetsTab;
