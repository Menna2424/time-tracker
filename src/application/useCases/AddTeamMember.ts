import type { TeamMember } from '../../domain/entities/TeamMember';
import type { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export interface AddTeamMemberRequest {
  name: string;
  email: string;
  hourlyRate: number;
}

export class AddTeamMember {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(request: AddTeamMemberRequest): Promise<TeamMember> {
    // Validate input
    if (!request.name.trim()) {
      throw new Error('Name is required');
    }
    
    if (!request.email.trim()) {
      throw new Error('Email is required');
    }
    
    if (!request.email.includes('@')) {
      throw new Error('Email must be valid');
    }
    
    if (request.hourlyRate <= 0) {
      throw new Error('Hourly rate must be greater than 0');
    }

    // Add the team member
    const newMember = await this.teamRepository.addTeamMember({
      name: request.name.trim(),
      email: request.email.trim(),
      hourlyRate: request.hourlyRate
    });

    return newMember;
  }
}

