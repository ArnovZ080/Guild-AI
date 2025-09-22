import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, RefreshCw } from 'lucide-react';
import { DataRoomCard } from './DataRoomCard'; // Assuming this component exists and is styled

const API_BASE_URL = '/api'; // Using a relative URL, assuming proxy is set up in vite.config.js

export function DataRoomManager() {
  const [dataRooms, setDataRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDataRoom, setNewDataRoom] = useState({ name: '', provider: 'local', config: {} });

  const fetchDataRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datarooms/`);
      if (!response.ok) throw new Error('Failed to fetch data rooms');
      const data = await response.json();
      setDataRooms(data);
    } catch (error) {
      console.error('Failed to fetch data rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDataRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/datarooms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDataRoom),
      });
      if (!response.ok) throw new Error('Failed to create data room');

      fetchDataRooms(); // Refresh the list after creation
      setNewDataRoom({ name: '', provider: 'local', config: {} });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create data room:', error);
    }
  };

  const handleDelete = async (dataRoomId) => {
    if (window.confirm('Are you sure you want to delete this data room?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/datarooms/${dataRoomId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete data room');

        fetchDataRooms(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete data room:', error);
      }
    }
  };

  useEffect(() => {
    fetchDataRooms();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Rooms</h2>
          <p className="text-muted-foreground">Manage your connected data sources.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDataRooms} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Data Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Data Room</DialogTitle>
                <DialogDescription>Connect a new data source.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={newDataRoom.name} onChange={(e) => setNewDataRoom({ ...newDataRoom, name: e.target.value })} placeholder="e.g., 'My Project Documents'"/>
                </div>
                {/* Simplified provider selection for now */}
                <div>
                  <Label>Provider</Label>
                  <p className="text-sm text-muted-foreground">Currently only 'local' workspace is supported.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateDataRoom} disabled={!newDataRoom.name}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8"><RefreshCw className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : (
        <>
          {dataRooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dataRooms.map((dataRoom) => (
                <DataRoomCard key={dataRoom.id} dataRoom={dataRoom} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No data rooms found.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Create your first data room</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
