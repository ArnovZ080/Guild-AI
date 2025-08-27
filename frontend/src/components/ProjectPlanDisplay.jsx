import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, AlertTriangle } from 'lucide-react';

const ProjectPlanDisplay = ({ projectPlan }) => {
  if (!projectPlan || !projectPlan.milestones) {
    return <div>No project plan to display.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{projectPlan.project_name || "Project Plan"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectPlan.milestones.map((milestone, index) => (
            <div key={index} className="border-l-2 pl-4">
              <h3 className="font-semibold text-lg mb-2">{milestone.name}</h3>
              <div className="space-y-3">
                {milestone.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="flex items-start justify-between p-2 rounded-md bg-gray-50">
                    <div>
                      <p className="font-medium">{task.task_name}</p>
                      <p className="text-sm text-muted-foreground">Due: {task.due_date}</p>
                    </div>
                    <Badge variant="outline">
                      {task.assigned_agent}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {projectPlan.risk_assessment && projectPlan.risk_assessment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Potential risks and mitigation strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectPlan.risk_assessment.map((riskItem, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold">{riskItem.risk}</p>
                  <p className="text-sm text-muted-foreground">{riskItem.mitigation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectPlanDisplay;
