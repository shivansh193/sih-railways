"use client"
import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';

const Monitor: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const systemStatus = [
    { name: 'AI Prediction Service', status: 'operational', uptime: '99.8%', responseTime: '45ms' },
    { name: 'Data Processing Pipeline', status: 'operational', uptime: '99.9%', responseTime: '120ms' },
    { name: 'Real-time Tracking', status: 'operational', uptime: '99.7%', responseTime: '30ms' },
    { name: 'Alert System', status: 'degraded', uptime: '97.2%', responseTime: '180ms' },
    { name: 'Backup Services', status: 'operational', uptime: '100%', responseTime: '25ms' }
  ];

  const apiMetrics = [
    { endpoint: '/api/predictions', calls: '2.4K', avgResponse: '67ms', errorRate: '0.2%' },
    { endpoint: '/api/trains/status', calls: '18.7K', avgResponse: '23ms', errorRate: '0.1%' },
    { endpoint: '/api/recommendations', calls: '890', avgResponse: '156ms', errorRate: '0.3%' },
    { endpoint: '/api/scenarios', calls: '145', avgResponse: '234ms', errorRate: '0.0%' }
  ];

  const dataQualityIndicators = [
    { source: 'Train GPS', quality: 98.5, lastUpdate: '2 sec ago', status: 'good' },
    { source: 'Station Sensors', quality: 95.2, lastUpdate: '1 min ago', status: 'good' },
    { source: 'Weather API', quality: 89.7, lastUpdate: '5 min ago', status: 'warning' },
    { source: 'Traffic Control', quality: 92.1, lastUpdate: '30 sec ago', status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-success-green';
      case 'degraded': return 'text-warning-orange';
      case 'critical': return 'text-critical-red';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-success-green/20 text-success-green';
      case 'degraded': return 'bg-warning-orange/20 text-warning-orange';
      case 'critical': return 'bg-critical-red/20 text-critical-red';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">System Monitor</h1>
          <p className="text-gray-600 mt-2">Real-time system health and performance diagnostics</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium text-text-primary">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-600">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center" borderColor="success">
          <div className="text-3xl font-bold text-success-green mb-2">99.2%</div>
          <div className="text-sm text-gray-600">Overall Uptime</div>
        </Card>
        
        <Card className="p-6 text-center" borderColor="success">
          <div className="text-3xl font-bold text-success-green mb-2">47ms</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </Card>
        
        <Card className="p-6 text-center" borderColor="success">
          <div className="text-3xl font-bold text-success-green mb-2">0.15%</div>
          <div className="text-sm text-gray-600">Error Rate</div>
        </Card>
      </div>

      {/* Service Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Service Status</h2>
        <div className="space-y-4">
          {systemStatus.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'operational' ? 'bg-success-green animate-pulse' :
                  service.status === 'degraded' ? 'bg-warning-orange' : 'bg-critical-red'
                }`}></div>
                <div>
                  <h3 className="font-medium text-text-primary">{service.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <span className="font-medium ml-1">{service.uptime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Response:</span>
                    <span className="font-medium ml-1">{service.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">API Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-sm">
                  <th className="text-left py-2 font-semibold text-text-primary">Endpoint</th>
                  <th className="text-left py-2 font-semibold text-text-primary">Calls/hr</th>
                  <th className="text-left py-2 font-semibold text-text-primary">Response</th>
                  <th className="text-left py-2 font-semibold text-text-primary">Errors</th>
                </tr>
              </thead>
              <tbody>
                {apiMetrics.map((api, index) => (
                  <tr key={index} className="border-b border-gray-100 text-sm">
                    <td className="py-3 font-mono text-xs">{api.endpoint}</td>
                    <td className="py-3 font-medium">{api.calls}</td>
                    <td className="py-3 text-success-green font-medium">{api.avgResponse}</td>
                    <td className="py-3">
                      <span className={`font-medium ${
                        parseFloat(api.errorRate) > 0.5 ? 'text-critical-red' : 'text-success-green'
                      }`}>
                        {api.errorRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Data Quality */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Data Quality Indicators</h2>
          <div className="space-y-4">
            {dataQualityIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">{indicator.source}</h4>
                  <p className="text-xs text-gray-500">{indicator.lastUpdate}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    indicator.quality > 95 ? 'text-success-green' :
                    indicator.quality > 90 ? 'text-warning-orange' : 'text-critical-red'
                  }`}>
                    {indicator.quality}%
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        indicator.quality > 95 ? 'bg-success-green' :
                        indicator.quality > 90 ? 'bg-warning-orange' : 'bg-critical-red'
                      }`}
                      style={{ width: `${indicator.quality}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Logs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Recent System Events</h2>
          <button className="px-3 py-1 text-sm bg-deep-blue text-white rounded-md hover:bg-blue-700 transition-colors">
            View All Logs
          </button>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
          <div>[{currentTime.toLocaleTimeString()}] INFO: Prediction service responding normally</div>
          <div>[{new Date(currentTime.getTime() - 30000).toLocaleTimeString()}] WARN: Alert system response time elevated</div>
          <div>[{new Date(currentTime.getTime() - 60000).toLocaleTimeString()}] INFO: Data pipeline processed 2,340 records</div>
          <div>[{new Date(currentTime.getTime() - 90000).toLocaleTimeString()}] INFO: Cache cleared and refreshed</div>
          <div>[{new Date(currentTime.getTime() - 120000).toLocaleTimeString()}] INFO: Backup completed successfully</div>
          <div>[{new Date(currentTime.getTime() - 180000).toLocaleTimeString()}] ERROR: Temporary connection timeout to weather service</div>
          <div>[{new Date(currentTime.getTime() - 240000).toLocaleTimeString()}] INFO: Weather service connection restored</div>
        </div>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-cyan-accent mb-1">67%</div>
          <div className="text-sm text-gray-600">CPU Usage</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-2/3 h-2 bg-cyan-accent rounded-full"></div>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning-orange mb-1">82%</div>
          <div className="text-sm text-gray-600">Memory Usage</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-4/5 h-2 bg-warning-orange rounded-full"></div>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success-green mb-1">45%</div>
          <div className="text-sm text-gray-600">Disk Usage</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-1/2 h-2 bg-success-green rounded-full"></div>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success-green mb-1">23%</div>
          <div className="text-sm text-gray-600">Network I/O</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-1/4 h-2 bg-success-green rounded-full"></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Monitor;