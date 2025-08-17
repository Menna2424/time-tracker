import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useUnifiedTimer } from '../../../application/useCases/useUnifiedTimer';
import type { Task } from '../../../domain/entities/Task';

export const UnifiedTimerDemo: React.FC = () => {
  const {
    startTimer,
    stopTimer,
    getTask,
    isTimerActive,
    formatTime,
    formatCurrency,
    getLiveTaskData,
    nowTick
  } = useUnifiedTimer();

  const [demoTask, setDemoTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState<{ totalSeconds: number; totalCents: number; currentSeconds: number; currentCents: number }>({ 
    totalSeconds: 0,
    totalCents: 0,
    currentSeconds: 0, 
    currentCents: 0 
  });

  // Demo task data
  const demoTaskData: Task = useMemo(() => ({
    id: 'demo-task',
    projectId: 'demo-project',
    title: 'Demo Timer Task',
    description: 'Test the unified timer system',
    totalTimeSeconds: 0,
    earningsCents: 0,
    currentTimeSeconds: 0,
    currentCents: 0,
    hourlyRateCents: 5000, // $50/hour
    status: 'pending',
    timeSpentSec: 0,
    assignedMemberIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }), []);

  // Initialize demo task
  useEffect(() => {
    const initDemoTask = async () => {
      // Check if task exists, if not create it
      let task = await getTask(demoTaskData.id);
      if (!task) {
        // Save the demo task to repository
        const { LocalTasksRepository } = await import('../../../infrastructure/repositories/LocalTasksRepository');
        const tasksRepo = new LocalTasksRepository();
        await tasksRepo.save(demoTaskData);
        task = demoTaskData;
      }
      setDemoTask(task);
    };
    initDemoTask();
  }, [getTask, demoTaskData]);

  // Update live data every second when nowTick changes
  useEffect(() => {
    if (demoTask) {
      getLiveTaskData(demoTask.id).then(data => {
        setLiveData(data);
      });
    } else {
      setLiveData({ totalSeconds: 0, totalCents: 0, currentSeconds: 0, currentCents: 0 });
    }
  }, [nowTick, demoTask, getLiveTaskData]);

  const handleStart = async () => {
    if (!demoTask) return;
    
    setIsLoading(true);
    try {
      await startTimer(demoTask.id, 'countup');
      const updatedTask = await getTask(demoTask.id);
      if (updatedTask) {
        setDemoTask(updatedTask);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!demoTask) return;
    
    setIsLoading(true);
    try {
      const updatedTask = await stopTimer(demoTask.id);
      setDemoTask(updatedTask);
    } catch (error) {
      console.error('Error stopping timer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    // Reset the demo task by saving it back to zero values
    const resetTask = {
      ...demoTaskData,
      totalTimeSeconds: 0,
      earningsCents: 0,
      currentTimeSeconds: 0,
      currentCents: 0,
    };
    
    // Save the reset task
    const { LocalTasksRepository } = await import('../../../infrastructure/repositories/LocalTasksRepository');
    const tasksRepo = new LocalTasksRepository();
    await tasksRepo.save(resetTask);
    setDemoTask(resetTask);
  };

  if (!demoTask) {
    return <div>Loading demo task...</div>;
  }

  const isActive = isTimerActive(demoTask.id);
  // Use live data which combines persisted totals + current deltas
  const shownTime = liveData.totalSeconds;
  const shownMoney = liveData.totalCents;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Unified Timer Demo
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {demoTask.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {demoTask.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Time:</span>
              <div className="font-mono text-lg">
                {formatTime(shownTime)}
              </div>
              {isActive && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  +{formatTime(liveData.currentSeconds)} live
                </div>
              )}
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Earnings:</span>
              <div className="font-mono text-lg text-green-600 dark:text-green-400">
                {formatCurrency(shownMoney)}
              </div>
              {isActive && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  +{formatCurrency(liveData.currentCents)} live
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Rate: {formatCurrency(demoTask.hourlyRateCents || 5000)}/hour
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={isActive ? handleStop : handleStart}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Stop' : 'Start'}</span>
          </button>
          
          <button
            onClick={handleReset}
            disabled={isLoading || isActive}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p><strong>Instructions:</strong></p>
          <p>1. Click Start to begin timer (countup mode)</p>
          <p>2. Watch live counters increase every second</p>
          <p>3. Click Stop to add current values to totals and reset current to 0</p>
          <p>4. Repeat multiple cycles to test accumulation</p>
          <p>5. Data persists in localStorage with key 'tt.tasks'</p>
        </div>
      </div>
    </div>
  );
};
