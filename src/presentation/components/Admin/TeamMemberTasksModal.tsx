import React from 'react';
import { X, Clock, DollarSign, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import type { Task } from '../../../domain/entities/Task';
import { formatCurrency } from '../../../shared/utils/formatters';
import { isTaskRunning } from '../../../application/selectors/taskFilters';

interface TeamMemberTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMemberName: string;
  tasks: Task[];
  projects: Array<{ id: string; name: string }>;
  hourlyRate: number;
  loading?: boolean;
  error?: string | null;
}

export const TeamMemberTasksModal: React.FC<TeamMemberTasksModalProps> = ({
  isOpen,
  onClose,
  teamMemberName,
  tasks,
  projects,
  hourlyRate,
  loading = false,
  error = null
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };



  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamMemberName}'s Active Tasks
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {tasks.length} active tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-medium text-red-900 dark:text-red-400 mb-2">
                  Error Loading Tasks
                </h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No active tasks
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This team member doesn't have any active tasks right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {isTaskRunning(task) && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Running
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {task.description}
                          </p>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Project: {getProjectName(task.projectId)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Elapsed (current)</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatTime((task.currentTimeSeconds || 0) || (task.timeSpentSec || task.totalTimeSeconds || 0))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Earnings</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {typeof task.earningsCents === 'number' ? formatCurrency((task.earningsCents || 0) / 100) : 'Calculating...'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Rate</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(hourlyRate)}/hr
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completed date omitted for compatibility with Task entity */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
