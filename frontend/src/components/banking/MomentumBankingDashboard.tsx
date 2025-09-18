import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMomentumBanking } from '../../contexts/MomentumBankingContext';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap, 
  Target, 
  Clock, 
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Settings,
  Award,
  AlertTriangle
} from 'lucide-react';

export const MomentumBankingDashboard: React.FC = () => {
  const { 
    state, 
    earnMomentum, 
    spendMomentum, 
    compoundInterest, 
    useStressBuffer, 
    restoreStressBuffer,
    getMomentumScore,
    getStressResilience,
    canAfford
  } = useMomentumBanking();
  
  const { getCurrentMode } = usePsychologicalOptimization();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'settings'>('overview');
  const [showSettings, setShowSettings] = useState(false);

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          text: 'text-sky-dusk',
          accent: 'sky-dawn',
          card: 'bg-white/90'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          text: 'text-earth-sand',
          accent: 'earth-warm',
          card: 'bg-white/85'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
    }
  };

  const modeStyles = getModeStyles();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MOM', // Momentum currency
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBalanceColor = () => {
    if (state.bank.currentBalance > 500) return 'text-green-600';
    if (state.bank.currentBalance > 200) return 'text-blue-600';
    if (state.bank.currentBalance > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStressBufferColor = () => {
    const resilience = getStressResilience();
    if (resilience > 80) return 'text-green-600';
    if (resilience > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Simulate earning momentum from tasks
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const sources = ['Task Completion', 'Goal Achievement', 'Agent Efficiency', 'User Engagement'];
        const source = sources[Math.floor(Math.random() * sources.length)];
        earnMomentum(5 + Math.random() * 15, source, 1 + Math.random() * 0.5);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [earnMomentum]);

  return (
    <div className={`w-full max-w-6xl mx-auto bg-gradient-to-br ${modeStyles.background} rounded-xl p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${modeStyles.text} mb-2`}>
            🏦 Momentum Banking System
          </h2>
          <p className="text-gray-600">Your psychological momentum economy</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Balance Display */}
      <div className={`${modeStyles.card} rounded-xl p-6 mb-6 shadow-lg`}>
        <div className="text-center">
          <motion.div
            className={`text-5xl font-bold ${getBalanceColor()} mb-2`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatCurrency(state.bank.currentBalance)}
          </motion.div>
          <div className="text-gray-600 mb-4">Current Momentum Balance</div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(state.bank.totalEarned)}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(state.bank.dailyRate)}
              </div>
              <div className="text-sm text-gray-600">Daily Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {state.bank.compoundMultiplier.toFixed(2)}x
              </div>
              <div className="text-sm text-gray-600">Compound Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'transactions', label: 'Transactions', icon: RefreshCw },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Stress Buffer */}
            <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Stress Buffer</h3>
                <Shield className={`w-6 h-6 ${getStressBufferColor()}`} />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Available Buffer</span>
                    <span>{formatCurrency(state.bank.stressBuffer - state.bank.stressBufferUsed)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-red-400 to-green-400 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getStressResilience()}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => useStressBuffer(20)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Use Buffer
                  </button>
                  <button
                    onClick={() => restoreStressBuffer(20)}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    Restore Buffer
                  </button>
                </div>
              </div>
            </div>

            {/* Streak Bonus */}
            <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Streak Bonus</h3>
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {state.bank.streakBonus.toFixed(1)}x
                </div>
                <div className="text-sm text-gray-600 mb-4">Current Multiplier</div>
                <button
                  onClick={() => earnMomentum(10, 'Manual Deposit', state.bank.streakBonus)}
                  className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Test Earn (with bonus)
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg lg:col-span-2`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => compoundInterest()}
                  className="flex items-center space-x-2 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Compound</span>
                </button>
                <button
                  onClick={() => spendMomentum(50, 'Quick Purchase')}
                  className="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  <span className="text-sm">Spend 50</span>
                </button>
                <button
                  onClick={() => earnMomentum(25, 'Manual Task')}
                  className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Earn 25</span>
                </button>
                <button
                  onClick={() => {
                    if (canAfford(100)) {
                      spendMomentum(100, 'Major Investment');
                    }
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    canAfford(100)
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Invest 100</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.bank.transactions.slice(-10).reverse().map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'earn' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'spend' ? 'bg-red-100 text-red-600' :
                      transaction.type === 'compound' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {transaction.type === 'earn' ? <Plus className="w-4 h-4" /> :
                       transaction.type === 'spend' ? <Minus className="w-4 h-4" /> :
                       transaction.type === 'compound' ? <TrendingUp className="w-4 h-4" /> :
                       <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Banking Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Auto Compound</label>
                <input
                  type="checkbox"
                  checked={state.preferences.autoCompound}
                  onChange={(e) => {
                    // This would need to be implemented in the context
                    console.log('Auto compound toggled:', e.target.checked);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Stress Buffer Threshold</label>
                <span className="text-sm text-gray-600">
                  {(state.preferences.stressBufferThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Compound Frequency</label>
                <span className="text-sm text-gray-600">
                  Every {state.preferences.compoundFrequency}h
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Badges */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        <div className="flex space-x-4">
          {Object.entries(state.achievements).map(([achievement, unlocked]) => (
            <div
              key={achievement}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                unlocked ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="text-sm capitalize">{achievement.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MomentumBankingDashboard;
