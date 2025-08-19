import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '../../domain/entities/Task';
import { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';
import { LocalTaskAssignmentRepository } from '../../infrastructure/repositories/LocalTaskAssignmentRepository';
import { ListMemberActiveTasks } from './ListMemberActiveTasks';
import { LocalStorageProjectRepository } from '../../infrastructure/storage/ProjectRepository';
import { eventBus } from '../../infrastructure/events/EventBus';

export const useTeamMemberTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  const listUseCase = useMemo(() => new ListMemberActiveTasks(
    new LocalTasksRepository(),
    new LocalTaskAssignmentRepository()
  ), []);
  const projectsRepo = useMemo(() => new LocalStorageProjectRepository(), []);

  const getTasksByMemberId = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      const memberTasks = await listUseCase.execute(memberId);
      setTasks(memberTasks);
      setCurrentMemberId(memberId);
    } catch (err) {
      setError('Failed to load team member tasks');
      console.error('Error fetching team member tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProjects = useCallback(async () => {
    try {
      const projectList = await projectsRepo.getAll();
      const simplified = projectList.map(p => ({ id: p.id, name: p.name }));
      setProjects(simplified);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, [projectsRepo]);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  // Live update when timers or tasks change
  useEffect(() => {
    const refreshForMember = async () => {
      if (currentMemberId) {
        try {
          const memberTasks = await listUseCase.execute(currentMemberId);
          setTasks(memberTasks);
        } catch (err) {
          console.error('Error refreshing team member tasks:', err);
        }
      }
    };
    const unsubTasks = eventBus.on('tasks:changed', refreshForMember);
    const unsubSessions = eventBus.on('sessions:changed', refreshForMember);
    return () => {
      unsubTasks();
      unsubSessions();
    };
  }, [currentMemberId, listUseCase]);

  return {
    tasks,
    projects,
    loading,
    error,
    getTasksByMemberId
  };
};

