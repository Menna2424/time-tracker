import { useState, useEffect } from 'react';
import type { Project } from '../../domain/types';

// This would typically interact with infrastructure layer
// For now, we'll use localStorage as a simple implementation
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    setLoading(false);
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    localStorage.setItem('projects', JSON.stringify(newProjects));
    setProjects(newProjects);
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project =>
      project.id === id
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    );
    saveProjects(updatedProjects);
  };

  const deleteProject = (id: string) => {
    const filteredProjects = projects.filter(project => project.id !== id);
    saveProjects(filteredProjects);
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
  };
}; 