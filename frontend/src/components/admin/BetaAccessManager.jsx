import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Users, Mail, CheckCircle, XCircle, Plus, Trash2, Download } from 'lucide-react'
import apiService from '../../services/api'

function BetaAccessManager() {
  const [waitlist, setWaitlist] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newBetaEmail, setNewBetaEmail] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [waitlistRes, statsRes] = await Promise.all([
        apiService.get('/waitlist/list?limit=1000'),
        apiService.get('/waitlist/stats')
      ])
      
      setWaitlist(waitlistRes.data.entries || [])
      setStats(statsRes.data)
    } catch (err) {
      console.error('Failed to load waitlist data:', err)
    } finally {
      setLoading(false)
    }
  }

  const grantBetaAccess = async (email) => {
    try {
      setActionLoading(true)
      await apiService.post('/waitlist/grant-beta-access', { email })
      setMessage({ type: 'success', text: `Beta access granted to ${email}` })
      await loadData()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to grant access' })
    } finally {
      setActionLoading(false)
    }
  }

  const addBetaTester = async (e) => {
    e.preventDefault()
    if (!newBetaEmail) return

    try {
      setActionLoading(true)
      await apiService.post('/waitlist/grant-beta-access', { 
        email: newBetaEmail,
        notes: 'Manually added by admin'
      })
      setMessage({ type: 'success', text: `Beta access granted to ${newBetaEmail}` })
      setNewBetaEmail('')
      await loadData()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add beta tester' })
    } finally {
      setActionLoading(false)
    }
  }

  const exportWaitlist = () => {
    const csv = [
      ['Email', 'Name', 'Company', 'Role', 'How Heard', 'Use Case', 'Status', 'Created At'].join(','),
      ...waitlist.map(entry => [
        entry.email,
        entry.full_name || '',
        entry.company || '',
        entry.role || '',
        entry.how_heard || '',
        `"${(entry.use_case || '').replace(/"/g, '""')}"`,
        entry.status,
        entry.created_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guild-ai-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Waiting List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.waiting_list.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.waiting_list.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Invited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.waiting_list.invited}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Beta Testers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.beta_testers.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Beta Tester Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Grant Beta Access
          </CardTitle>
          <CardDescription>
            Add an email to grant immediate beta access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addBetaTester} className="flex gap-3">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newBetaEmail}
              onChange={(e) => setNewBetaEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={actionLoading || !newBetaEmail}>
              {actionLoading ? 'Adding...' : 'Grant Access'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Messages */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Waiting List Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Waiting List
              </CardTitle>
              <CardDescription>
                Manage waiting list entries and grant beta access
              </CardDescription>
            </div>
            <Button onClick={exportWaitlist} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Company</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-gray-500">
                      No one on the waiting list yet
                    </td>
                  </tr>
                ) : (
                  waitlist.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{entry.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{entry.full_name || '-'}</td>
                      <td className="p-3 text-sm">{entry.company || '-'}</td>
                      <td className="p-3 text-sm">{entry.role || '-'}</td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            entry.status === 'invited' ? 'default' : 
                            entry.status === 'converted' ? 'success' : 
                            'secondary'
                          }
                        >
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        {entry.status === 'pending' && (
                          <Button
                            onClick={() => grantBetaAccess(entry.email)}
                            disabled={actionLoading}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Grant Access
                          </Button>
                        )}
                        {entry.status === 'invited' && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Access Granted
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BetaAccessManager

