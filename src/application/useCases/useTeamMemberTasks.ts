import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '../../domain/types';
import { MockTeamMemberTasksRepository } from '../../infrastructure/repositories/mockTeamMemberTasksRepository';

export const useTeamMemberTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new MockTeamMemberTasksRepository(), []);

  const getTasksByMemberId = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      const memberTasks = await repository.getTasksByMemberId(memberId);
      setTasks(memberTasks);
    } catch (err) {
      setError('Failed to load team member tasks');
      console.error('Error fetching team member tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProjects = useCallback(async () => {
    try {
      const projectList = await repository.getProjects();
      setProjects(projectList);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, [repository]);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  return {
    tasks,
    projects,
    loading,
    error,
    getTasksByMemberId
  };
};

