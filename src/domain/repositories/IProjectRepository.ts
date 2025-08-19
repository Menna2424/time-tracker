import type { ProjectEnhanced, ProjectProgress } from '../types';

export interface IProjectRepository {
  getAll(): Promise<ProjectEnhanced[]>;
  getById(id: string): Promise<ProjectEnhanced | null>;
  create(project: Omit<ProjectEnhanced, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectEnhanced>;
  update(id: string, project: Partial<ProjectEnhanced>): Promise<ProjectEnhanced>;
  delete(id: string): Promise<void>;
  getProgress(projectId: string): Promise<ProjectProgress>;
  updateProjectTotals(projectId: string): Promise<void>;
}
























