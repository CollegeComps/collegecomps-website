import React from 'react';

interface FinancialWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: {
    border: 'border-blue-500',
    icon: 'text-blue-500',
    value: 'text-blue-600'
  },
  green: {
    border: 'border-green-500',
    icon: 'text-green-500',
    value: 'text-green-600'
  },
  purple: {
    border: 'border-purple-500',
    icon: 'text-purple-500',
    value: 'text-purple-600'
  },
  orange: {
    border: 'border-orange-500',
    icon: 'text-orange-500',
    value: 'text-orange-600'
  },
  red: {
    border: 'border-red-500',
    icon: 'text-red-500',
    value: 'text-red-600'
  }
};

export default function FinancialWidget({ title, value, subtitle, icon, color }: FinancialWidgetProps) {
  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border-l-4 ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</div>
        <div className={`${colors.icon}`}>{icon}</div>
      </div>
      <div className={`text-3xl font-bold ${colors.value}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
