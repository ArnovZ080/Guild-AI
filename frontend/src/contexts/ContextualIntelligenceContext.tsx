import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { usePsychologicalOptimization } from './PsychologicalOptimizationContext';
import { useMomentumBanking } from './MomentumBankingContext';

interface UserIntent {
  primary: 'planning' | 'executing' | 'reviewing' | 'stressed' | 'exploring';
  secondary?: string;
  confidence: number;
  lastUpdated: Date;
}

interface BusinessContext {
  stage: 'startup' | 'growth' | 'mature' | 'pivot';
  priorities: string[];
  currentGoals: Array<{
    id: string;
    title: string;
    progress: number;
    deadline?: Date;
  }>;
  metrics: {
    revenue: number;
    growth: number;
    customerCount: number;
  };
}

interface PsychologicalState {
  stressLevel: number;
  motivationLevel: number;
  cognitiveLoad: number;
  focusMode: boolean;
  energyLevel: number;
}

interface AdaptiveRecommendation {
  id: string;
  type: 'action' | 'insight' | 'warning' | 'celebration';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    handler: () => void;
  };
  conditions: {
    stressThreshold?: number;
    momentumThreshold?: number;
    timeOfDay?: string[];
  };
}

interface ContextualIntelligenceState {
  userIntent: UserIntent;
  businessContext: BusinessContext;
  psychologicalState: PsychologicalState;
  adaptiveRecommendations: AdaptiveRecommendation[];
  interfaceComplexity: 'minimal' | 'standard' | 'detailed' | 'expert';
  dataFilters: {
    timeRange: 'hour' | 'day' | 'week' | 'month';
    priority: 'all' | 'high' | 'critical';
    category: string[];
  };
  learning: {
    userPatterns: Record<string, any>;
    preferences: Record<string, any>;
    adaptationHistory: Array<{
      timestamp: Date;
      change: string;
      success: boolean;
    }>;
  };
}

const initialState: ContextualIntelligenceState = {
  userIntent: {
    primary: 'exploring',
    confidence: 0.5,
    lastUpdated: new Date()
  },
  businessContext: {
    stage: 'growth',
    priorities: ['Revenue Growth', 'Customer Acquisition', 'Operational Efficiency'],
    currentGoals: [
      { id: '1', title: 'Increase MRR by 25%', progress: 0.6 },
      { id: '2', title: 'Launch New Feature', progress: 0.3 },
      { id: '3', title: 'Reduce Churn Rate', progress: 0.8 }
    ],
    metrics: {
      revenue: 45000,
      growth: 0.15,
      customerCount: 150
    }
  },
  psychologicalState: {
    stressLevel: 0.4,
    motivationLevel: 0.7,
    cognitiveLoad: 0.5,
    focusMode: false,
    energyLevel: 0.8
  },
  adaptiveRecommendations: [],
  interfaceComplexity: 'standard',
  dataFilters: {
    timeRange: 'day',
    priority: 'all',
    category: []
  },
  learning: {
    userPatterns: {},
    preferences: {},
    adaptationHistory: []
  }
};

type ContextualIntelligenceAction =
  | { type: 'UPDATE_USER_INTENT'; payload: Partial<UserIntent> }
  | { type: 'UPDATE_BUSINESS_CONTEXT'; payload: Partial<BusinessContext> }
  | { type: 'UPDATE_PSYCHOLOGICAL_STATE'; payload: Partial<PsychologicalState> }
  | { type: 'ADD_RECOMMENDATION'; payload: AdaptiveRecommendation }
  | { type: 'REMOVE_RECOMMENDATION'; payload: string }
  | { type: 'UPDATE_INTERFACE_COMPLEXITY'; payload: ContextualIntelligenceState['interfaceComplexity'] }
  | { type: 'UPDATE_DATA_FILTERS'; payload: Partial<ContextualIntelligenceState['dataFilters']> }
  | { type: 'LEARN_PATTERN'; payload: { pattern: string; data: any } }
  | { type: 'ADAPT_INTERFACE'; payload: { change: string; success: boolean } };

const contextualIntelligenceReducer = (
  state: ContextualIntelligenceState, 
  action: ContextualIntelligenceAction
): ContextualIntelligenceState => {
  switch (action.type) {
    case 'UPDATE_USER_INTENT':
      return {
        ...state,
        userIntent: { ...state.userIntent, ...action.payload, lastUpdated: new Date() }
      };

    case 'UPDATE_BUSINESS_CONTEXT':
      return {
        ...state,
        businessContext: { ...state.businessContext, ...action.payload }
      };

    case 'UPDATE_PSYCHOLOGICAL_STATE':
      return {
        ...state,
        psychologicalState: { ...state.psychologicalState, ...action.payload }
      };

    case 'ADD_RECOMMENDATION':
      return {
        ...state,
        adaptiveRecommendations: [...state.adaptiveRecommendations, action.payload]
      };

    case 'REMOVE_RECOMMENDATION':
      return {
        ...state,
        adaptiveRecommendations: state.adaptiveRecommendations.filter(r => r.id !== action.payload)
      };

    case 'UPDATE_INTERFACE_COMPLEXITY':
      return {
        ...state,
        interfaceComplexity: action.payload
      };

    case 'UPDATE_DATA_FILTERS':
      return {
        ...state,
        dataFilters: { ...state.dataFilters, ...action.payload }
      };

    case 'LEARN_PATTERN':
      return {
        ...state,
        learning: {
          ...state.learning,
          userPatterns: {
            ...state.learning.userPatterns,
            [action.payload.pattern]: action.payload.data
          }
        }
      };

    case 'ADAPT_INTERFACE':
      return {
        ...state,
        learning: {
          ...state.learning,
          adaptationHistory: [
            ...state.learning.adaptationHistory,
            {
              timestamp: new Date(),
              change: action.payload.change,
              success: action.payload.success
            }
          ]
        }
      };

    default:
      return state;
  }
};

const ContextualIntelligenceContext = createContext<{
  state: ContextualIntelligenceState;
  updateUserIntent: (intent: Partial<UserIntent>) => void;
  updateBusinessContext: (context: Partial<BusinessContext>) => void;
  updatePsychologicalState: (state: Partial<PsychologicalState>) => void;
  addRecommendation: (recommendation: AdaptiveRecommendation) => void;
  removeRecommendation: (id: string) => void;
  updateInterfaceComplexity: (complexity: ContextualIntelligenceState['interfaceComplexity']) => void;
  updateDataFilters: (filters: Partial<ContextualIntelligenceState['dataFilters']>) => void;
  getFilteredData: (data: any[]) => any[];
  getRecommendations: () => AdaptiveRecommendation[];
  adaptInterface: (change: string, success: boolean) => void;
  analyzeUserBehavior: () => void;
} | null>(null);

export const ContextualIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contextualIntelligenceReducer, initialState);
  const { state: psychState } = usePsychologicalOptimization();
  const { state: momentumState } = useMomentumBanking();

  // Sync with psychological optimization context
  useEffect(() => {
    dispatch({
      type: 'UPDATE_PSYCHOLOGICAL_STATE',
      payload: {
        stressLevel: psychState.adaptiveInterface.stressLevel,
        motivationLevel: psychState.achievementSystem.momentumScore / 100,
        cognitiveLoad: psychState.adaptiveInterface.cognitiveLoad,
        focusMode: psychState.adaptiveInterface.focusMode,
        energyLevel: psychState.adaptiveInterface.energyLevel
      }
    });
  }, [psychState]);

  // Intent recognition based on user behavior
  useEffect(() => {
    const analyzeIntent = () => {
      const { stressLevel, cognitiveLoad, motivationLevel } = state.psychologicalState;
      const { currentBalance, stressBuffer } = momentumState.bank;

      let primaryIntent: UserIntent['primary'] = 'exploring';
      let confidence = 0.5;

      // High stress + low momentum = stressed intent
      if (stressLevel > 0.7 && currentBalance < 50) {
        primaryIntent = 'stressed';
        confidence = 0.9;
      }
      // High motivation + good momentum = executing intent
      else if (motivationLevel > 0.8 && currentBalance > 100) {
        primaryIntent = 'executing';
        confidence = 0.8;
      }
      // Low cognitive load + high energy = planning intent
      else if (cognitiveLoad < 0.3 && state.psychologicalState.energyLevel > 0.8) {
        primaryIntent = 'planning';
        confidence = 0.7;
      }
      // Medium cognitive load = reviewing intent
      else if (cognitiveLoad > 0.5 && cognitiveLoad < 0.8) {
        primaryIntent = 'reviewing';
        confidence = 0.6;
      }

      dispatch({
        type: 'UPDATE_USER_INTENT',
        payload: { primary: primaryIntent, confidence }
      });
    };

    analyzeIntent();
  }, [state.psychologicalState, momentumState.bank]);

  // Interface complexity adaptation
  useEffect(() => {
    const adaptComplexity = () => {
      const { stressLevel, cognitiveLoad, focusMode } = state.psychologicalState;
      const { primary } = state.userIntent;

      let complexity: ContextualIntelligenceState['interfaceComplexity'] = 'standard';

      if (stressLevel > 0.8 || cognitiveLoad > 0.8) {
        complexity = 'minimal';
      } else if (focusMode || primary === 'executing') {
        complexity = 'detailed';
      } else if (primary === 'stressed') {
        complexity = 'minimal';
      } else if (primary === 'planning') {
        complexity = 'expert';
      }

      if (complexity !== state.interfaceComplexity) {
        dispatch({ type: 'UPDATE_INTERFACE_COMPLEXITY', payload: complexity });
      }
    };

    adaptComplexity();
  }, [state.psychologicalState, state.userIntent, state.interfaceComplexity]);

  // Generate adaptive recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const recommendations: AdaptiveRecommendation[] = [];

      // Stress-based recommendations
      if (state.psychologicalState.stressLevel > 0.7) {
        recommendations.push({
          id: 'stress-relief',
          type: 'warning',
          title: 'High Stress Detected',
          description: 'Consider taking a break or using stress reduction tools',
          priority: 'high',
          action: {
            label: 'Open Stress Relief',
            handler: () => console.log('Open stress relief')
          },
          conditions: { stressThreshold: 0.7 }
        });
      }

      // Momentum-based recommendations
      if (momentumState.bank.currentBalance > 200) {
        recommendations.push({
          id: 'momentum-investment',
          type: 'action',
          title: 'High Momentum Available',
          description: 'Consider investing in high-impact activities',
          priority: 'medium',
          action: {
            label: 'View Investment Options',
            handler: () => console.log('View investments')
          },
          conditions: { momentumThreshold: 200 }
        });
      }

      // Goal-based recommendations
      const overdueGoals = state.businessContext.currentGoals.filter(
        goal => goal.deadline && new Date(goal.deadline) < new Date() && goal.progress < 1
      );
      if (overdueGoals.length > 0) {
        recommendations.push({
          id: 'overdue-goals',
          type: 'warning',
          title: 'Overdue Goals',
          description: `${overdueGoals.length} goals are past their deadline`,
          priority: 'high',
          conditions: {}
        });
      }

      // Add new recommendations and remove old ones
      recommendations.forEach(rec => {
        if (!state.adaptiveRecommendations.find(r => r.id === rec.id)) {
          dispatch({ type: 'ADD_RECOMMENDATION', payload: rec });
        }
      });
    };

    generateRecommendations();
  }, [state.psychologicalState, momentumState.bank, state.businessContext, state.adaptiveRecommendations]);

  const updateUserIntent = useCallback((intent: Partial<UserIntent>) => {
    dispatch({ type: 'UPDATE_USER_INTENT', payload: intent });
  }, []);

  const updateBusinessContext = useCallback((context: Partial<BusinessContext>) => {
    dispatch({ type: 'UPDATE_BUSINESS_CONTEXT', payload: context });
  }, []);

  const updatePsychologicalState = useCallback((newState: Partial<PsychologicalState>) => {
    dispatch({ type: 'UPDATE_PSYCHOLOGICAL_STATE', payload: newState });
  }, []);

  const addRecommendation = useCallback((recommendation: AdaptiveRecommendation) => {
    dispatch({ type: 'ADD_RECOMMENDATION', payload: recommendation });
  }, []);

  const removeRecommendation = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_RECOMMENDATION', payload: id });
  }, []);

  const updateInterfaceComplexity = useCallback((complexity: ContextualIntelligenceState['interfaceComplexity']) => {
    dispatch({ type: 'UPDATE_INTERFACE_COMPLEXITY', payload: complexity });
  }, []);

  const updateDataFilters = useCallback((filters: Partial<ContextualIntelligenceState['dataFilters']>) => {
    dispatch({ type: 'UPDATE_DATA_FILTERS', payload: filters });
  }, []);

  const getFilteredData = useCallback((data: any[]) => {
    // Implement data filtering based on current filters
    return data.filter(item => {
      // Time range filtering
      // Priority filtering
      // Category filtering
      return true;
    });
  }, [state.dataFilters]);

  const getRecommendations = useCallback(() => {
    return state.adaptiveRecommendations
      .filter(rec => {
        // Filter recommendations based on current conditions
        if (rec.conditions.stressThreshold && state.psychologicalState.stressLevel < rec.conditions.stressThreshold) {
          return false;
        }
        if (rec.conditions.momentumThreshold && momentumState.bank.currentBalance < rec.conditions.momentumThreshold) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [state.adaptiveRecommendations, state.psychologicalState, momentumState.bank]);

  const adaptInterface = useCallback((change: string, success: boolean) => {
    dispatch({ type: 'ADAPT_INTERFACE', payload: { change, success } });
  }, []);

  const analyzeUserBehavior = useCallback(() => {
    // Analyze user patterns and update learning data
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Learn user's preferred time patterns
    dispatch({
      type: 'LEARN_PATTERN',
      payload: {
        pattern: 'timePreference',
        data: { hour, activity: state.userIntent.primary }
      }
    });
  }, [state.userIntent]);

  const value = {
    state,
    updateUserIntent,
    updateBusinessContext,
    updatePsychologicalState,
    addRecommendation,
    removeRecommendation,
    updateInterfaceComplexity,
    updateDataFilters,
    getFilteredData,
    getRecommendations,
    adaptInterface,
    analyzeUserBehavior
  };

  return (
    <ContextualIntelligenceContext.Provider value={value}>
      {children}
    </ContextualIntelligenceContext.Provider>
  );
};

export const useContextualIntelligence = () => {
  const context = useContext(ContextualIntelligenceContext);
  if (!context) {
    throw new Error('useContextualIntelligence must be used within a ContextualIntelligenceProvider');
  }
  return context;
};

export default ContextualIntelligenceContext;
