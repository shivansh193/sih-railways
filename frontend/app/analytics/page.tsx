"use client"
import React, { useState } from 'react';
import Card from '../components/UI/Card';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  const kpiTrends = {
    '24h': { onTime: 89.2, satisfaction: 92.1, efficiency: 87.8, incidents: 3 },
    '7d': { onTime: 87.3, satisfaction: 89.5, efficiency: 85.2, incidents: 18 },
    '30d': { onTime: 85.8, satisfaction: 87.3, efficiency: 83.9, incidents: 72 },
    '90d': { onTime: 84.2, satisfaction: 85.8, efficiency: 82.1, incidents: 203 }
  };

  const modelMetrics = [
    { name: 'Delay Prediction', accuracy: 94.2, precision: 91.8, recall: 89.5 },
    { name: 'Route Optimization', accuracy: 88.7, precision: 85.3, recall: 87.1 },
    { name: 'Capacity Planning', accuracy: 92.1, precision: 90.4, recall: 88.9 },
    { name: 'Incident Detection', accuracy: 96.3, precision: 94.7, recall: 93.2 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Performance Analytics</h1>
        <p className="text-gray-600 mt-2">Historical trends and system performance insights</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['24h', '7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === range 
                ? 'bg-white text-deep-blue shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* KPI Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" borderColor="success">
          <div className="text-center">
            <h3 className="text-sm text-gray-600 font-medium mb-2">On-Time Performance</h3>
            <div className="text-3xl font-bold text-success-green mb-2">
              {kpiTrends[timeRange].onTime}%
            </div>
            <div className="text-xs text-gray-500">
              Avg over {timeRange}
            </div>
          </div>
        </Card>

        <Card className="p-6" borderColor="success">
          <div className="text-center">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Satisfaction Score</h3>
            <div className="text-3xl font-bold text-success-green mb-2">
              {kpiTrends[timeRange].satisfaction}%
            </div>
            <div className="text-xs text-gray-500">
              Passenger feedback
            </div>
          </div>
        </Card>

        <Card className="p-6" borderColor="warning">
          <div className="text-center">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Network Efficiency</h3>
            <div className="text-3xl font-bold text-warning-orange mb-2">
              {kpiTrends[timeRange].efficiency}%
            </div>
            <div className="text-xs text-gray-500">
              Resource utilization
            </div>
          </div>
        </Card>

        <Card className="p-6" borderColor="info">
          <div className="text-center">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Total Incidents</h3>
            <div className="text-3xl font-bold text-cyan-accent mb-2">
              {kpiTrends[timeRange].incidents}
            </div>
            <div className="text-xs text-gray-500">
              Resolved issues
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Trends</h2>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-semibold text-text-primary">Time Series Chart</h3>
              <p className="text-gray-600 text-sm mt-2">Historical performance visualization</p>
            </div>
          </div>
        </Card>

        {/* Model Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">AI Model Performance</h2>
          <div className="space-y-4">
            {modelMetrics.map((model, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-text-primary">{model.name}</h4>
                  <span className="text-sm text-success-green font-medium">{model.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Precision</span>
                    <div className="font-medium">{model.precision}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Recall</span>
                    <div className="font-medium">{model.recall}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">F1-Score</span>
                    <div className="font-medium">
                      {((2 * model.precision * model.recall) / (model.precision + model.recall)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Route Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Route 7A</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-success-green rounded-full"></div>
                </div>
                <span className="text-sm font-medium">89%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Route 3B</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-warning-orange rounded-full"></div>
                </div>
                <span className="text-sm font-medium">76%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Route 9C</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-10 h-2 bg-critical-red rounded-full"></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Peak Hours Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Morning Rush (7-9 AM)</span>
              <span className="text-sm font-medium text-warning-orange">82%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Midday (11 AM-2 PM)</span>
              <span className="text-sm font-medium text-success-green">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Evening Rush (5-7 PM)</span>
              <span className="text-sm font-medium text-warning-orange">78%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Off-Peak</span>
              <span className="text-sm font-medium text-success-green">96%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Cost Savings</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-green mb-2">$2.4M</div>
            <div className="text-sm text-gray-600 mb-4">Total savings this quarter</div>
                          <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fuel Efficiency</span>
                <span className="font-medium text-success-green">$890K</span>
              </div>
              <div className="flex justify-between">
                <span>Delay Reduction</span>
                <span className="font-medium text-success-green">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span>Staff Optimization</span>
                <span className="font-medium text-success-green">$310K</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
