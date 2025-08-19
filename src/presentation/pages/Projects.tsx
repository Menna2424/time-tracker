import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FolderPlus, ArrowLeft } from 'lucide-react';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { TaskList } from '../components/Tasks/TaskList';
import { AssignMembersModal } from '../components/Admin/AssignMembersModal';
import { SessionHistoryModal } from '../components/Tasks/SessionHistoryModal';
import { useProjects } from '../../application/useCases/useProjects';
import { useTasks } from '../../application/useCases/useTasks';
// import { useUnifiedTimer } from '../../application/useCases/useUnifiedTimer';
import { useSettings } from '../../application/useCases/useSettings';
// Removed unused task assignment imports - now using direct task storage
import { MockTeamRepository } from '../../infrastructure/repositories/mockTeamRepository';
import { GetTeamMembers } from '../../application/useCases/GetTeamMembers';
// Removed unused imports - using TimerContext instead
import type { ProjectEnhanced } from '../../domain/types';
import type { Task } from '../../domain/entities/Task';
import type { TeamMember } from '../../domain/entities/TeamMember';
import { useAuthContext } from '../../shared/context/AuthContext';
import { useGlobalTimerTick } from '../hooks/useGlobalTimerTick';
import { useTimerContext } from '../../shared/context/TimerContext';

export const Projects: React.FC = () => {
  const { isAdmin } = useAuthContext();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectEnhanced | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectEnhanced | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError,
    createProject, 
    updateProject, 
    deleteProject, 
    getProjectProgress 
  } = useProjects();

  const { 
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    updateOne,
    deleteTask,
    loadTasks,
    assignMembers,
    // refreshTasks, // Removed since we removed the interval
  } = useTasks();

  // Global timer tick hook for managing active timers
  const { addActiveTask, removeActiveTask } = useGlobalTimerTick();
  
  // Use the unified timer context
  const { startTimer, stopTimer } = useTimerContext();
  const { settings } = useSettings();

  const hourlyRate = settings?.hourlyRate || 50;

  // Memoize repositories to prevent infinite re-renders
  const teamRepository = useMemo(() => new MockTeamRepository(), []);
  const getTeamMembersUseCase = useMemo(() => new GetTeamMembers(teamRepository), [teamRepository]);

  // Helper function to get assigned members for a task
  const getAssignedMembersForTask = useCallback((task: Task): TeamMember[] => {
    if (!task.assignedMemberIds || task.assignedMemberIds.length === 0) {
      return [];
    }
    return teamMembers.filter(member => task.assignedMemberIds.includes(member.id));
  }, [teamMembers]);

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const members = await getTeamMembersUseCase.execute();
        setTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadTeamMembers();
  }, [getTeamMembersUseCase]);

  // Detect active timer sessions on component mount and task changes
  useEffect(() => {
    const detectActiveSessions = async () => {
      if (tasks.length === 0) return;
      
      try {
        // Check localStorage for active sessions
        const sessionsData = localStorage.getItem('tt.sessions');
        if (!sessionsData) return;
        
        const sessions = JSON.parse(sessionsData);
        const activeSessions = sessions.filter((session: { endedAt?: number }) => !session.endedAt);
        
        if (activeSessions.length > 0) {
          // Find the first active session and set it as active
          const activeSession = activeSessions[0];
          const task = tasks.find(t => t.id === activeSession.taskId);
          
          if (task && task.currentStartAt) {
            console.debug('[DETECT_ACTIVE] Found active session:', activeSession);
            setActiveTaskId(activeSession.taskId);
            addActiveTask(activeSession.taskId);
          }
        }
      } catch (error) {
        console.error('Error detecting active sessions:', error);
      }
    };

    detectActiveSessions();
  }, [tasks, addActiveTask]);

  // Note: Removed the interval here since the global timer tick (useGlobalTimerTick) 
  // handles all real-time updates. The UI will update automatically when the global
  // timer updates the task data in localStorage.

  const handleCreateProject = async (projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createProject(projectData);
    setShowProjectForm(false);
  };

  const handleUpdateProject = async (projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    }
  };

  const handleEditProject = (project: ProjectEnhanced) => {
    setEditingProject(project);
  };

  const handleStartTimer = (projectId: string) => {
    console.log('Starting timer for project:', projectId);
  };



  const handleCreateTask = async (taskData: Omit<Task, 'id'>, assignedMemberIds?: string[]) => {
    // Create task with assignments directly in the task data
    const taskDataWithAssignments = {
      ...taskData,
      assignedMemberIds: assignedMemberIds || []
    };
    
    await createTask(taskDataWithAssignments);
  };

  const handleUpdateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      // Immediately update the UI for better responsiveness
      updateOne(id, taskData);
      
      // Update the task in the repository
      await updateTask(id, taskData);
    } catch (error) {
      console.error('Failed to update task:', error);
      // If the update failed, reload tasks to revert the optimistic update
      await loadTasks();
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleStartTaskTimer = async (taskId: string) => {
    console.debug('[START] click', taskId, new Date().toISOString());
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    try {
      // Use the unified timer context to start the timer
      const success = await startTimer(taskId);
      
      if (success) {
        // Update UI state
        setActiveTaskId(taskId);
        addActiveTask(taskId);
        
        // Refresh tasks to get updated state
        await loadTasks();
        
        console.debug('[START] completed successfully');
      } else {
        console.error('Failed to start timer');
        alert('Failed to start timer');
      }
    } catch (e) {
      console.error('Start failed', e);
      alert(`Failed to start timer: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleStopTaskTimer = async (taskId: string) => {
    console.debug('[STOP] clicked for task:', taskId, new Date().toISOString());
    try {
      // Use the unified timer context to stop the timer
      await stopTimer(taskId);
      
      // Update UI state
      setActiveTaskId(null);
      removeActiveTask(taskId);
      
      // Refresh tasks to get updated state
      await loadTasks();
      
      console.debug('[STOP] completed successfully');
    } catch (e) {
      console.error('Stop failed', e);
      alert(`Failed to stop timer: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleAssignMembers = useCallback(async (taskId: string, memberIds: string[]) => {
    try {
      await assignMembers(taskId, memberIds);
      // No need to update any local state since the task will be updated in the repository
      // and the UI will reflect the changes through the task's assignedMemberIds
    } catch (error) {
      console.error('Error updating task assignments:', error);
      throw error; // Re-throw so the modal can handle the error
    }
  }, [assignMembers]);

  const handleOpenAssignModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  }, []);

  const handleViewHistory = useCallback((task: Task) => {
    setHistoryTask(task);
    setShowHistoryModal(true);
  }, []);

  if (projectsError) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-400 mb-2">
            Error Loading Projects
          </h3>
          <p className="text-red-600 dark:text-red-400">{projectsError}</p>
        </div>
      </div>
    );
  }

  // Project Detail View
  if (selectedProject) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedProject.name}
                </h1>
                {selectedProject.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {selectedProject.description}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleEditProject(selectedProject)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Project
            </button>
          </div>

          <TaskList
            projectId={selectedProject.id}
            tasks={tasks}
            loading={tasksLoading}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onStartTimer={handleStartTaskTimer}
            onStopTimer={handleStopTaskTimer}
            activeTaskId={activeTaskId}
            onAssignMembers={handleAssignMembers}
            showAssignmentButton={isAdmin}
            onOpenAssignModal={handleOpenAssignModal}
            onViewHistory={handleViewHistory}
            teamMembers={teamMembers}
            getAssignedMembersForTask={getAssignedMembersForTask}
          />

          <AssignMembersModal
            isOpen={showAssignModal}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            teamMembers={teamMembers}
            assignedMemberIds={selectedTask ? selectedTask.assignedMemberIds || [] : []}
            onAssignMembers={handleAssignMembers}
          />
        </div>
      </div>
    );
  }

  // Projects List View
  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your projects and track progress
            </p>
          </div>
          
          <button
            onClick={() => setShowProjectForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} onClick={() => setSelectedProject(project)} className="cursor-pointer">
                <ProjectCard
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onStartTimer={handleStartTimer}
                  getProgress={getProjectProgress}

                  hourlyRate={hourlyRate}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
      />

      <ProjectForm
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleUpdateProject}
      />

      <AssignMembersModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        teamMembers={teamMembers}
        assignedMemberIds={selectedTask ? selectedTask.assignedMemberIds || [] : []}
        onAssignMembers={handleAssignMembers}
      />

      <SessionHistoryModal
        task={historyTask}
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryTask(null);
        }}
      />
    </div>
  );
}; 