import React, { useEffect, useState } from 'react';
import { X, Clock, DollarSign, Calendar } from 'lucide-react';
import { useSessionHistory } from '../../../application/useCases/useSessionHistory';
import { LocalTimerRepository } from '../../../infrastructure/repositories/LocalTimerRepository';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { Task } from '../../../domain/entities/Task';

interface SessionHistoryModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  task,
  isOpen,
  onClose
}) => {
  const [timerRepository] = useState(() => new LocalTimerRepository());
  const { 
    // sessionHistory, // Unused for now 
    loading, 
    error, 
    loadSessionHistory, 
    getSessionHistory,
    getTotalEarningsForTask,
    getTotalTimeForTask 
  } = useSessionHistory(timerRepository);

  useEffect(() => {
    if (isOpen && task) {
      loadSessionHistory(task.id);
    }
  }, [isOpen, task, loadSessionHistory]);

  if (!isOpen || !task) return null;

  const history = getSessionHistory(task.id);
  const totalEarnings = getTotalEarningsForTask(task.id);
  const totalTime = getTotalTimeForTask(task.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Session History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {task.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatTime(totalTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading session history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No sessions recorded yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Start a timer to begin tracking sessions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(session.startTime)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(session.earned)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatTime(session.duration)}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

