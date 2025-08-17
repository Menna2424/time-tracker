import type { TeamMember } from '../entities/TeamMember';

export interface ITeamRepository {
  getTeamMembers(): Promise<TeamMember[]>;
  addTeamMember(member: Omit<TeamMember, 'id' | 'totalHours' | 'totalEarnings' | 'activeTasks'>): Promise<TeamMember>;
} 