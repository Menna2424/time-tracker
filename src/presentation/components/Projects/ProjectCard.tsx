import React, { useState, useEffect, useMemo } from 'react';
import { FolderOpen, Clock, CheckCircle, Edit3, Trash2, Play, DollarSign } from 'lucide-react';
import type { ProjectEnhanced, ProjectProgress } from '../../../domain/types';
import { useTimerContext } from '../../../shared/context/TimerContext';
import { ActiveTaskDisplay } from '../Common/ActiveTaskDisplay';
import { formatMoney } from '../../../shared/utils/formatters';
import { useTasks } from '../../../application/useCases/useTasks';

interface ProjectCardProps {
  project: ProjectEnhanced;
  onEdit: (project: ProjectEnhanced) => void;
  onDelete: (id: string) => void;
  onStartTimer: (projectId: string) => void;
  getProgress: (projectId: string) => Promise<ProjectProgress>;
  delay?: number;
  hourlyRate?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onStartTimer,
  getProgress,
  delay = 0,
  hourlyRate = 50
}) => {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getActiveTask } = useTimerContext();
  const { tasks } = useTasks();

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getProgress(project.id);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [project.id, getProgress]);

  // Calculate displayed totals for project tasks
  const { displayedTimeSeconds, displayedEarningsCents } = useMemo(() => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    
    let totalTimeSeconds = 0;
    let totalEarningsCents = 0;
    
    projectTasks.forEach(task => {
      totalTimeSeconds += (task.totalTimeSeconds ?? 0) + (task.currentTimeSeconds ?? 0);
      totalEarningsCents += (task.earningsCents ?? 0) + (task.currentCents ?? 0);
    });
    
    return {
      displayedTimeSeconds: totalTimeSeconds,
      displayedEarningsCents: totalEarningsCents
    };
  }, [tasks, project.id]);

  const formatTimeHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const activeTaskForProject = getActiveTask()?.projectId === project.id ? getActiveTask() : null;
  const projectIsActive = activeTaskForProject !== null;

  return (
    <div 
      className="group relative opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glassmorphism Card */}
      <div className={`relative backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border ${projectIsActive ? 'border-green-400/50 dark:border-green-500/50' : 'border-white/30 dark:border-gray-700/30'} rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 overflow-hidden`}>
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.color || 'from-blue-500 to-cyan-400'} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Floating Animation Background */}
        <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${project.color || 'from-blue-500 to-cyan-400'} rounded-full opacity-10 animate-bounce`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${project.color || 'from-blue-500 to-cyan-400'} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onStartTimer(project.id)}
                className="p-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 transition-colors duration-200"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(project)}
                className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>

            {/* Progress Section */}
            {!isLoading && progress && (
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(progress.progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${project.color || 'from-blue-500 to-cyan-400'} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-300">Time Spent</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatTimeHours(displayedTimeSeconds)}
                      </p>
                      {projectIsActive && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          (Live)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-300">Tasks</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {progress.completedTasks}/{progress.totalTasks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-300">Earnings</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {formatMoney(displayedEarningsCents)}
                      </p>
                      {projectIsActive && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          (Live)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-300">Rate</p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        ${hourlyRate}/hr
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Goal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.hourlyGoal}h
                  </span>
                </div>

                {/* Active Task Display */}
                {activeTaskForProject && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <ActiveTaskDisplay
                      task={activeTaskForProject}
                      size="sm"
                      variant="card"
                      showIcon={true}
                    />
                  </div>
                )}
              </div>
            )}

            {isLoading && (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${project.color || 'from-blue-500 to-cyan-400'} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
      </div>
    </div>
  );
}; 