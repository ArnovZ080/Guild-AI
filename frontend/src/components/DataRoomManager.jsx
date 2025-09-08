import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import DataRoomCard from './DataRoomCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const DataRoomManager = () => {
  const [dataRooms, setDataRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Simulated data rooms
  useEffect(() => {
    const mockDataRooms = [
      {
        id: '1',
        name: 'Marketing Assets',
        description: 'All marketing materials, campaigns, and brand assets',
        type: 'google_drive',
        status: 'active',
        lastUpdated: '2 hours ago',
        documentCount: 45
      },
      {
        id: '2',
        name: 'Customer Research',
        description: 'Market research, customer interviews, and competitive analysis',
        type: 'notion',
        status: 'syncing',
        lastUpdated: '1 day ago',
        documentCount: 23
      },
      {
        id: '3',
        name: 'Financial Documents',
        description: 'Invoices, receipts, and financial reports',
        type: 'onedrive',
        status: 'active',
        lastUpdated: '3 hours ago',
        documentCount: 12
      },
      {
        id: '4',
        name: 'Product Documentation',
        description: 'Technical specs, user guides, and API documentation',
        type: 'workspace',
        status: 'error',
        lastUpdated: '1 week ago',
        documentCount: 8
      }
    ];

    setTimeout(() => {
      setDataRooms(mockDataRooms);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredDataRooms = dataRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddDataRoom = (newRoom) => {
    setDataRooms(prev => [...prev, { ...newRoom, id: Date.now().toString() }]);
    setShowAddDialog(false);
  };

  const handleEditDataRoom = (room) => {
    console.log('Edit room:', room);
    // Implement edit functionality
  };

  const handleDeleteDataRoom = (room) => {
    setDataRooms(prev => prev.filter(r => r.id !== room.id));
  };

  const handleSelectDataRoom = (room) => {
    console.log('Selected room:', room);
    // Implement selection functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Rooms</h2>
          <p className="text-gray-600">Manage your connected data sources</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add Data Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Data Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input placeholder="Enter data room name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="google_drive">Google Drive</option>
                  <option value="notion">Notion</option>
                  <option value="onedrive">OneDrive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="workspace">Workspace</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleAddDataRoom({})}>
                  Add Data Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search data rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'google_drive', 'notion', 'onedrive', 'dropbox', 'workspace'].map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Data Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDataRooms.map((room) => (
            <DataRoomCard
              key={room.id}
              dataRoom={room}
              onSelect={handleSelectDataRoom}
              onEdit={handleEditDataRoom}
              onDelete={handleDeleteDataRoom}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredDataRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data rooms found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first data room'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DataRoomManager;