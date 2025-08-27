import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataRoomManager } from './components/DataRoomManager';
import { OAuthConnections } from './components/OAuthConnections';
// Import the new component
import MarketingCampaignCreator from './components/MarketingCampaignCreator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('workflow');

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
            {/* Replace the old interface with the new one */}
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
