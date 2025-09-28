import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Brain,
  Clock,
  ArrowRight,
  Lightbulb,
  Activity,
  Calculator,
  PieChart,
  LineChart,
  Eye,
  Heart,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  Receipt
} from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const RevenueAttributionModal = ({ content, onClose, onApplyRevenueOptimization, hiredAgents = [] }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attributionData, setAttributionData] = useState(null);
  const [selectedOptimizations, setSelectedOptimizations] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (content) {
      analyzeRevenueAttribution();
    }
  }, [content]);

  const analyzeRevenueAttribution = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis for revenue attribution and optimization
    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockAttributionData = {
      analysis_summary: `AI has analyzed the revenue impact potential of this content across your entire customer journey, from initial engagement to final purchase conversion.`,
      
      current_revenue_metrics: {
        content_roi: 4.2,
        cost_per_acquisition: 85,
        lifetime_value: 1240,
        conversion_rate: 3.8,
        revenue_per_post: 340,
        attribution_window: '30 days',
        last_30_days_revenue: 12400
      },

      content_revenue_potential: {
        direct_sales_potential: 890,
        lead_generation_value: 1240,
        brand_awareness_impact: 2100,
        customer_retention_value: 560,
        upsell_cross_sell_potential: 340,
        referral_value: 180,
        total_potential_revenue: 5310
      },

      attribution_analysis: [
        {
          touchpoint: 'Initial Engagement',
          description: 'Content drives initial awareness and engagement',
          revenue_impact: 890,
          attribution_weight: 0.25,
          conversion_path: 'Content → Website Visit → Lead Capture',
          confidence: 0.91,
          optimization_potential: '+35%'
        },
        {
          touchpoint: 'Lead Nurturing',
          description: 'Content nurtures leads through sales funnel',
          revenue_impact: 1240,
          attribution_weight: 0.35,
          conversion_path: 'Content → Email → Demo → Sale',
          confidence: 0.88,
          optimization_potential: '+28%'
        },
        {
          touchpoint: 'Customer Retention',
          description: 'Content maintains customer engagement and loyalty',
          revenue_impact: 560,
          attribution_weight: 0.20,
          conversion_path: 'Content → Engagement → Renewal',
          confidence: 0.85,
          optimization_potential: '+22%'
        },
        {
          touchpoint: 'Upsell/Cross-sell',
          description: 'Content promotes additional products/services',
          revenue_impact: 340,
          attribution_weight: 0.15,
          conversion_path: 'Content → Interest → Upgrade',
          confidence: 0.87,
          optimization_potential: '+40%'
        },
        {
          touchpoint: 'Referral Generation',
          description: 'Content encourages customer referrals',
          revenue_impact: 180,
          attribution_weight: 0.05,
          conversion_path: 'Content → Share → Referral → Sale',
          confidence: 0.82,
          optimization_potential: '+45%'
        }
      ],

      revenue_optimization_strategies: [
        {
          id: 'cta_optimization',
          name: 'Revenue-Focused CTA Optimization',
          description: 'Optimize call-to-actions for maximum conversion and revenue generation',
          current_performance: 3.8,
          expected_improvement: '+45%',
          revenue_impact: 1560,
          implementation: {
            primary_cta: 'Start Your Free Trial - No Credit Card Required',
            secondary_cta: 'Download Our ROI Calculator',
            urgency_elements: ['Limited Time Offer', 'Only 3 Spots Left'],
            value_proposition: 'Save 15 hours per week with our automation'
          },
          confidence: 0.89,
          difficulty: 'Low',
          timeline: '7 days',
          status: 'pending'
        },
        {
          id: 'content_monetization',
          name: 'Content Monetization Strategy',
          description: 'Transform content into revenue-generating opportunities',
          current_performance: 340,
          expected_improvement: '+60%',
          revenue_impact: 2040,
          implementation: {
            product_integration: 'Seamlessly integrate product mentions',
            case_study_highlight: 'Feature customer success stories',
            demo_embedding: 'Include product demo links',
            testimonial_integration: 'Showcase customer testimonials'
          },
          confidence: 0.87,
          difficulty: 'Medium',
          timeline: '14 days',
          status: 'pending'
        },
        {
          id: 'audience_targeting',
          name: 'High-Value Audience Targeting',
          description: 'Target content to high-value customer segments',
          current_performance: 1240,
          expected_improvement: '+38%',
          revenue_impact: 1711,
          implementation: {
            segment_focus: 'Enterprise decision-makers',
            personalized_messaging: 'Customize content for different personas',
            behavioral_targeting: 'Target based on purchase intent',
            retargeting_integration: 'Connect with CRM for retargeting'
          },
          confidence: 0.92,
          difficulty: 'Medium',
          timeline: '10 days',
          status: 'pending'
        },
        {
          id: 'conversion_funnel',
          name: 'Conversion Funnel Optimization',
          description: 'Optimize content for each stage of the customer journey',
          current_performance: 4.2,
          expected_improvement: '+32%',
          revenue_impact: 1428,
          implementation: {
            awareness_content: 'Educational content for top of funnel',
            consideration_content: 'Comparison guides for middle funnel',
            decision_content: 'Case studies and testimonials',
            retention_content: 'Advanced tips for existing customers'
          },
          confidence: 0.86,
          difficulty: 'High',
          timeline: '21 days',
          status: 'pending'
        }
      ],

      crm_integration: {
        connected_systems: ['Salesforce', 'HubSpot', 'Pipedrive', 'Intercom'],
        data_sources: ['Website Analytics', 'Email Campaigns', 'Social Media', 'Customer Support'],
        attribution_model: 'Multi-touch Attribution',
        tracking_capabilities: [
          'Lead source tracking',
          'Content engagement scoring',
          'Revenue attribution by content',
          'Customer journey mapping',
          'ROI calculation per content piece'
        ],
        integration_status: 'Fully Connected',
        data_freshness: 'Real-time',
        accuracy_score: 0.94
      },

      financial_intelligence: {
        roi_calculation: {
          content_cost: 150,
          expected_revenue: 5310,
          projected_roi: 3540,
          roi_percentage: 2360,
          payback_period: '12 days'
        },
        revenue_forecasting: {
          conservative: 4200,
          realistic: 5310,
          optimistic: 6800,
          confidence_interval: '85%'
        },
        cost_optimization: {
          current_cpa: 85,
          optimized_cpa: 58,
          savings_potential: 32,
          efficiency_gain: '+38%'
        }
      },

      agent_contributions: {
        crm_agent: {
          confidence: 0.93,
          insight: 'Identified high-value customer segments with highest revenue potential',
          contribution: 'Connected content performance to actual sales data and customer lifetime value'
        },
        financial_intelligence_agent: {
          confidence: 0.91,
          insight: 'Content ROI can be improved by 236% through strategic optimization',
          contribution: 'Calculated detailed ROI projections and revenue attribution models'
        },
        analytics_agent: {
          confidence: 0.88,
          insight: 'Multi-touch attribution shows content drives 65% of qualified leads',
          contribution: 'Analyzed customer journey data to identify optimal revenue touchpoints'
        }
      },

      revenue_insights: {
        top_performing_content_types: ['Case Studies', 'Product Demos', 'Customer Success Stories'],
        highest_roi_channels: ['LinkedIn', 'Email Newsletter', 'Blog'],
        best_converting_ctas: ['Free Trial', 'ROI Calculator', 'Consultation'],
        optimal_posting_times: ['Tuesday 2PM', 'Wednesday 3PM', 'Thursday 2PM'],
        customer_segments: ['Enterprise (65% of revenue)', 'Mid-market (28% of revenue)', 'SMB (7% of revenue)']
      },

      overall_confidence: 0.90,
      revenue_phase: 'Advanced - Comprehensive revenue attribution analysis complete',
      next_optimization: 'Implement revenue-focused content optimization strategies'
    };

    setAttributionData(mockAttributionData);
    setIsAnalyzing(false);
  };

  const handleToggleOptimization = (optimizationId) => {
    setSelectedOptimizations(prev =>
      prev.includes(optimizationId)
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    );
  };

  const handleApplyRevenueOptimization = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const applied = attributionData.revenue_optimization_strategies.filter(strategy => 
      selectedOptimizations.includes(strategy.id)
    );

    // Create optimized content with revenue focus
    const optimizedContent = {
      ...content,
      revenue_optimized: true,
      revenue_strategies_applied: applied.map(s => s.name),
      expected_revenue_impact: applied.reduce((total, s) => total + s.revenue_impact, 0),
      roi_projection: attributionData.financial_intelligence.roi_calculation.projected_roi,
      attribution_confidence: attributionData.overall_confidence,
      version_history: [...(content.version_history || []), {
        id: `revenue_optimization_${Date.now()}`,
        version: `${parseFloat(content?.version || '1.0') + 0.1}`,
        timestamp: new Date().toISOString(),
        author: 'AI Revenue Attribution System',
        changes: [`Applied revenue optimization strategies: ${applied.map(s => s.name).join(', ')}`],
        status: 'revenue_optimized',
        content_snapshot: { ...content, revenue_optimized: true }
      }]
    };

    onApplyRevenueOptimization(optimizedContent, applied);
    setIsApplying(false);
    onClose();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTouchpointIcon = (touchpoint) => {
    switch (touchpoint) {
      case 'Initial Engagement': return <Eye className="w-4 h-4" />;
      case 'Lead Nurturing': return <Users className="w-4 h-4" />;
      case 'Customer Retention': return <Heart className="w-4 h-4" />;
      case 'Upsell/Cross-sell': return <ShoppingCart className="w-4 h-4" />;
      case 'Referral Generation': return <MessageSquare className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-7xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center justify-between p-6 border-b -mx-6 -mt-6 mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Attribution</h2>
              <p className="text-sm text-gray-600">
                AI-powered revenue analysis and optimization for maximum ROI
              </p>
            </div>
          </div>
          {attributionData && (
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-green-500" />
              <ConfidenceScore score={attributionData.overall_confidence} size="medium" />
            </div>
          )}
        </div>

        {isAnalyzing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Revenue Impact...</h3>
            <p className="text-gray-600 mb-6">
              AI agents are connecting content performance to revenue data and customer journey analytics.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analyzing customer journey and attribution data</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Calculating revenue impact across all touchpoints</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Identifying high-value optimization opportunities</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Developing revenue-focused optimization strategies</span>
              </div>
            </div>
          </div>
        ) : attributionData ? (
          <div className="space-y-6">
            {/* Current Revenue Metrics */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Current Revenue Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{attributionData.current_revenue_metrics.content_roi}x</div>
                  <div className="text-sm text-gray-600">Content ROI</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">${attributionData.current_revenue_metrics.cost_per_acquisition}</div>
                  <div className="text-sm text-gray-600">Cost Per Acquisition</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">${attributionData.current_revenue_metrics.lifetime_value}</div>
                  <div className="text-sm text-gray-600">Customer LTV</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">${attributionData.current_revenue_metrics.last_30_days_revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">30-Day Revenue</div>
                </div>
              </div>
            </div>

            {/* Revenue Potential */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Content Revenue Potential
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Direct Sales</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">${attributionData.content_revenue_potential.direct_sales_potential}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Lead Generation</span>
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">${attributionData.content_revenue_potential.lead_generation_value}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Brand Awareness</span>
                    <Eye className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">${attributionData.content_revenue_potential.brand_awareness_impact}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Customer Retention</span>
                    <Heart className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">${attributionData.content_revenue_potential.customer_retention_value}</div>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Upsell/Cross-sell</span>
                    <ShoppingCart className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-bold text-teal-600">${attributionData.content_revenue_potential.upsell_cross_sell_potential}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Referrals</span>
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">${attributionData.content_revenue_potential.referral_value}</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Revenue Potential</span>
                  <span className="text-3xl font-bold text-green-600">${attributionData.content_revenue_potential.total_potential_revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Attribution Analysis */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Revenue Attribution Analysis
              </h3>
              <div className="space-y-4">
                {attributionData.attribution_analysis.map((touchpoint, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getTouchpointIcon(touchpoint.touchpoint)}
                        <div>
                          <span className="font-medium text-gray-900">{touchpoint.touchpoint}</span>
                          <div className="text-sm text-gray-600">{touchpoint.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">${touchpoint.revenue_impact}</span>
                        <ConfidenceScore score={touchpoint.confidence} size="small" showDetails={false} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Attribution Weight:</span>
                        <span className="ml-2 text-blue-600 font-medium">{Math.round(touchpoint.attribution_weight * 100)}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Conversion Path:</span>
                        <span className="ml-2 text-gray-600">{touchpoint.conversion_path}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Optimization Potential:</span>
                        <span className="ml-2 text-green-600 font-medium">{touchpoint.optimization_potential}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Optimization Strategies */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-600" />
                Revenue Optimization Strategies
              </h3>
              <div className="space-y-4">
                {attributionData.revenue_optimization_strategies.map((strategy) => (
                  <label key={strategy.id} className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedOptimizations.includes(strategy.id) 
                      ? 'bg-green-50 border-green-400 shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOptimizations.includes(strategy.id)}
                      onChange={() => handleToggleOptimization(strategy.id)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{strategy.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(strategy.difficulty)}`}>
                            {strategy.difficulty}
                          </span>
                          <ConfidenceScore score={strategy.confidence} size="small" showDetails={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Performance Impact</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Current:</span>
                              <span className="font-medium">{strategy.current_performance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expected:</span>
                              <span className="font-medium text-green-600">{strategy.expected_improvement}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue Impact:</span>
                              <span className="font-medium text-blue-600">${strategy.revenue_impact}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Implementation</h4>
                          <div className="text-sm space-y-1">
                            {Object.entries(strategy.implementation).slice(0, 2).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                                <div className="text-gray-600 text-xs">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Timeline: {strategy.timeline}</span>
                        <span className="text-gray-500">Status: {strategy.status}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* CRM Integration */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-indigo-600" />
                CRM & Financial Intelligence Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Connected Systems</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CRM Systems:</span>
                      <span className="font-medium">{attributionData.crm_integration.connected_systems.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Attribution Model:</span>
                      <span className="font-medium">{attributionData.crm_integration.attribution_model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Data Freshness:</span>
                      <span className="font-medium text-green-600">{attributionData.crm_integration.data_freshness}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Accuracy Score:</span>
                      <span className="font-medium text-blue-600">{Math.round(attributionData.crm_integration.accuracy_score * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">ROI Calculation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Content Cost:</span>
                      <span className="font-medium">${attributionData.financial_intelligence.roi_calculation.content_cost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expected Revenue:</span>
                      <span className="font-medium text-green-600">${attributionData.financial_intelligence.roi_calculation.expected_revenue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Projected ROI:</span>
                      <span className="font-medium text-blue-600">{attributionData.financial_intelligence.roi_calculation.roi_percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payback Period:</span>
                      <span className="font-medium">{attributionData.financial_intelligence.roi_calculation.payback_period}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Contributions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Agent Contributions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(attributionData.agent_contributions).map(([agentId, contribution]) => (
                  <div key={agentId} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {agentId.replace(/_/g, ' ')} Agent
                      </span>
                      <ConfidenceScore score={contribution.confidence} size="small" showDetails={false} />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{contribution.insight}</p>
                    <p className="text-xs text-blue-600">{contribution.contribution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t p-6 -mx-6 -mb-6 mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyRevenueOptimization}
            disabled={selectedOptimizations.length === 0 || isApplying}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying Optimizations...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Apply {selectedOptimizations.length} Revenue Strategy
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RevenueAttributionModal;
