import React, { useMemo, useState, useEffect } from 'react';
import { Clock, CheckCircle, Circle, Edit3, Trash2, Play, Pause, AlertTriangle, DollarSign, Users, History } from 'lucide-react';
import type { Task } from '../../../domain/entities/Task';
import type { TeamMember } from '../../../domain/entities/TeamMember';
import { useWorkdayTimerContext } from '../../../shared/context/WorkdayTimerContext';
import { useUnifiedTimer } from '../../../application/useCases/useUnifiedTimer';
import { useTimerContext } from '../../../shared/context/TimerContext';
import { formatTime, formatMoney } from '../../../shared/utils/formatters';
import { AssignedMembersDisplay } from './AssignedMembersDisplay';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
  isActive: boolean;
  hourlyRate?: number;
  assignedMembers?: TeamMember[];
  onAssignMembers?: (taskId: string, memberIds: string[]) => Promise<void>;
  showAssignmentButton?: boolean;
  onOpenAssignModal?: (task: Task) => void;
  onViewHistory?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStartTimer,
  onStopTimer,
  isActive,
  hourlyRate = 50,
  assignedMembers = [],
  showAssignmentButton = false,
  onOpenAssignModal,
  onViewHistory,
}) => {
  const { isWorkdayEnded } = useWorkdayTimerContext();
  const { getLiveTaskData, nowTick } = useUnifiedTimer();
  
  // Live task data that updates every second
  const [liveData, setLiveData] = useState<{ totalSeconds: number; totalCents: number; currentSeconds: number; currentCents: number }>({
    totalSeconds: task.totalTimeSeconds || 0,
    totalCents: task.earningsCents || 0,
    currentSeconds: 0,
    currentCents: 0
  });

  // Get countdown data from timer context
  const { getCountdownData } = useTimerContext();
  const [countdownData, setCountdownData] = useState<{ remainingSeconds: number; progressPercentage: number; isExpired: boolean } | null>(null);

  const StatusIcon = task.status === 'completed' ? CheckCircle : Circle;
  const statusColor = task.status === 'completed' ? 'text-green-500' : 
                     task.status === 'active' ? 'text-blue-500' : 'text-gray-400';

  // Update live data every second when nowTick changes
  useEffect(() => {
    // Update live task data
    getLiveTaskData(task.id).then(data => {
      setLiveData(data);
    });
    
    // Update countdown data if task has estimated time
    if (task.estimatedMinutes && isActive) {
      getCountdownData(task.id).then(data => {
        setCountdownData(data);
      });
    } else {
      setCountdownData(null);
    }
  }, [nowTick, task.id, getLiveTaskData, getCountdownData, task.estimatedMinutes, isActive]);

  // Helper function to format time as mm:ss
  const formatMMSS = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Memoize displayed totals calculation using live data
  const { displayedTime, displayedMoney, rateHint } = useMemo(() => {
    return {
      displayedTime: formatTime(liveData.totalSeconds),
      displayedMoney: formatMoney(liveData.totalCents),
      rateHint: `+$${hourlyRate.toFixed(2)}/hr`
    };
  }, [liveData.totalSeconds, liveData.totalCents, hourlyRate]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-gray-900 dark:text-white ${
                task.status === 'completed' ? 'line-through opacity-75' : ''
              }`}>
                {task.title}
              </h3>
              {isActive && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Running
                </div>
              )}
            </div>
            {isActive && liveData.currentSeconds > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current session: {formatTime(liveData.currentSeconds)} (+{formatMoney(liveData.currentCents)})
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isWorkdayEnded) {
                if (isActive) {
                  onStopTimer?.(task.id);
                } else {
                  onStartTimer(task.id);
                }
              }
            }}
            disabled={isWorkdayEnded}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isWorkdayEnded 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : isActive 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title={isWorkdayEnded ? "Cannot start timer: Workday is complete" : isActive ? "Stop timer" : "Start timer"}
          >
            {isWorkdayEnded ? (
              <AlertTriangle className="w-4 h-4" />
            ) : isActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(task)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="View Session History"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          {showAssignmentButton && onOpenAssignModal && (
            <button
              onClick={() => onOpenAssignModal(task)}
              className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              title="Assign Members"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {task.description}
        </p>
      )}

      {/* Assigned Members Display */}
      <div className="mb-3">
        {assignedMembers.length > 0 ? (
          <AssignedMembersDisplay assignedMembers={assignedMembers} />
        ) : (
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
          </div>
        )}
      </div>

      {/* Estimate Block - Always show when task has estimatedMinutes */}
      {task.estimatedMinutes && (
        <div className="mt-2 rounded-md bg-slate-100 dark:bg-slate-800 p-2">
          {!isActive ? (
            <span>Estimated: {task.estimatedMinutes}m</span>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-medium">
                Remaining: {countdownData ? formatMMSS(countdownData.remainingSeconds) : formatMMSS(task.countdownRemainingSec || 0)}
              </span>
              <div className="flex-1 h-2 rounded bg-slate-300 overflow-hidden">
                <div
                  className={`h-2 ${countdownData?.isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ 
                    width: `${countdownData ? countdownData.progressPercentage : Math.min(100, (1 - (task.countdownRemainingSec || 0) / (task.estimatedMinutes * 60)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {/* Time and Status Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              {displayedTime}
            </span>
            {isActive && task.currentTimeSeconds > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                (+{formatTime(task.currentTimeSeconds ?? 0)})
              </span>
            )}
            {isWorkdayEnded && isActive && (
              <span className="text-xs text-red-500 font-medium">
                (Auto-stopped)
              </span>
            )}
            {/* Countdown expired message removed - using unified timer system */}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            task.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {(task.status || 'pending').charAt(0).toUpperCase() + (task.status || 'pending').slice(1)}
          </span>
        </div>

        {/* Earnings Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">
              {displayedMoney}
            </span>
            {isActive && task.currentCents > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                (+{formatMoney(task.currentCents ?? 0)})
              </span>
            )}
            {isActive && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({rateHint})
              </span>
            )}
          </div>
          {task.status === 'completed' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Completed {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Unknown'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 