import type { TeamMember } from '../../domain/entities/TeamMember';
import type { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export class GetTeamMembers {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(): Promise<TeamMember[]> {
    return await this.teamRepository.getTeamMembers();
  }
}
