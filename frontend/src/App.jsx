import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataRoomManager } from './components/DataRoomManager';
import { OAuthConnections } from './components/OAuthConnections';
import MarketingCampaignCreator from './components/MarketingCampaignCreator';
import OnboardingFlow from './components/OnboardingFlow'; // Import the new onboarding component

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('workflow');
  // Add state to track onboarding completion
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Render the Onboarding Flow if not complete
  if (!isOnboardingComplete) {
    return <OnboardingFlow onOnboardingComplete={() => setIsOnboardingComplete(true)} />;
  }

  // Render the main app if onboarding is complete
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Marketing Department</h1>
          <p className="text-xl text-muted-foreground">
            Define your objective and let our autonomous AI team build and execute a world-class marketing campaign.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow">Campaign</TabsTrigger>
            <TabsTrigger value="data-rooms">Data Rooms</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow">

            <MarketingCampaignCreator />
          </TabsContent>

          <TabsContent value="data-rooms">
            <DataRoomManager />
          </TabsContent>

          <TabsContent value="connections">
            <OAuthConnections />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
