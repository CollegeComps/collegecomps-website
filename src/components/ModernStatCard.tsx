'use client';

import { ReactNode } from 'react';

interface ModernStatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  formatter?: (value: number) => string;
  color?: 'orange' | 'green' | 'blue' | 'purple';
}

export default function ModernStatCard({
  icon,
  label,
  value,
  trend,
  formatter,
  color = 'orange'
}: ModernStatCardProps) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-500 to-orange-600',
      text: 'text-orange-500',
      border: 'border-orange-500/20',
      shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-500',
      border: 'border-green-500/20',
      shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]'
    },
    purple: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm 
      border ${colors.border} rounded-2xl p-6 
      ${colors.shadow}
      hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden`}>
      
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center 
          mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="w-7 h-7 text-white">
            {icon}
          </div>
        </div>

        {/* Value */}
                {/* Value */}
        <div className="mb-2 text-4xl font-extrabold text-white">
          {typeof value === 'number' && formatter ? formatter(value) : value}
        </div>

        {/* Label */}
        <div className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-2">
          {label}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-bold ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <svg 
              className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full`}></div>
    </div>
  );
}
