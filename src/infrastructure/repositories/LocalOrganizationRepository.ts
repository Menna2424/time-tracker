import type { OrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import type { Organization } from '../../domain/entities/Organization';

export class LocalOrganizationRepository implements OrganizationRepository {
  private readonly ORGS_KEY = 'tt.orgs';

  constructor() {
    this.initializeDemoOrganization();
  }

  private initializeDemoOrganization(): void {
    const orgs = this.getOrganizations();
    
    // Only add demo org if no orgs exist
    if (orgs.length === 0) {
      const demoOrg: Organization = {
        id: 'demo-org',
        name: 'Demo Company',
        industry: 'Technology',
        companySize: 50,
        teamSize: 10,
        businessEmail: 'contact@democompany.com',
        phone: '+1 (555) 123-4567',
        country: 'United States',
        ownerUserId: 'admin-demo',
        createdAt: Date.now(),
      };
      
      this.saveOrganizations([demoOrg]);
      console.log('Demo organization created for admin user');
    }
  }

  async create(org: Organization): Promise<void> {
    const orgs = this.getOrganizations();
    
    // Remove existing org with same ID if any
    const filteredOrgs = orgs.filter(o => o.id !== org.id);
    
    // Add the new org
    filteredOrgs.push(org);
    
    this.saveOrganizations(filteredOrgs);
  }

  async getById(id: string): Promise<Organization | null> {
    const orgs = this.getOrganizations();
    return orgs.find(o => o.id === id) || null;
  }

  private getOrganizations(): Organization[] {
    try {
      const data = localStorage.getItem(this.ORGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading organizations:', error);
      return [];
    }
  }

  private saveOrganizations(orgs: Organization[]): void {
    try {
      localStorage.setItem(this.ORGS_KEY, JSON.stringify(orgs));
    } catch (error) {
      console.error('Error saving organizations:', error);
    }
  }
}
