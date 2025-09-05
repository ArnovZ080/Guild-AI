import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContentPerformanceGarden = () => {
  const [contentItems, setContentItems] = useState([
    { id: '1', title: 'Blog Post: AI Trends', type: 'blog', performance: 0.85, growth: 0.3, lastWatered: Date.now() - 3600000 },
    { id: '2', title: 'Video: Product Demo', type: 'video', performance: 0.92, growth: 0.5, lastWatered: Date.now() - 1800000 },
    { id: '3', title: 'Social Media Campaign', type: 'social', performance: 0.67, growth: 0.2, lastWatered: Date.now() - 7200000 },
    { id: '4', title: 'Email Newsletter', type: 'email', performance: 0.78, growth: 0.4, lastWatered: Date.now() - 5400000 },
    { id: '5', title: 'Podcast Episode', type: 'podcast', performance: 0.73, growth: 0.35, lastWatered: Date.now() - 9000000 },
    { id: '6', title: 'Infographic: Data', type: 'infographic', performance: 0.88, growth: 0.45, lastWatered: Date.now() - 2700000 }
  ]);

  const [selectedContent, setSelectedContent] = useState(null);
  const [wateringAnimation, setWateringAnimation] = useState(null);

  // Simulate content growth and performance changes
  useEffect(() => {
    const interval = setInterval(() => {
      setContentItems(prev => prev.map(item => {
        // Simulate growth based on performance
        const growthChange = (item.performance - 0.5) * 0.01;
        const newGrowth = Math.max(0, Math.min(1, item.growth + growthChange));
        
        // Simulate performance fluctuations
        const performanceChange = (Math.random() - 0.5) * 0.02;
        const newPerformance = Math.max(0.1, Math.min(1, item.performance + performanceChange));
        
        return {
          ...item,
          growth: newGrowth,
          performance: newPerformance
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getContentTypeIcon = (type) => {
    const icons = {
      blog: '📝',
      video: '🎥',
      social: '📱',
      email: '📧',
      podcast: '🎧',
      infographic: '📊'
    };
    return icons[type] || '📄';
  };

  const getContentTypeColor = (type) => {
    const colors = {
      blog: '#10B981', // Green
      video: '#3B82F6', // Blue
      social: '#8B5CF6', // Purple
      email: '#F59E0B', // Orange
      podcast: '#EF4444', // Red
      infographic: '#EC4899' // Pink
    };
    return colors[type] || '#6B7280';
  };

  const getPerformanceColor = (performance) => {
    if (performance > 0.8) return '#10B981'; // Green
    if (performance > 0.6) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getPlantHeight = (growth) => {
    return Math.max(20, growth * 80 + 20);
  };

  const getPlantWidth = (performance) => {
    return Math.max(8, performance * 16 + 8);
  };

  const waterContent = (contentId) => {
    setWateringAnimation(contentId);
    setContentItems(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, growth: Math.min(1, item.growth + 0.1), lastWatered: Date.now() }
        : item
    ));
    
    setTimeout(() => setWateringAnimation(null), 2000);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-green-50 to-blue-50 rounded-lg overflow-hidden">
      <h3 className="text-lg font-semibold m-4 text-gray-800 absolute z-10">Content Performance Garden</h3>
      
      {/* Garden Background */}
      <div className="absolute inset-0">
        {/* Grass Pattern */}
        {Array.from({ length: 50 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-2 bg-green-400 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 20}%`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
            }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Clouds */}
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-16 h-8 bg-white bg-opacity-30 rounded-full"
            style={{
              left: `${20 + index * 30}%`,
              top: `${10 + Math.random() * 10}%`,
            }}
            animate={{
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content Plants */}
      <div className="absolute inset-0 p-4">
        <div className="grid grid-cols-3 gap-4 h-full">
          {contentItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative flex flex-col items-center justify-end cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedContent(item)}
            >
              {/* Plant Stem */}
              <motion.div
                className="relative"
                style={{
                  height: `${getPlantHeight(item.growth)}px`,
                  width: `${getPlantWidth(item.performance)}px`,
                }}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                {/* Main Stem */}
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `linear-gradient(to top, ${getContentTypeColor(item.type)}, ${getContentTypeColor(item.type)}80)`,
                  }}
                />
                
                {/* Leaves */}
                {Array.from({ length: Math.floor(item.growth * 5) + 1 }).map((_, leafIndex) => (
                  <motion.div
                    key={leafIndex}
                    className="absolute w-4 h-3 rounded-full"
                    style={{
                      backgroundColor: getContentTypeColor(item.type),
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
                
                {/* Performance Indicator */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: getPerformanceColor(item.performance),
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                
                {/* Watering Animation */}
                {wateringAnimation === item.id && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {Array.from({ length: 10 }).map((_, dropIndex) => (
                      <motion.div
                        key={dropIndex}
                        className="absolute w-1 h-2 bg-blue-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, 20],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1,
                          delay: dropIndex * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Plant Label */}
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-gray-700 truncate max-w-20">
                  {getContentTypeIcon(item.type)} {item.title.split(':')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(item.performance * 100)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Detail Popup */}
      {selectedContent && (
        <motion.div
          className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-xl max-w-xs z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedContent(null)}
          >
            ×
          </button>
          <h4 className="font-bold text-gray-800 mb-2">{selectedContent.title}</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{selectedContent.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Performance:</span>
              <span 
                className="font-medium"
                style={{ color: getPerformanceColor(selectedContent.performance) }}
              >
                {Math.round(selectedContent.performance * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth:</span>
              <span className="font-medium">{Math.round(selectedContent.growth * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Watered:</span>
              <span className="font-medium">
                {Math.round((Date.now() - selectedContent.lastWatered) / 60000)}m ago
              </span>
            </div>
          </div>
          <button
            onClick={() => waterContent(selectedContent.id)}
            className="w-full mt-3 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            💧 Water Content
          </button>
        </motion.div>
      )}

      {/* Garden Stats */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">Garden Health</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Avg Performance:</span>
              <span className="font-medium">
                {Math.round(contentItems.reduce((sum, item) => sum + item.performance, 0) / contentItems.length * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Growth:</span>
              <span className="font-medium">
                {Math.round(contentItems.reduce((sum, item) => sum + item.growth, 0) / contentItems.length * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Content Count:</span>
              <span className="font-medium">{contentItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">Content Types</div>
          <div className="space-y-1">
            {['blog', 'video', 'social', 'email', 'podcast', 'infographic'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getContentTypeColor(type) }}
                />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformanceGarden;
