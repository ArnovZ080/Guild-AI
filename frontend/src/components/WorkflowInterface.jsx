import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Square, CheckCircle, Clock, AlertCircle, FileText, Users, Target } from 'lucide-react'

const deliverableTypes = [
  { id: 'brief', name: 'Brief', icon: FileText, description: 'Project brief and requirements' },
  { id: 'ads', name: 'Ad Copy', icon: Target, description: 'Marketing advertisements' },
  { id: 'calendar', name: 'Calendar', icon: Clock, description: 'Content calendar' },
  { id: 'listing', name: 'Listing Pack', icon: Users, description: 'Product listings' },
  { id: 'seo', name: 'SEO Checklist', icon: CheckCircle, description: 'SEO optimization guide' }
]

const mockDataRooms = [
  { id: '1', name: 'Marketing Assets', provider: 'gdrive' },
  { id: '2', name: 'Project Documentation', provider: 'notion' },
  { id: '3', name: 'Brand Guidelines', provider: 'workspace' }
]

export function WorkflowInterface() {
  const [activeTab, setActiveTab] = useState('plan')
  const [contract, setContract] = useState({
    title: '',
    objective: '',
    deliverables: [],
    dataRooms: [],
    rubric: {
      quality_threshold: 0.8,
      fact_check_required: true,
      brand_compliance: true,
      seo_optimization: false
    }
  })
  const [workflow, setWorkflow] = useState(null)
  const [execution, setExecution] = useState({
    status: 'idle', // idle, running, paused, completed, failed
    progress: 0,
    currentAgent: null,
    results: []
  })

  const handleContractChange = (field, value) => {
    setContract({ ...contract, [field]: value })
  }

  const handleDeliverableToggle = (deliverableId) => {
    const updated = contract.deliverables.includes(deliverableId)
      ? contract.deliverables.filter(id => id !== deliverableId)
      : [...contract.deliverables, deliverableId]
    handleContractChange('deliverables', updated)
  }

  const handleDataRoomToggle = (dataRoomId) => {
    const updated = contract.dataRooms.includes(dataRoomId)
      ? contract.dataRooms.filter(id => id !== dataRoomId)
      : [...contract.dataRooms, dataRoomId]
    handleContractChange('dataRooms', updated)
  }

  const handleRubricChange = (field, value) => {
    setContract({
      ...contract,
      rubric: { ...contract.rubric, [field]: value }
    })
  }

  const compileWorkflow = () => {
    // Simulate workflow compilation
    const mockWorkflow = {
      id: Date.now().toString(),
      contract,
      dag: {
        nodes: [
          { id: 'research', type: 'agent', name: 'Research Agent', dependencies: [] },
          { id: 'content', type: 'agent', name: 'Content Creator', dependencies: ['research'] },
          { id: 'fact_check', type: 'evaluator', name: 'Fact Checker', dependencies: ['content'] },
          { id: 'brand_check', type: 'evaluator', name: 'Brand Checker', dependencies: ['content'] },
          { id: 'final', type: 'orchestrator', name: 'Final Review', dependencies: ['fact_check', 'brand_check'] }
        ]
      },
      estimated_duration: '15-30 minutes'
    }
    setWorkflow(mockWorkflow)
    setActiveTab('approve')
  }

  const startExecution = () => {
    setExecution({
      status: 'running',
      progress: 0,
      currentAgent: 'Research Agent',
      results: []
    })
    
    // Simulate workflow execution
    const steps = ['Research Agent', 'Content Creator', 'Fact Checker', 'Brand Checker', 'Final Review']
    let currentStep = 0
    
    const interval = setInterval(() => {
      currentStep++
      const progress = (currentStep / steps.length) * 100
      
      if (currentStep >= steps.length) {
        setExecution({
          status: 'completed',
          progress: 100,
          currentAgent: null,
          results: [
            { type: 'brief', title: 'Marketing Brief Q1 2024', score: 0.92 },
            { type: 'ads', title: 'Social Media Ad Campaign', score: 0.88 }
          ]
        })
        clearInterval(interval)
        setActiveTab('qa')
      } else {
        setExecution(prev => ({
          ...prev,
          progress,
          currentAgent: steps[currentStep]
        }))
      }
    }, 3000)
  }

  const pauseExecution = () => {
    setExecution(prev => ({ ...prev, status: 'paused' }))
  }

  const stopExecution = () => {
    setExecution({
      status: 'idle',
      progress: 0,
      currentAgent: null,
      results: []
    })
    setActiveTab('plan')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Square className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Interface</h2>
          <p className="text-muted-foreground">
            Plan → Approve → Run → QA your content workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(execution.status)}
          <Badge variant={execution.status === 'running' ? 'default' : 'secondary'}>
            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="approve" disabled={!workflow}>Approve</TabsTrigger>
          <TabsTrigger value="run" disabled={!workflow}>Run</TabsTrigger>
          <TabsTrigger value="qa" disabled={execution.status !== 'completed'}>QA</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outcome Contract</CardTitle>
              <CardDescription>
                Define your project objectives, deliverables, and data sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={contract.title}
                  onChange={(e) => handleContractChange('title', e.target.value)}
                  placeholder="Enter project title"
                />
              </div>
              
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Textarea
                  id="objective"
                  value={contract.objective}
                  onChange={(e) => handleContractChange('objective', e.target.value)}
                  placeholder="Describe your project objectives and goals"
                  rows={3}
                />
              </div>

              <div>
                <Label>Deliverables</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {deliverableTypes.map((deliverable) => {
                    const Icon = deliverable.icon
                    return (
                      <div key={deliverable.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={deliverable.id}
                          checked={contract.deliverables.includes(deliverable.id)}
                          onCheckedChange={() => handleDeliverableToggle(deliverable.id)}
                        />
                        <label
                          htmlFor={deliverable.id}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {deliverable.name}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Data Rooms</Label>
                <div className="space-y-2 mt-2">
                  {mockDataRooms.map((dataRoom) => (
                    <div key={dataRoom.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-${dataRoom.id}`}
                        checked={contract.dataRooms.includes(dataRoom.id)}
                        onCheckedChange={() => handleDataRoomToggle(dataRoom.id)}
                      />
                      <label
                        htmlFor={`room-${dataRoom.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {dataRoom.name} ({dataRoom.provider})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Quality Rubric</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="quality_threshold" className="text-sm">
                      Quality Threshold: {contract.rubric.quality_threshold}
                    </Label>
                    <input
                      type="range"
                      id="quality_threshold"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={contract.rubric.quality_threshold}
                      onChange={(e) => handleRubricChange('quality_threshold', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fact_check"
                      checked={contract.rubric.fact_check_required}
                      onCheckedChange={(checked) => handleRubricChange('fact_check_required', checked)}
                    />
                    <label htmlFor="fact_check" className="text-sm">Fact checking required</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="brand_compliance"
                      checked={contract.rubric.brand_compliance}
                      onCheckedChange={(checked) => handleRubricChange('brand_compliance', checked)}
                    />
                    <label htmlFor="brand_compliance" className="text-sm">Brand compliance check</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seo_optimization"
                      checked={contract.rubric.seo_optimization}
                      onCheckedChange={(checked) => handleRubricChange('seo_optimization', checked)}
                    />
                    <label htmlFor="seo_optimization" className="text-sm">SEO optimization</label>
                  </div>
                </div>
              </div>

              <Button
                onClick={compileWorkflow}
                disabled={!contract.title || !contract.objective || contract.deliverables.length === 0}
                className="w-full"
              >
                Compile Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approve" className="space-y-6">
          {workflow && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Preview</CardTitle>
                <CardDescription>
                  Review the generated workflow before execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Execution Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Estimated duration: {workflow.estimated_duration}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Agent Pipeline</h4>
                  <div className="space-y-2">
                    {workflow.dag.nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-2">
                        <Badge variant={node.type === 'agent' ? 'default' : 'secondary'}>
                          {node.type}
                        </Badge>
                        <span className="text-sm">{node.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setActiveTab('run')} className="w-full">
                  Approve & Continue
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="run" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Control</CardTitle>
              <CardDescription>
                Monitor and control workflow execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {execution.status === 'idle' && (
                <Button onClick={startExecution} className="w-full">
                  Start Execution
                </Button>
              )}
              
              {execution.status === 'running' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(execution.progress)}%</span>
                    </div>
                    <Progress value={execution.progress} />
                  </div>
                  
                  <div className="text-sm">
                    Current: <Badge variant="outline">{execution.currentAgent}</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={pauseExecution}>
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={stopExecution}>
                      Stop
                    </Button>
                  </div>
                </div>
              )}
              
              {execution.status === 'paused' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress (Paused)</span>
                      <span>{Math.round(execution.progress)}%</span>
                    </div>
                    <Progress value={execution.progress} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={startExecution}>Resume</Button>
                    <Button variant="destructive" onClick={stopExecution}>
                      Stop
                    </Button>
                  </div>
                </div>
              )}
              
              {execution.status === 'completed' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Execution Completed</span>
                  </div>
                  
                  <Button onClick={() => setActiveTab('qa')} className="w-full">
                    Review Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Assurance</CardTitle>
              <CardDescription>
                Review and approve generated deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {execution.results.length > 0 ? (
                <div className="space-y-4">
                  {execution.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.title}</h4>
                        <Badge variant={result.score >= 0.8 ? 'default' : 'secondary'}>
                          Score: {(result.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Type: {result.type}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Download</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Regenerate</Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={stopExecution} className="w-full">
                    Complete & Reset
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No results available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

