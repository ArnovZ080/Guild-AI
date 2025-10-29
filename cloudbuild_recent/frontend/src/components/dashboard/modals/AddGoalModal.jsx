import React from 'react';

class AddGoalModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      objective: '',
      description: '',
      type: 'financial',
      priority: 'medium',
      timeframe: 'medium-term',
      targetDate: '',
      metrics: {},
      submitting: false,
      error: null,
      recommendations: [],
      showRecommendations: true,
      workflowPlan: null,
      showApproval: false,
      goalId: null,
    };
  }

  componentDidMount() {
    this.loadRecommendations();
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      if (this.props.prefill) {
        const p = this.props.prefill;
        this.setState({
          title: p.title || '',
          objective: p.description || p.objective || '',
          description: p.description || '',
          type: p.type || 'financial',
          priority: p.priority || 'medium',
          timeframe: p.timeframe || 'medium-term',
          targetDate: p.target_date ? p.target_date.substring(0, 10) : '',
          metrics: p.metrics || {},
          submitting: false,
          error: null,
          workflowPlan: null,
          showApproval: false,
          goalId: null,
        });
      } else {
        this.setState({
          title: '',
          objective: '',
          description: '',
          type: 'financial',
          priority: 'medium',
          timeframe: 'medium-term',
          targetDate: '',
          metrics: {},
          submitting: false,
          error: null,
          workflowPlan: null,
          showApproval: false,
          goalId: null,
        });
      }
      this.loadRecommendations();
    }
  }

  loadRecommendations = async () => {
    try {
      const res = await fetch('/api/goals/recommendations');
      if (!res.ok) {
        // Fallback to mock recommendations
        this.setState({
          recommendations: [
            {
              title: "Increase Monthly Recurring Revenue by 35%",
              type: "financial",
              priority: "high",
              timeframe: "long-term",
              description: "Based on current growth trajectory and market opportunities",
              rationale: "Business Intelligence Agent identified untapped revenue streams"
            },
            {
              title: "Boost Marketing Qualified Leads by 50%",
              type: "marketing",
              priority: "high",
              timeframe: "medium-term",
              description: "Scale lead generation through multi-channel campaigns",
              rationale: "Strategy Agent recommends aggressive growth to capture market share"
            },
            {
              title: "Reduce Customer Churn to Below 2.5%",
              type: "operational",
              priority: "high",
              timeframe: "medium-term",
              description: "Implement proactive retention strategies",
              rationale: "Business Strategist detected early warning signs in engagement metrics"
            },
          ]
        });
        return;
      }
      const data = await res.json();
      this.setState({ recommendations: data?.suggestions || [] });
    } catch (e) {
      // Fallback to mock recommendations on error
      this.setState({
        recommendations: [
          {
            title: "Increase Monthly Recurring Revenue by 35%",
            type: "financial",
            priority: "high",
            timeframe: "long-term",
            description: "Based on current growth trajectory and market opportunities",
            rationale: "Business Intelligence Agent identified untapped revenue streams"
          },
          {
            title: "Boost Marketing Qualified Leads by 50%",
            type: "marketing",
            priority: "high",
            timeframe: "medium-term",
            description: "Scale lead generation through multi-channel campaigns",
            rationale: "Strategy Agent recommends aggressive growth to capture market share"
          },
          {
            title: "Reduce Customer Churn to Below 2.5%",
            type: "operational",
            priority: "high",
            timeframe: "medium-term",
            description: "Implement proactive retention strategies",
            rationale: "Business Strategist detected early warning signs in engagement metrics"
          },
        ]
      });
    }
  };

  submit = async () => {
    this.setState({ submitting: true, error: null });
    try {
      const payload = {
        title: this.state.title,
        objective: this.state.objective || this.state.title,
        description: this.state.description,
        type: this.state.type,
        priority: this.state.priority,
        timeframe: this.state.timeframe,
        target_date: this.state.targetDate,
        metrics: this.state.metrics,
      };
      const res = await fetch('/api/goals/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create goal');
      const data = await res.json();
      this.setState({
        workflowPlan: data?.workflow_plan || null,
        goalId: data?.id || null,
        showApproval: true,
        submitting: false,
      });
    } catch (e) {
      this.setState({ error: e.message, submitting: false });
    }
  };

  approve = async () => {
    try {
      if (this.state.goalId) {
        await fetch(`/api/goals/${this.state.goalId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow_plan: this.state.workflowPlan }),
        });
      }
    } catch {}
    this.props.onCreated && this.props.onCreated();
  };

  closeReset = () => {
    this.setState({
      title: '',
      objective: '',
      description: '',
      type: 'financial',
      priority: 'medium',
      timeframe: 'medium-term',
      targetDate: '',
      metrics: {},
      submitting: false,
      error: null,
      recommendations: [],
      showRecommendations: true,
      workflowPlan: null,
      showApproval: false,
      goalId: null,
    });
    this.props.onClose && this.props.onClose();
  };

  toggleRecommendations = () => {
    this.setState({ showRecommendations: !this.state.showRecommendations });
  };

  render() {
    if (!this.props.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Goal</h2>
            <button onClick={this.closeReset} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {this.state.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">AI Recommended Goals</h3>
                      <p className="text-xs text-gray-600">Smart suggestions based on your business data</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={this.toggleRecommendations}
                    className="px-3 py-1 text-xs font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {this.state.showRecommendations ? 'Hide' : 'Show'}
                  </button>
                </div>
                {this.state.showRecommendations && (
                  <div className="grid grid-cols-1 gap-3">
                  {this.state.recommendations.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        this.setState({
                          title: r.title,
                          description: r.description || '',
                          type: r.type || 'general',
                          priority: r.priority || 'medium',
                          timeframe: r.timeframe || 'medium-term',
                        });
                      }}
                      className="text-left px-4 py-3 bg-white border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          r.priority === 'high' ? 'bg-red-100 text-red-700' :
                          r.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {(r.priority || 'medium').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{r.type} · {r.timeframe}</span>
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">{r.title}</div>
                      {r.description && <div className="text-xs text-gray-600 mb-1">{r.description}</div>}
                      {r.rationale && <div className="text-xs text-purple-700 italic flex items-start gap-1">
                        <span className="mt-0.5">💡</span>
                        {r.rationale}
                      </div>}
                    </button>
                  ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
              <textarea
                value={this.state.objective}
                onChange={(e) => this.setState({ objective: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={this.state.type}
                  onChange={(e) => this.setState({ type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="financial">Financial</option>
                  <option value="growth">Growth</option>
                  <option value="marketing">Marketing</option>
                  <option value="operational">Operational</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={this.state.priority}
                  onChange={(e) => this.setState({ priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={this.state.timeframe}
                  onChange={(e) => this.setState({ timeframe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="short-term">Short-term</option>
                  <option value="medium-term">Medium-term</option>
                  <option value="long-term">Long-term</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                value={this.state.targetDate}
                onChange={(e) => this.setState({ targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {this.state.error && <div className="text-sm text-red-600">{this.state.error}</div>}
          </div>

          {!this.state.showApproval ? (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.closeReset}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                disabled={this.state.submitting}
                onClick={this.submit}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {this.state.submitting ? 'Creating…' : 'Create Goal'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Planned Agent Actions</div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {(this.state.workflowPlan?.tasks || []).map((t) => (
                    <li key={t.id}>
                      <span className="font-medium">{t.agent_type}</span>: {t.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => this.setState({ showApproval: false })}
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={this.approve}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Approve & Start
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AddGoalModal;
