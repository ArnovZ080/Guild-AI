import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { usePsychologicalOptimization } from './PsychologicalOptimizationContext';

interface MomentumTransaction {
  id: string;
  type: 'earn' | 'spend' | 'compound' | 'stress_buffer';
  amount: number;
  description: string;
  timestamp: Date;
  multiplier?: number;
}

interface MomentumBank {
  currentBalance: number;
  totalEarned: number;
  dailyRate: number;
  compoundMultiplier: number;
  stressBuffer: number;
  streakBonus: number;
  transactions: MomentumTransaction[];
  lastCompoundTime: Date;
  stressBufferUsed: number;
}

interface MomentumBankingState {
  bank: MomentumBank;
  preferences: {
    autoCompound: boolean;
    stressBufferThreshold: number;
    compoundFrequency: number; // hours
    maxStressBuffer: number;
  };
  achievements: {
    firstDeposit: boolean;
    compoundMaster: boolean;
    stressResilient: boolean;
    momentumMillionaire: boolean;
  };
}

const initialState: MomentumBankingState = {
  bank: {
    currentBalance: 100,
    totalEarned: 150,
    dailyRate: 5,
    compoundMultiplier: 1.02,
    stressBuffer: 50,
    streakBonus: 1.1,
    transactions: [],
    lastCompoundTime: new Date(),
    stressBufferUsed: 0
  },
  preferences: {
    autoCompound: true,
    stressBufferThreshold: 0.7,
    compoundFrequency: 24,
    maxStressBuffer: 200
  },
  achievements: {
    firstDeposit: true,
    compoundMaster: false,
    stressResilient: false,
    momentumMillionaire: false
  }
};

type MomentumBankingAction =
  | { type: 'EARN_MOMENTUM'; payload: { amount: number; source: string; multiplier?: number } }
  | { type: 'SPEND_MOMENTUM'; payload: { amount: number; purpose: string } }
  | { type: 'COMPOUND_INTEREST' }
  | { type: 'USE_STRESS_BUFFER'; payload: { amount: number } }
  | { type: 'RESTORE_STRESS_BUFFER'; payload: { amount: number } }
  | { type: 'UPDATE_STREAK_BONUS'; payload: { bonus: number } }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<MomentumBankingState['preferences']> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievement: keyof MomentumBankingState['achievements'] } };

const momentumBankingReducer = (state: MomentumBankingState, action: MomentumBankingAction): MomentumBankingState => {
  switch (action.type) {
    case 'EARN_MOMENTUM': {
      const { amount, source, multiplier = 1 } = action.payload;
      const finalAmount = amount * multiplier * state.bank.streakBonus;
      const newTransaction: MomentumTransaction = {
        id: `earn-${Date.now()}`,
        type: 'earn',
        amount: finalAmount,
        description: `Earned from ${source}`,
        timestamp: new Date(),
        multiplier
      };

      return {
        ...state,
        bank: {
          ...state.bank,
          currentBalance: state.bank.currentBalance + finalAmount,
          totalEarned: state.bank.totalEarned + finalAmount,
          transactions: [...state.bank.transactions, newTransaction]
        }
      };
    }

    case 'SPEND_MOMENTUM': {
      const { amount, purpose } = action.payload;
      if (state.bank.currentBalance < amount) {
        // Not enough momentum - could trigger stress buffer or denial
        return state;
      }

      const newTransaction: MomentumTransaction = {
        id: `spend-${Date.now()}`,
        type: 'spend',
        amount: -amount,
        description: `Spent on ${purpose}`,
        timestamp: new Date()
      };

      return {
        ...state,
        bank: {
          ...state.bank,
          currentBalance: state.bank.currentBalance - amount,
          transactions: [...state.bank.transactions, newTransaction]
        }
      };
    }

    case 'COMPOUND_INTEREST': {
      const hoursSinceLastCompound = (Date.now() - state.bank.lastCompoundTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastCompound < state.preferences.compoundFrequency) {
        return state;
      }

      const compoundAmount = state.bank.currentBalance * (state.bank.compoundMultiplier - 1);
      const newTransaction: MomentumTransaction = {
        id: `compound-${Date.now()}`,
        type: 'compound',
        amount: compoundAmount,
        description: 'Compound interest',
        timestamp: new Date()
      };

      return {
        ...state,
        bank: {
          ...state.bank,
          currentBalance: state.bank.currentBalance + compoundAmount,
          totalEarned: state.bank.totalEarned + compoundAmount,
          transactions: [...state.bank.transactions, newTransaction],
          lastCompoundTime: new Date()
        }
      };
    }

    case 'USE_STRESS_BUFFER': {
      const { amount } = action.payload;
      const availableBuffer = Math.min(amount, state.bank.stressBuffer - state.bank.stressBufferUsed);
      
      if (availableBuffer <= 0) return state;

      const newTransaction: MomentumTransaction = {
        id: `stress-buffer-${Date.now()}`,
        type: 'stress_buffer',
        amount: availableBuffer,
        description: 'Stress buffer used',
        timestamp: new Date()
      };

      return {
        ...state,
        bank: {
          ...state.bank,
          currentBalance: state.bank.currentBalance + availableBuffer,
          stressBufferUsed: state.bank.stressBufferUsed + availableBuffer,
          transactions: [...state.bank.transactions, newTransaction]
        }
      };
    }

    case 'RESTORE_STRESS_BUFFER': {
      const { amount } = action.payload;
      const restored = Math.min(amount, state.bank.stressBufferUsed);
      
      return {
        ...state,
        bank: {
          ...state.bank,
          stressBufferUsed: state.bank.stressBufferUsed - restored
        }
      };
    }

    case 'UPDATE_STREAK_BONUS': {
      return {
        ...state,
        bank: {
          ...state.bank,
          streakBonus: action.payload.bonus
        }
      };
    }

    case 'UPDATE_PREFERENCES': {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      return {
        ...state,
        achievements: {
          ...state.achievements,
          [action.payload.achievement]: true
        }
      };
    }

    default:
      return state;
  }
};

const MomentumBankingContext = createContext<{
  state: MomentumBankingState;
  earnMomentum: (amount: number, source: string, multiplier?: number) => void;
  spendMomentum: (amount: number, purpose: string) => boolean;
  compoundInterest: () => void;
  useStressBuffer: (amount: number) => number;
  restoreStressBuffer: (amount: number) => void;
  updateStreakBonus: (bonus: number) => void;
  updatePreferences: (preferences: Partial<MomentumBankingState['preferences']>) => void;
  getMomentumScore: () => number;
  getStressResilience: () => number;
  canAfford: (amount: number) => boolean;
} | null>(null);

export const MomentumBankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(momentumBankingReducer, initialState);
  const { state: psychState } = usePsychologicalOptimization();

  // Auto-compound interest
  useEffect(() => {
    if (!state.preferences.autoCompound) return;

    const interval = setInterval(() => {
      dispatch({ type: 'COMPOUND_INTEREST' });
    }, state.preferences.compoundFrequency * 60 * 60 * 1000); // Convert hours to milliseconds

    return () => clearInterval(interval);
  }, [state.preferences.autoCompound, state.preferences.compoundFrequency]);

  // Stress buffer management
  useEffect(() => {
    if (psychState.adaptiveInterface.stressLevel > state.preferences.stressBufferThreshold) {
      // Auto-use stress buffer when stress is high
      const stressAmount = Math.min(20, state.bank.stressBuffer - state.bank.stressBufferUsed);
      if (stressAmount > 0) {
        dispatch({ type: 'USE_STRESS_BUFFER', payload: { amount: stressAmount } });
      }
    } else if (psychState.adaptiveInterface.stressLevel < 0.3) {
      // Restore stress buffer when stress is low
      const restoreAmount = Math.min(10, state.bank.stressBufferUsed);
      if (restoreAmount > 0) {
        dispatch({ type: 'RESTORE_STRESS_BUFFER', payload: { amount: restoreAmount } });
      }
    }
  }, [psychState.adaptiveInterface.stressLevel, state.bank.stressBuffer, state.bank.stressBufferUsed, state.preferences.stressBufferThreshold]);

  // Achievement tracking
  useEffect(() => {
    if (state.bank.totalEarned > 1000 && !state.achievements.momentumMillionaire) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievement: 'momentumMillionaire' } });
    }
    if (state.bank.compoundMultiplier > 1.1 && !state.achievements.compoundMaster) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievement: 'compoundMaster' } });
    }
    if (state.bank.stressBufferUsed === 0 && state.bank.stressBuffer === state.preferences.maxStressBuffer && !state.achievements.stressResilient) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievement: 'stressResilient' } });
    }
  }, [state.bank.totalEarned, state.bank.compoundMultiplier, state.bank.stressBuffer, state.bank.stressBufferUsed, state.preferences.maxStressBuffer, state.achievements]);

  const earnMomentum = useCallback((amount: number, source: string, multiplier: number = 1) => {
    dispatch({ type: 'EARN_MOMENTUM', payload: { amount, source, multiplier } });
  }, []);

  const spendMomentum = useCallback((amount: number, purpose: string): boolean => {
    if (state.bank.currentBalance >= amount) {
      dispatch({ type: 'SPEND_MOMENTUM', payload: { amount, purpose } });
      return true;
    }
    return false;
  }, [state.bank.currentBalance]);

  const compoundInterest = useCallback(() => {
    dispatch({ type: 'COMPOUND_INTEREST' });
  }, []);

  const useStressBuffer = useCallback((amount: number): number => {
    const availableBuffer = Math.min(amount, state.bank.stressBuffer - state.bank.stressBufferUsed);
    if (availableBuffer > 0) {
      dispatch({ type: 'USE_STRESS_BUFFER', payload: { amount: availableBuffer } });
    }
    return availableBuffer;
  }, [state.bank.stressBuffer, state.bank.stressBufferUsed]);

  const restoreStressBuffer = useCallback((amount: number) => {
    dispatch({ type: 'RESTORE_STRESS_BUFFER', payload: { amount } });
  }, []);

  const updateStreakBonus = useCallback((bonus: number) => {
    dispatch({ type: 'UPDATE_STREAK_BONUS', payload: { bonus } });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<MomentumBankingState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const getMomentumScore = useCallback(() => {
    return Math.min(100, Math.round((state.bank.currentBalance / 1000) * 100));
  }, [state.bank.currentBalance]);

  const getStressResilience = useCallback(() => {
    const bufferRatio = (state.bank.stressBuffer - state.bank.stressBufferUsed) / state.bank.stressBuffer;
    return Math.round(bufferRatio * 100);
  }, [state.bank.stressBuffer, state.bank.stressBufferUsed]);

  const canAfford = useCallback((amount: number) => {
    return state.bank.currentBalance >= amount;
  }, [state.bank.currentBalance]);

  const value = {
    state,
    earnMomentum,
    spendMomentum,
    compoundInterest,
    useStressBuffer,
    restoreStressBuffer,
    updateStreakBonus,
    updatePreferences,
    getMomentumScore,
    getStressResilience,
    canAfford
  };

  return (
    <MomentumBankingContext.Provider value={value}>
      {children}
    </MomentumBankingContext.Provider>
  );
};

export const useMomentumBanking = () => {
  const context = useContext(MomentumBankingContext);
  if (!context) {
    throw new Error('useMomentumBanking must be used within a MomentumBankingProvider');
  }
  return context;
};

export default MomentumBankingContext;
