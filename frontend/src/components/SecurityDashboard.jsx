import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Database,
  Globe,
  Settings
} from 'lucide-react';

const SecurityDashboard = ({ isOpen, onClose, userRole = 'admin' }) => {
  const [securityMetrics, setSecurityMetrics] = useState({
    securityScore: 0,
    blockedRequests: 0,
    injectionAttempts: 0,
    piiDetections: 0,
    activeThreats: 0,
    lastIncident: null,
    systemHealth: 'good'
  });

  const [recentIncidents, setRecentIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching security data
    const fetchSecurityData = async () => {
      setIsLoading(true);
      
      // Mock security data - replace with real API calls
      setTimeout(() => {
        setSecurityMetrics({
          securityScore: 87,
          blockedRequests: 23,
          injectionAttempts: 3,
          piiDetections: 7,
          activeThreats: 1,
          lastIncident: new Date().toISOString(),
          systemHealth: 'good'
        });

        setRecentIncidents([
          {
            id: 1,
            type: 'injection_attempt',
            severity: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            description: 'Prompt injection attempt detected from IP 192.168.1.100',
            status: 'blocked'
          },
          {
            id: 2,
            type: 'pii_detection',
            severity: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            description: 'PII detected in user input: email address',
            status: 'redacted'
          },
          {
            id: 3,
            type: 'rate_limit',
            severity: 'low',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            description: 'Rate limit exceeded for user session',
            status: 'throttled'
          }
        ]);
        
        setIsLoading(false);
      }, 1000);
    };

    if (isOpen) {
      fetchSecurityData();
    }
  }, [isOpen]);

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'blocked': return <Shield className="w-4 h-4 text-red-600" />;
      case 'redacted': return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'throttled': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security Dashboard</h2>
                <p className="text-sm text-gray-500">Real-time security monitoring</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading security data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
                    <p className="text-sm text-gray-600">Overall system security rating</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getSecurityScoreColor(securityMetrics.securityScore)}`}>
                      {securityMetrics.securityScore}
                    </div>
                    <div className="text-sm text-gray-500">/ 100</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${securityMetrics.securityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Blocked Requests</p>
                      <p className="text-2xl font-bold text-red-600">{securityMetrics.blockedRequests}</p>
                    </div>
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Injection Attempts</p>
                      <p className="text-2xl font-bold text-orange-600">{securityMetrics.injectionAttempts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">PII Detections</p>
                      <p className="text-2xl font-bold text-yellow-600">{securityMetrics.piiDetections}</p>
                    </div>
                    <Eye className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Threats</p>
                      <p className="text-2xl font-bold text-red-600">{securityMetrics.activeThreats}</p>
                    </div>
                    <Activity className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Security Incidents</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(incident.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{incident.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(incident.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">View Security Logs</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">User Access Review</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Security Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
