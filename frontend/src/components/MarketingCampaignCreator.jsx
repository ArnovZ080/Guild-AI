import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const MarketingCampaignCreator = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    targetAudience: '',
    budget: '',
    duration: '',
    goals: ''
  });

  const campaignTypes = [
    { id: 'email', name: 'Email Marketing', icon: '📧', color: 'bg-blue-100 text-blue-800' },
    { id: 'social', name: 'Social Media', icon: '📱', color: 'bg-green-100 text-green-800' },
    { id: 'content', name: 'Content Marketing', icon: '📝', color: 'bg-purple-100 text-purple-800' },
    { id: 'paid', name: 'Paid Advertising', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'seo', name: 'SEO Campaign', icon: '🔍', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.type) {
      const campaign = {
        ...newCampaign,
        id: Date.now().toString(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        metrics: {
          reach: 0,
          engagement: 0,
          conversions: 0
        }
      };
      setCampaigns(prev => [...prev, campaign]);
      setNewCampaign({
        name: '',
        type: 'email',
        targetAudience: '',
        budget: '',
        duration: '',
        goals: ''
      });
      setShowCreateDialog(false);
    }
  };

  const getCampaignType = (typeId) => {
    return campaignTypes.find(t => t.id === typeId) || campaignTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h2>
          <p className="text-gray-600">Create and manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Campaign
        </Button>
      </div>

      {/* Campaign Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {campaignTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setNewCampaign(prev => ({ ...prev, type: type.id }));
                setShowCreateDialog(true);
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{type.icon}</div>
                <h3 className="font-medium text-sm">{type.name}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first marketing campaign to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => {
            const type = getCampaignType(campaign.type);
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
            <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <p className="text-sm text-gray-600">{type.name}</p>
                        </div>
                      </div>
                      <Badge className={type.color}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Target Audience</h4>
                        <p className="text-sm text-gray-600">{campaign.targetAudience || 'Not specified'}</p>
                        </div>
                        <div>
                        <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                        <p className="text-sm text-gray-600">{campaign.budget || 'Not specified'}</p>
                        </div>
                        <div>
                        <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                        <p className="text-sm text-gray-600">{campaign.duration || 'Not specified'}</p>
                        </div>
                    </div>
                    {campaign.goals && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                        <p className="text-sm text-gray-600">{campaign.goals}</p>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Launch
                    </Button>
                    </div>
            </CardContent>
        </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <Input
                placeholder="Enter campaign name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {campaignTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={newCampaign.type === type.id ? 'default' : 'outline'}
                    onClick={() => setNewCampaign(prev => ({ ...prev, type: type.id }))}
                    className="justify-start"
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.name}
                </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <Input
                placeholder="Describe your target audience"
                value={newCampaign.targetAudience}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <Input
                  placeholder="e.g., $1000"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <Input
                  placeholder="e.g., 30 days"
                  value={newCampaign.duration}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goals
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="What do you want to achieve with this campaign?"
                value={newCampaign.goals}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, goals: e.target.value }))}
              />
        </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
        </div>
        </DialogContent>
      </Dialog>
        </div>
    );
};

export default MarketingCampaignCreator;