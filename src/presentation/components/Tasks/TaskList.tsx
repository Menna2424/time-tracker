import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type { Task } from '../../../domain/entities/Task';
import type { TeamMember } from '../../../domain/entities/TeamMember';
import { useSettings } from '../../../application/useCases/useSettings';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  loading: boolean;
  onCreateTask: (task: Omit<Task, 'id'>, assignedMemberIds?: string[]) => Promise<void>;
  onUpdateTask: (id: string, task: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onStartTimer: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
  activeTaskId: string | null;
  assignedMembersMap?: Map<string, TeamMember[]>; // taskId -> TeamMember[]
  onAssignMembers?: (taskId: string, memberIds: string[]) => Promise<void>;
  showAssignmentButton?: boolean;
  onOpenAssignModal?: (task: Task) => void;
  onViewHistory?: (task: Task) => void;
  teamMembers?: TeamMember[];
}

export const TaskList: React.FC<TaskListProps> = ({
  projectId,
  tasks,
  loading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onStartTimer,
  onStopTimer,
  activeTaskId,
  assignedMembersMap = new Map(),
  onAssignMembers,
  showAssignmentButton = false,
  onOpenAssignModal,
  onViewHistory,
  teamMembers = [],
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { settings } = useSettings();

  const hourlyRate = settings?.hourlyRate || 50;

  const handleCreateTask = async (taskData: Omit<Task, 'id'>, assignedMemberIds?: string[]) => {
    await onCreateTask(taskData, assignedMemberIds);
    setShowForm(false);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDeleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Tasks ({tasks.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartTimer={onStartTimer}
              onStopTimer={onStopTimer}
              isActive={task.id === activeTaskId}
              hourlyRate={hourlyRate}
              assignedMembers={assignedMembersMap.get(task.id) || []}
              onAssignMembers={onAssignMembers}
              showAssignmentButton={showAssignmentButton}
              onOpenAssignModal={onOpenAssignModal}
              onViewHistory={onViewHistory}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first task
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </button>
        </div>
      )}

      <TaskForm
        projectId={projectId}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateTask}
        teamMembers={teamMembers}
      />

      <TaskForm
        task={editingTask}
        projectId={projectId}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        teamMembers={teamMembers}
      />
    </div>
  );
};
