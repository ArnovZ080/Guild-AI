import { useCelebration } from './CelebrationProvider.jsx';

/**
 * Compatibility layer for micro-celebrations
 * This provides a simple interface for triggering celebrations
 */

export const CelebrationType = {
  TASK_COMPLETED: 'task_completed',
  MILESTONE_REACHED: 'milestone_reached',
  STREAK_ACHIEVED: 'streak_achieved',
  GOAL_COMPLETED: 'goal_completed',
  AGENT_SUCCESS: 'agent_success',
  WORKFLOW_COMPLETED: 'workflow_completed',
};

/**
 * Hook for triggering micro-celebrations
 * Compatible with old psychological/MicroCelebrations.jsx imports
 */
export const useCelebrations = () => {
  const { triggerCelebration } = useCelebration();

  const celebrate = (type, details = {}) => {
    const achievement = {
      id: `${type}-${Date.now()}`,
      type,
      title: details.title || getDefaultTitle(type),
      description: details.description || '',
      points: details.points || 10,
      timestamp: new Date().toISOString(),
      ...details
    };

    triggerCelebration(achievement);
  };

  return { celebrate };
};

function getDefaultTitle(type) {
  const titles = {
    [CelebrationType.TASK_COMPLETED]: '✅ Task Completed!',
    [CelebrationType.MILESTONE_REACHED]: '🎯 Milestone Reached!',
    [CelebrationType.STREAK_ACHIEVED]: '🔥 Streak Achieved!',
    [CelebrationType.GOAL_COMPLETED]: '🏆 Goal Completed!',
    [CelebrationType.AGENT_SUCCESS]: '🤖 Agent Success!',
    [CelebrationType.WORKFLOW_COMPLETED]: '⚡ Workflow Completed!',
  };
  return titles[type] || '🎉 Achievement Unlocked!';
}

export default useCelebrations;

