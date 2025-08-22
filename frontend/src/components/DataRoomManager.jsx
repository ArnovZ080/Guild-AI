import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, RefreshCw } from 'lucide-react'
import { DataRoomCard } from './DataRoomCard'

export function DataRoomManager() {
  const [dataRooms, setDataRooms] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDataRoom, setNewDataRoom] = useState({
    name: '',
    provider: '',
    config: {}
  })

  // Mock API calls - replace with actual API integration
  const fetchDataRooms = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockDataRooms = [
        {
          id: '1',
          name: 'Marketing Assets',
          provider: 'gdrive',
          config: { folder_id: 'abc123' },
          read_only: true,
          last_sync_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Project Documentation',
          provider: 'notion',
          config: { database_id: 'def456' },
          read_only: true,
          last_sync_at: null,
          created_at: '2024-01-10T00:00:00Z'
        }
      ]
      setDataRooms(mockDataRooms)
    } catch (error) {
      console.error('Failed to fetch data rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      // Simulate API call
      const mockProviders = [
        { id: 'workspace', name: 'Workspace', oauth_required: false },
        { id: 'gdrive', name: 'Google Drive', oauth_required: true },
        { id: 'notion', name: 'Notion', oauth_required: true },
        { id: 'onedrive', name: 'OneDrive', oauth_required: true },
        { id: 'dropbox', name: 'Dropbox', oauth_required: true }
      ]
      setProviders(mockProviders)
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const handleCreateDataRoom = async () => {
    try {
      // Simulate API call
      const newRoom = {
        id: Date.now().toString(),
        ...newDataRoom,
        read_only: true,
        last_sync_at: null,
        created_at: new Date().toISOString()
      }
      setDataRooms([...dataRooms, newRoom])
      setNewDataRoom({ name: '', provider: '', config: {} })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create data room:', error)
    }
  }

  const handleSync = async (dataRoomId) => {
    try {
      // Simulate sync API call
      setDataRooms(dataRooms.map(room => 
        room.id === dataRoomId 
          ? { ...room, last_sync_at: new Date().toISOString() }
          : room
      ))
    } catch (error) {
      console.error('Failed to sync data room:', error)
    }
  }

  const handleDelete = async (dataRoomId) => {
    if (confirm('Are you sure you want to delete this data room?')) {
      try {
        setDataRooms(dataRooms.filter(room => room.id !== dataRoomId))
      } catch (error) {
        console.error('Failed to delete data room:', error)
      }
    }
  }

  const handleEdit = (dataRoom) => {
    // TODO: Implement edit functionality
    console.log('Edit data room:', dataRoom)
  }

  const handleViewDocuments = (dataRoomId) => {
    // TODO: Implement document viewer
    console.log('View documents for data room:', dataRoomId)
  }

  useEffect(() => {
    fetchDataRooms()
    fetchProviders()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Rooms</h2>
          <p className="text-muted-foreground">
            Manage your connected data sources and storage providers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchDataRooms}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Data Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Data Room</DialogTitle>
                <DialogDescription>
                  Connect a new data source to your workflow system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newDataRoom.name}
                    onChange={(e) => setNewDataRoom({ ...newDataRoom, name: e.target.value })}
                    placeholder="Enter data room name"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={newDataRoom.provider}
                    onValueChange={(value) => setNewDataRoom({ ...newDataRoom, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateDataRoom}
                    disabled={!newDataRoom.name || !newDataRoom.provider}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dataRooms.map((dataRoom) => (
            <DataRoomCard
              key={dataRoom.id}
              dataRoom={dataRoom}
              onSync={handleSync}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDocuments={handleViewDocuments}
            />
          ))}
        </div>
      )}

      {!loading && dataRooms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No data rooms configured</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create your first data room
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

