import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdvancedMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  gradient: string;
  delay?: number;
  onClick?: () => void;
}

export const AdvancedMetricCard: React.FC<AdvancedMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  gradient,
  delay = 0,
  onClick
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const cardContent = (
    <div className="relative backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:rotate-1 overflow-hidden">
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Floating Animation Background */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full opacity-10 animate-bounce`} />
      
      <div className="relative z-10">
        {/* Icon Container */}
        <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
            {change !== undefined && (
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                change >= 0 
                  ? 'text-emerald-600 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/30' 
                  : 'text-red-600 bg-red-100/50 dark:text-red-400 dark:bg-red-900/30'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
    </div>
  );

  if (onClick) {
    return (
      <div 
        className="group relative opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-3xl"
        >
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {cardContent}
    </div>
  );
}; 