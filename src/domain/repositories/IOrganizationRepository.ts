import type { Organization } from '../entities/Organization';

export interface OrganizationRepository {
  create(org: Organization): Promise<void>;
  getById(id: string): Promise<Organization | null>;
}
