/**
 * Hybrid Storage Status Component
 * 
 * Shows the current sync status of hybrid storage to users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Cloud,
  HardDrive
} from 'lucide-react';
import hybridStorageService from '../services/HybridStorageService.js';

const HybridStorageStatus = ({ className = '' }) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    syncInProgress: false,
    pendingSyncCount: 0,
    lastSyncAttempt: null
  });

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(hybridStorageService.getSyncStatus());
    };

    // Update status immediately
    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    // Update on online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    if (syncStatus.syncInProgress) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    if (syncStatus.pendingSyncCount > 0) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline - Changes saved locally';
    }
    
    if (syncStatus.syncInProgress) {
      return 'Syncing with cloud...';
    }
    
    if (syncStatus.pendingSyncCount > 0) {
      return `${syncStatus.pendingSyncCount} items pending sync`;
    }
    
    return 'All changes synced';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    
    if (syncStatus.syncInProgress) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    
    if (syncStatus.pendingSyncCount > 0) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      return;
    }
    
    try {
      await hybridStorageService.forceSync();
      setSyncStatus(hybridStorageService.getSyncStatus());
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()} ${className}`}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {syncStatus.isOnline && syncStatus.pendingSyncCount > 0 && (
        <button
          onClick={handleForceSync}
          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          Sync Now
        </button>
      )}
      
      <div className="flex items-center gap-1 ml-2">
        {syncStatus.isOnline ? (
          <Cloud className="w-3 h-3" title="Cloud storage available" />
        ) : (
          <HardDrive className="w-3 h-3" title="Local storage only" />
        )}
      </div>
    </motion.div>
  );
};

export default HybridStorageStatus;
