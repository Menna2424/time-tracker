import type { AuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { UserRepository } from '../../../domain/repositories/IUserRepository';
import type { OrganizationRepository } from '../../../domain/repositories/IOrganizationRepository';
import type { User } from '../../../domain/entities/User';
import type { Organization } from '../../../domain/entities/Organization';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  // admin-only:
  companyName?: string;
  industry?: string;
  companySize?: number;
  teamSize?: number;
  businessEmail?: string;
  phone?: string;
  country?: string;
}

export class SignUp {
  constructor(
    private authRepo: AuthRepository,
    private userRepo: UserRepository,
    private orgRepo: OrganizationRepository
  ) {}

  async execute(input: SignUpInput): Promise<User> {
    // 1) create base user - the authRepo.signUp handles creation, persistence, and session
    const user = await this.authRepo.signUp({
      name: input.name,
      email: input.email,
      role: input.role,
      orgId: undefined, // will be set later for admins
      password: input.password
    });

    // 2) if admin → create organization and link user.orgId
    if (input.role === 'admin') {
      const org: Organization = {
        id: crypto.randomUUID(),
        name: input.companyName ?? 'My Organization',
        industry: input.industry,
        companySize: input.companySize,
        teamSize: input.teamSize,
        businessEmail: input.businessEmail,
        phone: input.phone,
        country: input.country,
        ownerUserId: user.id,
        createdAt: Date.now(),
      };
      await this.orgRepo.create(org);
      
      // Update user with orgId in both auth repository and user repository
      const updatedUser = { ...user, orgId: org.id };
      await this.authRepo.updateUser(updatedUser);
      await this.userRepo.create(updatedUser); // also save to user repository for consistency
      
      return updatedUser;
    }

    // For non-admin users, also save to UserRepository for consistency
    await this.userRepo.create(user);
    return user;
  }
}
