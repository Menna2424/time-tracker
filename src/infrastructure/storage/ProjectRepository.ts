import type { ProjectEnhanced, ProjectProgress } from '../../domain/types';
import { eventBus } from '../events/EventBus';

export interface IProjectRepository {
  getAll(): Promise<ProjectEnhanced[]>;
  getById(id: string): Promise<ProjectEnhanced | null>;
  create(project: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectEnhanced>;
  update(id: string, project: Partial<ProjectEnhanced>): Promise<ProjectEnhanced>;
  delete(id: string): Promise<void>;
  getProgress(projectId: string): Promise<ProjectProgress>;
  updateProjectTotals(projectId: string): Promise<void>;
}

const PROJECTS_STORAGE_KEY = 'projects';

const DEFAULT_PROJECTS: ProjectEnhanced[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    color: 'from-blue-500 to-cyan-400',
    hourlyGoal: 40,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'React Native mobile application for task management',
    color: 'from-emerald-500 to-teal-400',
    hourlyGoal: 30,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'AI Dashboard',
    description: 'Analytics dashboard with machine learning insights',
    color: 'from-purple-500 to-pink-400',
    hourlyGoal: 25,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-25'),
  },
];

export class LocalStorageProjectRepository implements IProjectRepository {
  private loadProjects(): ProjectEnhanced[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!stored) {
        // Initialize with default projects on first load
        this.saveProjects(DEFAULT_PROJECTS);
        return DEFAULT_PROJECTS;
      }
      
      const parsed = JSON.parse(stored);
      return parsed.map((project: Record<string, unknown>) => ({
        ...project,
        createdAt: new Date(project.createdAt as string),
        updatedAt: new Date(project.updatedAt as string),
      }));
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
      // Return defaults if localStorage is corrupted
      return DEFAULT_PROJECTS;
    }
  }

  private saveProjects(projects: ProjectEnhanced[]): void {
    try {
      const serialized = projects.map(project => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }));
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(serialized));
      eventBus.emit('projects:changed');
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
      throw new Error('Failed to persist project data');
    }
  }

  async getAll(): Promise<ProjectEnhanced[]> {
    return this.loadProjects();
  }

  async getById(id: string): Promise<ProjectEnhanced | null> {
    const projects = this.loadProjects();
    return projects.find(p => p.id === id) || null;
  }

  async create(projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectEnhanced> {
    const projects = this.loadProjects();
    const newProject: ProjectEnhanced = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  async update(id: string, projectData: Partial<ProjectEnhanced>): Promise<ProjectEnhanced> {
    const projects = this.loadProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }

    projects[index] = {
      ...projects[index],
      ...projectData,
      updatedAt: new Date(),
    };

    this.saveProjects(projects);
    return projects[index];
  }

  async delete(id: string): Promise<void> {
    const projects = this.loadProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    projects.splice(index, 1);
    this.saveProjects(projects);
  }

  async getProgress(projectId: string): Promise<ProjectProgress> {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    // Using consistent mock data instead of random
    const projectProgressData: Record<string, ProjectProgress> = {
      '1': { // E-commerce Platform
        projectId: '1',
        totalTimeSpent: 38 * 3600 + 34 * 60, // 38h 34m
        hourlyGoal: 40,
        progressPercentage: 96,
        completedTasks: 1,
        totalTasks: 4,
      },
      '2': { // Mobile App Development  
        projectId: '2',
        totalTimeSpent: 7 * 3600 + 8 * 60, // 7h 8m
        hourlyGoal: 30,
        progressPercentage: 24,
        completedTasks: 5,
        totalTasks: 7,
      },
      '3': { // AI Dashboard
        projectId: '3',
        totalTimeSpent: 14 * 3600 + 34 * 60, // 14h 34m
        hourlyGoal: 25,
        progressPercentage: 58,
        completedTasks: 3,
        totalTasks: 5,
      },
    };
  
    return projectProgressData[projectId] || {
      projectId,
      totalTimeSpent: 0,
      hourlyGoal: project.hourlyGoal,
      progressPercentage: 0,
      completedTasks: 0,
      totalTasks: 0,
    };
  }

  async updateProjectTotals(projectId: string): Promise<void> {
    // This would recalculate project totals based on task data
    // For now, we'll just log that it should be updated
    console.log(`Project totals should be updated for project ${projectId}`);
  }
}

// Keep InMemoryProjectRepository for testing/fallback purposes
export class InMemoryProjectRepository implements IProjectRepository {
  private projects: ProjectEnhanced[] = [...DEFAULT_PROJECTS];

  async getAll(): Promise<ProjectEnhanced[]> {
    return [...this.projects];
  }

  async getById(id: string): Promise<ProjectEnhanced | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async create(projectData: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectEnhanced> {
    const newProject: ProjectEnhanced = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.push(newProject);
    return newProject;
  }

  async update(id: string, projectData: Partial<ProjectEnhanced>): Promise<ProjectEnhanced> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }

    this.projects[index] = {
      ...this.projects[index],
      ...projectData,
      updatedAt: new Date(),
    };

    return this.projects[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    this.projects.splice(index, 1);
  }

  async getProgress(projectId: string): Promise<ProjectProgress> {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    // Using consistent mock data instead of random
    const projectProgressData: Record<string, ProjectProgress> = {
      '1': { // E-commerce Platform
        projectId: '1',
        totalTimeSpent: 38 * 3600 + 34 * 60, // 38h 34m
        hourlyGoal: 40,
        progressPercentage: 96,
        completedTasks: 1,
        totalTasks: 4,
      },
      '2': { // Mobile App Development  
        projectId: '2',
        totalTimeSpent: 7 * 3600 + 8 * 60, // 7h 8m
        hourlyGoal: 30,
        progressPercentage: 24,
        completedTasks: 5,
        totalTasks: 7,
      },
      '3': { // AI Dashboard
        projectId: '3',
        totalTimeSpent: 14 * 3600 + 34 * 60, // 14h 34m
        hourlyGoal: 25,
        progressPercentage: 58,
        completedTasks: 3,
        totalTasks: 5,
      },
    };
  
    return projectProgressData[projectId] || {
      projectId,
      totalTimeSpent: 0,
      hourlyGoal: project.hourlyGoal,
      progressPercentage: 0,
      completedTasks: 0,
      totalTasks: 0,
    };
  }

  async updateProjectTotals(projectId: string): Promise<void> {
    // This would recalculate project totals based on task data
    // For now, we'll just log that it should be updated
    console.log(`Project totals should be updated for project ${projectId}`);
  }
} 