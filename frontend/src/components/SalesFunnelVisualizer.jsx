import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const SalesFunnelVisualizer = () => {
  const [funnelData] = useState({
    awareness: { count: 1000, conversion: 100, color: 'bg-red-500' },
    interest: { count: 800, conversion: 80, color: 'bg-orange-500' },
    consideration: { count: 400, conversion: 40, color: 'bg-yellow-500' },
    intent: { count: 200, conversion: 20, color: 'bg-green-500' },
    evaluation: { count: 100, conversion: 10, color: 'bg-blue-500' },
    purchase: { count: 50, conversion: 5, color: 'bg-purple-500' }
  });

  const [selectedStage, setSelectedStage] = useState(null);

  const stages = [
    { id: 'awareness', name: 'Awareness', description: 'Visitors discover your brand' },
    { id: 'interest', name: 'Interest', description: 'Visitors show interest in your products' },
    { id: 'consideration', name: 'Consideration', description: 'Visitors consider your offerings' },
    { id: 'intent', name: 'Intent', description: 'Visitors show purchase intent' },
    { id: 'evaluation', name: 'Evaluation', description: 'Visitors evaluate your solution' },
    { id: 'purchase', name: 'Purchase', description: 'Visitors become customers' }
  ];

  const calculateConversionRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  const getStageWidth = (stageId) => {
    const maxCount = Math.max(...Object.values(funnelData).map(stage => stage.count));
    return (funnelData[stageId].count / maxCount) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales Funnel</h2>
        <p className="text-gray-600">Visualize your customer journey and conversion rates</p>
      </div>

      {/* Funnel Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {funnelData.awareness.count.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold text-green-600">
                  {funnelData.purchase.count.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Conversion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((funnelData.purchase.count / funnelData.awareness.count) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Funnel Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageData = funnelData[stage.id];
              const previousStage = index > 0 ? funnelData[stages[index - 1].id] : null;
              const conversionRate = calculateConversionRate(stageData.count, previousStage?.count);
              const width = getStageWidth(stage.id);
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`${stageData.color} text-white p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                    style={{ width: `${Math.max(width, 20)}%` }}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{stage.name}</h3>
                        <p className="text-sm opacity-90">{stage.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stageData.count.toLocaleString()}</div>
                        {previousStage && (
                          <div className="text-sm opacity-90">
                            {conversionRate}% conversion
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversion Arrow */}
                  {index < stages.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="text-gray-400 text-2xl">↓</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      {selectedStage && (
        <Card>
          <CardHeader>
            <CardTitle>Stage Details: {stages.find(s => s.id === selectedStage)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visitors:</span>
                    <span className="font-medium">{funnelData[selectedStage].count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium">{funnelData[selectedStage].conversion}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Optimization Tips</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {selectedStage === 'awareness' && (
                    <p>• Increase content marketing efforts</p>
                  )}
                  {selectedStage === 'interest' && (
                    <p>• Improve product descriptions and visuals</p>
                  )}
                  {selectedStage === 'consideration' && (
                    <p>• Add social proof and testimonials</p>
                  )}
                  {selectedStage === 'intent' && (
                    <p>• Offer limited-time promotions</p>
                  )}
                  {selectedStage === 'evaluation' && (
                    <p>• Provide detailed comparisons and demos</p>
                  )}
                  {selectedStage === 'purchase' && (
                    <p>• Streamline checkout process</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.slice(0, -1).map((stage, index) => {
              const currentStage = funnelData[stage.id];
              const nextStage = funnelData[stages[index + 1].id];
              const conversionRate = calculateConversionRate(nextStage.count, currentStage.count);
              const isGood = conversionRate >= 20;
              const isPoor = conversionRate < 10;
              
              return (
                <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{stage.name} → {stages[index + 1].name}</span>
                    <p className="text-sm text-gray-600">
                      {currentStage.count.toLocaleString()} → {nextStage.count.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={isGood ? 'bg-green-100 text-green-800' : isPoor ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {conversionRate}%
                    </Badge>
                    {isPoor && (
                      <Button variant="outline" size="sm">
                        Optimize
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesFunnelVisualizer;