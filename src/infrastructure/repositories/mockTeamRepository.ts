import type { TeamMember } from '../../domain/entities/TeamMember';
import type { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { eventBus } from '../events/EventBus';

const STORAGE_KEY = 'team_members';

const getStoredTeamMembers = (): TeamMember[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading team members from storage:', error);
  }
  
  // Default mock data if no stored data
  return [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      hourlyRate: 50.00,
      totalHours: 156.5,
      totalEarnings: 7825.00,
      activeTasks: 3
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      hourlyRate: 50.00,
      totalHours: 142.25,
      totalEarnings: 7112.50,
      activeTasks: 2
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      hourlyRate: 50.00,
      totalHours: 98.75,
      totalEarnings: 4937.50,
      activeTasks: 1
    }
  ];
};

const saveTeamMembers = (members: TeamMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    eventBus.emit('members:changed');
  } catch (error) {
    console.error('Error saving team members to storage:', error);
  }
};

export class MockTeamRepository implements ITeamRepository {
  async getTeamMembers(): Promise<TeamMember[]> {
    return getStoredTeamMembers();
  }

  async addTeamMember(member: Omit<TeamMember, 'id' | 'totalHours' | 'totalEarnings' | 'activeTasks'>): Promise<TeamMember> {
    const existingMembers = getStoredTeamMembers();
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(), // Simple ID generation
      totalHours: 0,
      totalEarnings: 0,
      activeTasks: 0
    };
    
    const updatedMembers = [...existingMembers, newMember];
    saveTeamMembers(updatedMembers);
    
    return newMember;
  }
} 