import React from 'react';
import { KPI } from '../../types/types';
import Card from './Card';

interface KPIWidgetProps {
  kpi: KPI;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({ kpi }) => {
  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'good':
        return 'text-success-green';
      case 'warning':
        return 'text-warning-orange';
      case 'critical':
        return 'text-critical-red';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  return (
    <Card className="p-4" borderColor={kpi.status === 'good' ? 'success' : kpi.status === 'warning' ? 'warning' : 'critical'}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-gray-600 font-medium">{kpi.title}</h3>
          <p className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
            {kpi.value}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 flex items-center">
            {getChangeIcon(kpi.change)} {Math.abs(kpi.change)}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default KPIWidget;

