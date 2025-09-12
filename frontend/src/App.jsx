import React from 'react';
import './App.css';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Guild AI Dashboard
          </h1>
          <p className="text-lg text-blue-700">
            Your AI Workforce Platform
          </p>
        </header>

        {/* Command Center */}
        <section className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Command Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <h3 className="font-medium text-blue-800">Metric {item}</h3>
                <p className="text-2xl font-bold text-blue-600">{item * 28}%</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Theater */}
        <section className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Action Theater</h2>
          <div className="relative h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-blue-200 p-4">
            {/* Agent 1 */}
            <div className="absolute top-1/4 left-1/4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              🔍
            </div>
            {/* Agent 2 */}
            <div className="absolute top-1/3 right-1/3 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              📈
            </div>
            {/* Agent 3 */}
            <div className="absolute bottom-1/4 right-1/4 bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              💼
            </div>
            {/* Connection line */}
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border-t-2 border-blue-300"></div>
          </div>
        </section>

        {/* Opportunity Horizon */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Opportunity Horizon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Growth', 'Optimization', 'Planning'].map((item, index) => (
              <div 
                key={item}
                className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200"
              >
                <h3 className="font-medium text-amber-800">{item}</h3>
                <p className="text-sm text-amber-600">
                  Future opportunity {index + 1} description goes here
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;