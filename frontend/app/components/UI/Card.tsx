import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: 'success' | 'warning' | 'critical' | 'info';
}

const Card: React.FC<CardProps> = ({ children, className = '', borderColor }) => {
  const borderColorClass = {
    success: 'border-l-success-green',
    warning: 'border-l-warning-orange',
    critical: 'border-l-critical-red',
    info: 'border-l-cyan-accent',
  }[borderColor || 'info'];

  return (
    <div
      className={`bg-card-bg rounded-lg shadow-card hover:shadow-card-hover transition-shadow ${
        borderColor ? `border-l-4 ${borderColorClass}` : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;