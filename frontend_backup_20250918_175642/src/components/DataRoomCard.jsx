import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Settings, Trash2, FolderOpen } from 'lucide-react'

const providerIcons = {
  workspace: '💼',
  gdrive: '📁',
  notion: '📝',
  onedrive: '☁️',
  dropbox: '📦'
}

const providerNames = {
  workspace: 'Workspace',
  gdrive: 'Google Drive',
  notion: 'Notion',
  onedrive: 'OneDrive',
  dropbox: 'Dropbox'
}

export function DataRoomCard({ dataRoom, onSync, onEdit, onDelete, onViewDocuments }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (lastSync) => {
    if (!lastSync) return 'destructive'
    const daysSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceSync < 1) return 'default'
    if (daysSinceSync < 7) return 'secondary'
    return 'destructive'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{providerIcons[dataRoom.provider]}</span>
            <div>
              <CardTitle className="text-lg">{dataRoom.name}</CardTitle>
              <CardDescription>{providerNames[dataRoom.provider]}</CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(dataRoom.last_sync_at)}>
            {dataRoom.read_only ? 'Read-only' : 'Read-write'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Last sync: {formatDate(dataRoom.last_sync_at)}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(dataRoom.id)}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDocuments(dataRoom.id)}
              className="flex items-center gap-1"
            >
              <FolderOpen className="h-4 w-4" />
              Documents
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(dataRoom)}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(dataRoom.id)}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
