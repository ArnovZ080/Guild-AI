import React from 'react';
import { Bell, Settings, UserCircle, Search } from 'lucide-react';

const TopHeader = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="h-14 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Guild-AI</h2>
          <span className="text-sm text-gray-500 hidden sm:inline">Productive AI workspace</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;


