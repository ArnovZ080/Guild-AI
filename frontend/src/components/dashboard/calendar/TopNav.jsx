import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Brain,
  Target,
  Bell,
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const TopNav = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  focusMode,
  onToggleFocusMode,
  onOptimizeWeek,
  onAddEvent,
  onOpenPAChat
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-[1920px] mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Personal Operating System</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenPAChat}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Chat with PA Agent</span>
            </button>

            <button 
              onClick={onOptimizeWeek}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
            >
              <Brain className="w-4 h-4" />
              <span className="font-medium">Optimize My Week</span>
            </button>

            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Sync</span>
            </button>

            <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>Google Calendar</span>
            </button>
          </div>
        </div>

        {/* Bottom Row - Controls */}
        <div className="flex items-center justify-between">
          {/* View Mode Toggles */}
          <div className="flex items-center space-x-2">
            {['month', 'week', 'day'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}

            {/* Focus Mode Toggle */}
            <button
              onClick={onToggleFocusMode}
              className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                focusMode
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Focus Mode
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="meeting">Meetings</option>
                <option value="financial">Financial</option>
                <option value="goal">Goals</option>
                <option value="personal">Personal</option>
                <option value="reminder">Reminders</option>
              </select>
            </div>

            {/* Add Event Button */}
            <button
              onClick={onAddEvent}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;

