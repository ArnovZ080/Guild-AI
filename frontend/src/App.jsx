import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataRoomManager } from './components/DataRoomManager'
import { OAuthConnections } from './components/OAuthConnections'
import { WorkflowInterface } from './components/WorkflowInterface'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('workflow')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hybrid Storage Workflow System</h1>
          <p className="text-xl text-muted-foreground">
            Orchestrate AI agents with connected data sources for automated content creation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="data-rooms">Data Rooms</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow">
            <WorkflowInterface />
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
  )
}

export default App
