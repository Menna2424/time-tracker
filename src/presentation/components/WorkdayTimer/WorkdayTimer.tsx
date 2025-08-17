import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalTimerTick } from '../../hooks/useGlobalTimerTick';
import { useWorkdayTimerContext } from '../../../shared/context/WorkdayTimerContext';
import type { WorkingDay } from '../../../domain/entities/WorkingDay';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface WorkdayTimerProps {
  position?: 'bottom-right' | 'bottom-center';
}

export const WorkdayTimer: React.FC<WorkdayTimerProps> = ({ position = 'bottom-right' }) => {
  const { workdayTimerService } = useGlobalTimerTick();
  const { nowTick } = useWorkdayTimerContext();
  const [workingDay, setWorkingDay] = useState<WorkingDay | null>(null);
  const [hasActiveTasks, setHasActiveTasks] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const state = await workdayTimerService.getCurrentState();
      setWorkingDay(state.workingDay);
      setHasActiveTasks(state.hasActiveTasks);
    } catch (error) {
      // Ignore errors, working day will be created by global tick
      console.debug('[WORKDAY_TIMER] Error loading data:', error);
    }
  }, [workdayTimerService]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update workday data every second when nowTick changes for live updates
  useEffect(() => {
    loadData();
  }, [nowTick, loadData]);

  // Subscribe to localStorage changes to update when global timer modifies data (for other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('workingDay') || e.key?.includes('timer') || e.key?.includes('sessions')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);

  if (!workingDay) return null;

  const formatTime = (seconds: number): string => {
    return workdayTimerService.formatTime(seconds);
  };

  const getTimerColor = (seconds: number): string => {
    return workdayTimerService.getTimerColor(seconds, workingDay.dailyBudgetSeconds);
  };

  const timeColor = getTimerColor(workingDay.remainingSeconds);

  // Determine timer status and message
  const getTimerStatus = () => {
    if (workingDay.remainingSeconds <= 0) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        message: "Workday Complete",
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800"
      };
    }
    
    if (hasActiveTasks) {
      return {
        icon: <Clock className={`w-5 h-5 ${timeColor}`} />,
        message: "Workday Remaining (Active)",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800"
      };
    }
    
    return {
      icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
      message: "Waiting for Task",
      color: timeColor,
      bgColor: "bg-gray-50 dark:bg-gray-800",
      borderColor: "border-gray-200 dark:border-gray-700"
    };
  };

  const status = getTimerStatus();

  // Determine positioning classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4 sm:bottom-6 sm:right-6';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40 ${status.bgColor} rounded-xl shadow-lg p-4 border ${status.borderColor} transition-all duration-200 min-w-[280px] max-w-[320px] sm:min-w-[300px]`}>
      <div className="flex items-center space-x-3">
        {status.icon}
        <div className="flex flex-col flex-1">
          <span className={`text-sm ${status.color} font-medium`}>
            {status.message}
          </span>
          {workingDay.remainingSeconds > 0 && (
            <span className={`text-xl font-bold ${timeColor}`}>
              {formatTime(workingDay.remainingSeconds)}
            </span>
          )}
          {workingDay.remainingSeconds <= 0 && (
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              🎉 Day Complete!
            </span>
          )}
        </div>
      </div>
      {hasActiveTasks && workingDay.remainingSeconds > 0 && (
        <div className="mt-2 border-t border-gray-200 dark:border-gray-600 pt-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Tasks are running and counting down your workday
          </div>
        </div>
      )}
    </div>
  );
}; 