import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const ProjectPlanDisplay = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects] = useState([
    {
      id: '1',
      name: 'Q1 Marketing Campaign',
      description: 'Launch comprehensive marketing campaign for Q1 product release',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      priority: 'high',
      team: ['Marketing Agent', 'Content Agent', 'SEO Agent'],
      milestones: [
        { id: '1', name: 'Campaign Strategy', status: 'completed', dueDate: '2024-01-15' },
        { id: '2', name: 'Content Creation', status: 'in-progress', dueDate: '2024-02-15' },
        { id: '3', name: 'Channel Setup', status: 'pending', dueDate: '2024-02-28' },
        { id: '4', name: 'Campaign Launch', status: 'pending', dueDate: '2024-03-01' }
      ],
      tasks: [
        { id: '1', name: 'Define target audience', status: 'completed', assignee: 'Marketing Agent' },
        { id: '2', name: 'Create campaign assets', status: 'in-progress', assignee: 'Content Agent' },
        { id: '3', name: 'Set up analytics tracking', status: 'pending', assignee: 'SEO Agent' },
        { id: '4', name: 'Schedule social media posts', status: 'pending', assignee: 'Marketing Agent' }
      ]
    },
    {
      id: '2',
      name: 'Website Redesign',
      description: 'Complete redesign of company website with new branding',
      status: 'planning',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      priority: 'medium',
      team: ['UX/UI Agent', 'Developer Agent', 'Content Agent'],
      milestones: [
        { id: '1', name: 'Design System', status: 'in-progress', dueDate: '2024-02-15' },
        { id: '2', name: 'Wireframes', status: 'pending', dueDate: '2024-02-28' },
        { id: '3', name: 'Development', status: 'pending', dueDate: '2024-03-31' },
        { id: '4', name: 'Testing & Launch', status: 'pending', dueDate: '2024-04-30' }
      ],
      tasks: [
        { id: '1', name: 'Research competitor websites', status: 'completed', assignee: 'UX/UI Agent' },
        { id: '2', name: 'Create design system', status: 'in-progress', assignee: 'UX/UI Agent' },
        { id: '3', name: 'Write new content', status: 'pending', assignee: 'Content Agent' },
        { id: '4', name: 'Set up development environment', status: 'pending', assignee: 'Developer Agent' }
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Project Plans</h2>
        <p className="text-gray-600">Track and manage your project milestones and tasks</p>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Start Date</p>
                    <p className="text-gray-600">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">End Date</p>
                    <p className="text-gray-600">{formatDate(project.endDate)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">Team</p>
                  <div className="flex flex-wrap gap-1">
                    {project.team.map((member, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {project.milestones.filter(m => m.status === 'completed').length} / {project.milestones.length} milestones
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProject(null)}
                  >
                    Close
                  </Button>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedProject.milestones.filter(m => m.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Milestones</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedProject.tasks.filter(t => t.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Tasks Done</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedProject.team.length}</div>
                      <div className="text-sm text-gray-600">Team Members</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Milestones */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h4>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-500' :
                            milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{milestone.name}</p>
                            <p className="text-sm text-gray-600">Due: {formatDate(milestone.dueDate)}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h4>
                  <div className="space-y-2">
                    {selectedProject.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'completed'}
                            className="w-4 h-4 text-blue-600 rounded"
                            readOnly
                          />
                          <div>
                            <p className="font-medium text-gray-900">{task.name}</p>
                            <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectPlanDisplay;