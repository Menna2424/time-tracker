import React from 'react';
import { Clock, User, Timer } from 'lucide-react';
import type { Task } from '../../../domain/entities/Task';
// import { useCountdownManager } from '../../../application/useCases/useCountdownManager';

interface ActiveTaskDisplayProps {
  task?: Task | null;
  isLoading?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'card';
  className?: string;
  noTaskMessage?: string;
}

/**
 * Reusable component for displaying active task information
 * Provides consistent styling and behavior across the application
 */
export const ActiveTaskDisplay: React.FC<ActiveTaskDisplayProps> = ({
  task,
  isLoading = false,
  showIcon = true,
  size = 'md',
  variant = 'default',
  className = '',
  noTaskMessage = 'No active task'
}) => {
  // const {
  //   getRemainingTime,
  //   isCountdownActive,
  //   isCountdownExpired,
  //   formatCountdownTime
  // } = useCountdownManager();
  
  // TODO: Re-implement countdown functionality with unified timer
  const isCountdownActive = () => false;
  const getRemainingTime = () => 0;
  const isCountdownExpired = () => false;
  const formatCountdownTime = () => '00:00';
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      case 'md':
      default:
        return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'flex items-center space-x-1';
      case 'card':
        return 'p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
      case 'default':
      default:
        return 'flex items-center space-x-2';
    }
  };

  if (isLoading) {
    return (
      <div className={`${getSizeClasses()} ${getVariantClasses()} ${className}`}>
        {showIcon && <Clock className="w-4 h-4 text-gray-400 animate-pulse" />}
        <span className="text-gray-600 dark:text-gray-400">Loading task...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`${getSizeClasses()} ${getVariantClasses()} ${className}`}>
        {showIcon && <User className="w-4 h-4 text-gray-400" />}
        <span className="text-gray-500 dark:text-gray-400 italic">{noTaskMessage}</span>
      </div>
    );
  }

  const hasCountdown = Boolean(task?.countdown);
  const countdownRemaining = getRemainingTime();
  const countdownExpired = isCountdownExpired();
  const countdownActive = isCountdownActive();

  return (
    <div className={`${getSizeClasses()} ${getVariantClasses()} ${className}`}>
      {showIcon && (
        <Clock className={`w-4 h-4 ${
          countdownExpired 
            ? 'text-red-600 dark:text-red-400 animate-pulse' 
            : 'text-green-600 dark:text-green-400 animate-pulse'
        }`} />
      )}
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${
            countdownExpired 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-green-700 dark:text-green-300'
          }`}>
            Active: {task.title}
          </span>
          {hasCountdown && countdownActive && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              countdownExpired 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              <Timer className="w-3 h-3" />
              {formatCountdownTime()}
            </div>
          )}
        </div>
        {variant !== 'compact' && task.description && (
          <span className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1">
            {task.description}
          </span>
        )}
        {hasCountdown && countdownActive && variant === 'card' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  countdownExpired ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${Math.min(100, ((task.countdown?.initialDuration || 0) - countdownRemaining) / (task.countdown?.initialDuration || 1) * 100)}%` 
                }}
              />
            </div>
            {countdownExpired && (
              <span className="text-xs text-red-500 font-medium animate-pulse mt-1 block">
                Time's up! You can continue working or stop the timer.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};