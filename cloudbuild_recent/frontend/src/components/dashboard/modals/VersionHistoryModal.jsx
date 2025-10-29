import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, User, ArrowLeft, ArrowRight, RotateCcw, GitBranch, Eye } from 'lucide-react';

const VersionHistoryModal = ({ content, onClose, onRestoreVersion }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [versionA, setVersionA] = useState(null);
  const [versionB, setVersionB] = useState(null);

  // Mock version history data (in real app, this would come from API)
  useEffect(() => {
    if (content) {
      // Generate mock version history
      const mockVersions = [
        {
          id: 'v1',
          version: '1.0',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'AI Agent',
          changes: ['Initial creation'],
          status: 'created',
          content_snapshot: {
            content_preview: content.content_preview,
            platform: content.platform,
            content_type: content.content_type,
            theme: content.theme,
            caption: content.caption || '',
            scheduled_date: content.scheduled_date,
            priority: content.priority
          }
        },
        {
          id: 'v2',
          version: '1.1',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'You',
          changes: ['Updated caption', 'Changed priority to high'],
          status: 'modified',
          content_snapshot: {
            content_preview: content.content_preview,
            platform: content.platform,
            content_type: content.content_type,
            theme: content.theme,
            caption: content.caption ? content.caption + ' (Updated)' : 'Updated caption',
            scheduled_date: content.scheduled_date,
            priority: 'high'
          }
        },
        {
          id: 'v3',
          version: '1.2',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          author: 'AI Agent',
          changes: ['Optimized for engagement', 'Added hashtags'],
          status: 'optimized',
          content_snapshot: {
            content_preview: content.content_preview,
            platform: content.platform,
            content_type: content.content_type,
            theme: content.theme,
            caption: content.caption ? content.caption + ' #optimized #engagement' : 'Caption with hashtags',
            scheduled_date: content.scheduled_date,
            priority: 'high'
          }
        }
      ];
      setVersions(mockVersions);
      setSelectedVersion(mockVersions[0]);
    }
  }, [content]);

  const handleRestoreVersion = (version) => {
    if (onRestoreVersion) {
      onRestoreVersion(version);
    }
    onClose();
  };

  const handleCompareVersions = () => {
    if (versionA && versionB) {
      setCompareMode(true);
    }
  };

  const getChangeTypeIcon = (status) => {
    switch (status) {
      case 'created': return '🆕';
      case 'modified': return '✏️';
      case 'optimized': return '⚡';
      case 'approved': return '✅';
      case 'published': return '🚀';
      default: return '📝';
    }
  };

  const getChangeTypeColor = (status) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      case 'optimized': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderVersionComparison = () => {
    if (!versionA || !versionB) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Version Comparison</h3>
          <button
            onClick={() => setCompareMode(false)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close Comparison
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Version A */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Version {versionA.version}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(versionA.status)}`}>
                {getChangeTypeIcon(versionA.status)} {versionA.status}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Author:</strong> {versionA.author}</div>
              <div><strong>Date:</strong> {new Date(versionA.timestamp).toLocaleString()}</div>
              <div><strong>Changes:</strong> {versionA.changes.join(', ')}</div>
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <div><strong>Caption:</strong></div>
                <div className="text-gray-700 mt-1">{versionA.content_snapshot.caption}</div>
              </div>
            </div>
          </div>

          {/* Version B */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Version {versionB.version}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(versionB.status)}`}>
                {getChangeTypeIcon(versionB.status)} {versionB.status}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Author:</strong> {versionB.author}</div>
              <div><strong>Date:</strong> {new Date(versionB.timestamp).toLocaleString()}</div>
              <div><strong>Changes:</strong> {versionB.changes.join(', ')}</div>
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <div><strong>Caption:</strong></div>
                <div className="text-gray-700 mt-1">{versionB.content_snapshot.caption}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-600">
                {content.platform} • {content.content_type} • {versions.length} versions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {compareMode ? (
            renderVersionComparison()
          ) : (
            <div className="space-y-6">
              {/* Version List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Versions</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCompareVersions}
                      disabled={!versionA || !versionB}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1 inline" />
                      Compare Selected
                    </button>
                  </div>
                </div>

                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id ? 'border-purple-300 bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={versionA?.id === version.id || versionB?.id === version.id}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (!versionA) {
                                  setVersionA(version);
                                } else if (!versionB && version.id !== versionA.id) {
                                  setVersionB(version);
                                }
                              } else {
                                if (versionA?.id === version.id) {
                                  setVersionA(null);
                                }
                                if (versionB?.id === version.id) {
                                  setVersionB(null);
                                }
                              }
                            }}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getChangeTypeColor(version.status)}`}>
                            {getChangeTypeIcon(version.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">Version {version.version}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(version.status)}`}>
                              {version.status}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{version.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(version.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>Changes:</strong> {version.changes.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreVersion(version);
                          }}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors flex items-center"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version Details */}
              {selectedVersion && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Content Snapshot</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Platform:</strong> {selectedVersion.content_snapshot.platform}</div>
                        <div><strong>Type:</strong> {selectedVersion.content_snapshot.content_type}</div>
                        <div><strong>Theme:</strong> {selectedVersion.content_snapshot.theme}</div>
                        <div><strong>Priority:</strong> {selectedVersion.content_snapshot.priority}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Caption</h4>
                      <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">
                        {selectedVersion.content_snapshot.caption || 'No caption'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VersionHistoryModal;
