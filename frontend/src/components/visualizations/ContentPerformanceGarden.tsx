import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentPlant {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'video' | 'podcast' | 'email';
  performance: number; // 0-100
  engagement: number; // 0-100
  reach: number; // 0-100
  conversion: number; // 0-100
  publishDate: Date;
  category: string;
  x: number;
  y: number;
  size: number;
  growthStage: 'seedling' | 'growing' | 'mature' | 'flourishing';
  seasonal: boolean;
}

export const ContentPerformanceGarden: React.FC = () => {
  const [plants, setPlants] = useState<ContentPlant[]>([
    {
      id: '1',
      title: 'AI Marketing Guide',
      type: 'blog',
      performance: 95,
      engagement: 88,
      reach: 92,
      conversion: 85,
      publishDate: new Date('2024-01-15'),
      category: 'Educational',
      x: 20,
      y: 30,
      size: 25,
      growthStage: 'flourishing',
      seasonal: false
    },
    {
      id: '2',
      title: 'Product Demo Video',
      type: 'video',
      performance: 78,
      engagement: 82,
      reach: 75,
      conversion: 90,
      publishDate: new Date('2024-01-20'),
      category: 'Product',
      x: 60,
      y: 25,
      size: 20,
      growthStage: 'mature',
      seasonal: false
    },
    {
      id: '3',
      title: 'LinkedIn Series',
      type: 'social',
      performance: 65,
      engagement: 70,
      reach: 85,
      conversion: 45,
      publishDate: new Date('2024-01-22'),
      category: 'Thought Leadership',
      x: 80,
      y: 40,
      size: 18,
      growthStage: 'growing',
      seasonal: true
    },
    {
      id: '4',
      title: 'Newsletter Issue #12',
      type: 'email',
      performance: 85,
      engagement: 92,
      reach: 60,
      conversion: 75,
      publishDate: new Date('2024-01-18'),
      category: 'Updates',
      x: 30,
      y: 60,
      size: 22,
      growthStage: 'mature',
      seasonal: false
    },
    {
      id: '5',
      title: 'Industry Trends Report',
      type: 'blog',
      performance: 45,
      engagement: 55,
      reach: 40,
      conversion: 30,
      publishDate: new Date('2024-01-25'),
      category: 'Research',
      x: 70,
      y: 70,
      size: 12,
      growthStage: 'seedling',
      seasonal: true
    }
  ]);

  const [selectedPlant, setSelectedPlant] = useState<ContentPlant | null>(null);
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');

  // Simulate seasonal changes
  useEffect(() => {
    const interval = setInterval(() => {
      const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
      setSeason(prev => {
        const currentIndex = seasons.indexOf(prev);
        return seasons[(currentIndex + 1) % seasons.length];
      });
    }, 30000); // Change season every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const getPlantIcon = (type: string) => {
    const icons = {
      blog: '📝',
      social: '📱',
      video: '🎥',
      podcast: '🎙️',
      email: '📧'
    };
    return icons[type as keyof typeof icons] || '🌱';
  };

  const getPlantVisual = (plant: ContentPlant) => {
    const performance = plant.performance;
    const isSeasonal = plant.seasonal;
    
    // Determine plant type based on performance and type
    if (performance >= 90) {
      return isSeasonal ? '🌸' : '🌳'; // Flowering or tree
    } else if (performance >= 70) {
      return isSeasonal ? '🌺' : '🌿'; // Flower or bush
    } else if (performance >= 50) {
      return isSeasonal ? '🌼' : '🌱'; // Small flower or growing plant
    } else {
      return '🌱'; // Seedling
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return '#10B981'; // Green
    if (performance >= 60) return '#F59E0B'; // Amber
    if (performance >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getSeasonalEffect = (plant: ContentPlant) => {
    if (!plant.seasonal) return null;
    
    const seasonalEffects = {
      spring: { color: '#10B981', effect: '🌸' },
      summer: { color: '#F59E0B', effect: '☀️' },
      autumn: { color: '#EF4444', effect: '🍂' },
      winter: { color: '#3B82F6', effect: '❄️' }
    };
    
    return seasonalEffects[season];
  };

  const getGrowthAnimation = (growthStage: string) => {
    const animations = {
      seedling: { scale: [0.8, 1, 0.8], duration: 3 },
      growing: { scale: [1, 1.1, 1], duration: 2.5 },
      mature: { scale: [1, 1.05, 1], duration: 4 },
      flourishing: { scale: [1, 1.2, 1], duration: 2 }
    };
    return animations[growthStage as keyof typeof animations] || animations.seedling;
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 via-blue-50 to-yellow-50 rounded-lg overflow-hidden">
      {/* Garden Background */}
      <div className="absolute inset-0">
        {/* Grass texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300 opacity-30" />
        
        {/* Seasonal overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: season === 'spring' ? 'radial-gradient(circle, #10B981, transparent)' :
                       season === 'summer' ? 'radial-gradient(circle, #F59E0B, transparent)' :
                       season === 'autumn' ? 'radial-gradient(circle, #EF4444, transparent)' :
                       'radial-gradient(circle, #3B82F6, transparent)'
          }}
          key={season}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
        />

        {/* Decorative elements */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -5, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Content Plants */}
      {plants.map((plant) => {
        const animation = getGrowthAnimation(plant.growthStage);
        const seasonalEffect = getSeasonalEffect(plant);
        
        return (
          <motion.div
            key={plant.id}
            className="absolute cursor-pointer"
            style={{
              left: `${plant.x}%`,
              top: `${plant.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedPlant(plant)}
            animate={animation}
            transition={{ duration: animation.duration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              {/* Plant Visual */}
              <div
                className="text-3xl filter drop-shadow-lg"
                style={{
                  fontSize: `${plant.size}px`,
                  color: getPerformanceColor(plant.performance)
                }}
              >
                {getPlantVisual(plant)}
              </div>

              {/* Performance Indicator */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: getPerformanceColor(plant.performance) }}
              />

              {/* Seasonal Effect */}
              {seasonalEffect && (
                <motion.div
                  className="absolute -top-2 -left-2 text-xs"
                  animate={{
                    rotate: [0, 360],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity
                  }}
                >
                  {seasonalEffect.effect}
                </motion.div>
              )}

              {/* Growth Stage Indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className={`w-2 h-2 rounded-full ${
                  plant.growthStage === 'flourishing' ? 'bg-green-500' :
                  plant.growthStage === 'mature' ? 'bg-blue-500' :
                  plant.growthStage === 'growing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`} />
              </div>

              {/* Engagement Particles */}
              {plant.engagement > 80 && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                >
                  <div className="w-full h-full border-2 border-yellow-300 rounded-full" />
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Plant Detail Modal */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md mx-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedPlant(null)}
              >
                ×
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{getPlantIcon(selectedPlant.type)}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedPlant.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {selectedPlant.type}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {selectedPlant.growthStage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium">Performance</div>
                  <div className="text-lg font-bold text-green-700">{selectedPlant.performance}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium">Engagement</div>
                  <div className="text-lg font-bold text-blue-700">{selectedPlant.engagement}%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-purple-600 font-medium">Reach</div>
                  <div className="text-lg font-bold text-purple-700">{selectedPlant.reach}%</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xs text-orange-600 font-medium">Conversion</div>
                  <div className="text-lg font-bold text-orange-700">{selectedPlant.conversion}%</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>Category:</strong> {selectedPlant.category}<br />
                <strong>Published:</strong> {selectedPlant.publishDate.toLocaleDateString()}
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  Optimize
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Analyze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
        <div className="text-xs space-y-1">
          <div className="font-medium text-gray-800 mb-2">Garden Legend</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>High Performance (80%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Performance (60-79%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Low Performance (&lt;60%)</span>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Season: {season} {getSeasonalEffect({ seasonal: true } as ContentPlant)?.effect}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformanceGarden;