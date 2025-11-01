'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ModernBarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  maxValue?: number;
}

export default function ModernBarChart({
  data,
  title,
  height = 300,
  valueFormatter = (v) => v.toLocaleString(),
  maxValue
}: ModernBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const max = maxValue || Math.max(...data.map(d => d.value));

  const getBarColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    const colors = [
      'bg-gradient-to-t from-orange-600 to-orange-400',
      'bg-gradient-to-t from-orange-500 to-orange-300',
      'bg-gradient-to-t from-orange-400 to-orange-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300">
      {title && (
        <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
      )}
      
      <div ref={chartRef} style={{ height }} className="relative">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                {/* Value label */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-sm font-bold text-orange-400 bg-gray-800 px-2 py-1 rounded-lg border border-orange-500/30">
                    {valueFormatter(item.value)}
                  </span>
                </div>

                {/* Bar */}
                <div
                  className="w-full relative"
                  style={{ height: `${percentage}%`, minHeight: '8px' }}
                >
                  <div
                    className={`w-full h-full rounded-t-lg ${getBarColor(index, item.color)} 
                    shadow-lg hover:shadow-orange-500/50 transition-all duration-500 ease-out
                    transform hover:scale-105 origin-bottom`}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-transparent to-white/20"></div>
                  </div>
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-orange-400 transition-colors">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend or additional info */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Max: {valueFormatter(max)}</span>
          <span>{data.length} items</span>
        </div>
      </div>
    </div>
  );
}
