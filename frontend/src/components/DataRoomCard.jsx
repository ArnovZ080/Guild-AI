import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const DataRoomCard = ({ dataRoom, onSelect, onEdit, onDelete }) => {
  const { name, description, type, status, lastUpdated, documentCount } = dataRoom;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'google_drive': return '📁';
      case 'notion': return '📝';
      case 'onedrive': return '☁️';
      case 'dropbox': return '📦';
      case 'workspace': return '💼';
      default: return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getTypeIcon(type)}</span>
              <CardTitle className="text-lg">{name}</CardTitle>
            </div>
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{documentCount || 0} documents</span>
            <span>Updated {lastUpdated}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(dataRoom);
              }}
              className="flex-1"
            >
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(dataRoom);
              }}
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(dataRoom);
              }}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataRoomCard;