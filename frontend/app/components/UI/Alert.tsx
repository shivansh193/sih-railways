"use client"
import React from 'react';
import { Alert as AlertType } from '../../types/types';

interface AlertProps {
  alert: AlertType;
}

const Alert: React.FC<AlertProps> = ({ alert }) => {
  const getAlertStyles = (type: AlertType['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-gradient-to-r from-critical-red/20 to-critical-red/10 border-critical-red';
      case 'warning':
        return 'bg-gradient-to-r from-warning-orange/20 to-warning-orange/10 border-warning-orange';
      default:
        return 'bg-gradient-to-r from-cyan-accent/20 to-cyan-accent/10 border-cyan-accent';
    }
  };

  const getIcon = (type: AlertType['type']) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }; 
  return (
    <div className={`p-4 rounded-lg border-l-4 ${getAlertStyles(alert.type)}`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{getIcon(alert.type)}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary">{alert.title}</h4>
          <p className="text-gray-600 mt-1">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
      {alert.actions && (
        <div className="mt-3 flex space-x-2">
          {alert.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="px-3 py-1 text-sm bg-white rounded border hover:bg-gray-50 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alert;