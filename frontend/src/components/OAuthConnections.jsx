import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

const providerInfo = {
  gdrive: {
    name: 'Google Drive',
    icon: '📁',
    color: 'bg-blue-500',
    description: 'Access your Google Drive files and folders'
  },
  notion: {
    name: 'Notion',
    icon: '📝',
    color: 'bg-gray-800',
    description: 'Connect to your Notion workspace and databases'
  },
  onedrive: {
    name: 'OneDrive',
    icon: '☁️',
    color: 'bg-blue-600',
    description: 'Sync with your Microsoft OneDrive storage'
  },
  dropbox: {
    name: 'Dropbox',
    icon: '📦',
    color: 'bg-blue-700',
    description: 'Connect to your Dropbox file storage'
  }
}

export function OAuthConnections() {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState({})

  // Mock API calls - replace with actual API integration
  const fetchCredentials = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockCredentials = [
        {
          id: 1,
          provider: 'gdrive',
          account_id: 'user@gmail.com',
          expires_at: '2024-12-31T23:59:59Z',
          scopes: ['drive.readonly'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          provider: 'notion',
          account_id: 'workspace_123',
          expires_at: null,
          scopes: ['read'],
          created_at: '2024-01-15T00:00:00Z'
        }
      ]
      setCredentials(mockCredentials)
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (provider) => {
    setConnecting({ ...connecting, [provider]: true })
    try {
      // Simulate OAuth flow initiation
      const authUrl = `/api/oauth/${provider}/start`
      // In a real app, this would redirect to the OAuth provider
      console.log(`Would redirect to: ${authUrl}`)

      // Simulate successful connection after delay
      setTimeout(() => {
        const newCredential = {
          id: Date.now(),
          provider,
          account_id: `user_${Date.now()}`,
          expires_at: provider === 'notion' ? null : '2024-12-31T23:59:59Z',
          scopes: ['read'],
          created_at: new Date().toISOString()
        }
        setCredentials([...credentials, newCredential])
        setConnecting({ ...connecting, [provider]: false })
      }, 2000)
    } catch (error) {
      console.error('Failed to connect:', error)
      setConnecting({ ...connecting, [provider]: false })
    }
  }

  const handleDisconnect = async (credentialId) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      try {
        setCredentials(credentials.filter(cred => cred.id !== credentialId))
      } catch (error) {
        console.error('Failed to disconnect:', error)
      }
    }
  }

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getConnectionStatus = (credential) => {
    if (isExpired(credential.expires_at)) {
      return { status: 'expired', color: 'destructive', icon: AlertCircle }
    }
    return { status: 'connected', color: 'default', icon: CheckCircle }
  }

  useEffect(() => {
    fetchCredentials()
  }, [])

  const availableProviders = Object.keys(providerInfo)
  const connectedProviders = credentials.map(cred => cred.provider)
  const unconnectedProviders = availableProviders.filter(
    provider => !connectedProviders.includes(provider)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OAuth Connections</h2>
          <p className="text-muted-foreground">
            Manage your connected accounts and authentication
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchCredentials}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Connected Accounts */}
      {credentials.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Accounts</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((credential) => {
              const provider = providerInfo[credential.provider]
              const status = getConnectionStatus(credential)
              const StatusIcon = status.icon

              return (
                <Card key={credential.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center text-white text-lg`}>
                          {provider.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription>{credential.account_id}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={status.color} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <div>Connected: {formatDate(credential.created_at)}</div>
                        {credential.expires_at && (
                          <div>Expires: {formatDate(credential.expires_at)}</div>
                        )}
                        <div>Scopes: {credential.scopes.join(', ')}</div>
                      </div>

                      <div className="flex gap-2">
                        {status.status === 'expired' && (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(credential.provider)}
                            disabled={connecting[credential.provider]}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Reconnect
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(credential.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Connections */}
      {unconnectedProviders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Connections</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {unconnectedProviders.map((providerId) => {
              const provider = providerInfo[providerId]
              const isConnecting = connecting[providerId]

              return (
                <Card key={providerId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center text-white text-lg`}>
                        {provider.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleConnect(providerId)}
                      disabled={isConnecting}
                      className="w-full flex items-center gap-2"
                    >
                      {isConnecting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {isConnecting ? 'Connecting...' : `Connect ${provider.name}`}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  )
}
