import { useState, useEffect, useCallback } from 'react';
import type { ProjectEnhanced, ProjectProgress } from '../../domain/types';
import { LocalStorageProjectRepository, type IProjectRepository } from '../../infrastructure/storage/ProjectRepository';

const defaultProjectRepository = new LocalStorageProjectRepository();

export const useProjects = (repository: IProjectRepository = defaultProjectRepository) => {
  const [projects, setProjects] = useState<ProjectEnhanced[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allProjects = await repository.getAll();
      setProjects(allProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createProject = useCallback(async (projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await repository.create(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const updateProject = useCallback(async (id: string, projectData: Partial<ProjectEnhanced>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await repository.update(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await repository.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const getProjectProgress = useCallback(async (projectId: string): Promise<ProjectProgress> => {
    try {
      return await repository.getProgress(projectId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get project progress');
    }
  }, [repository]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectProgress,
    refreshProjects: loadProjects,
  };
}; 