export type UserRole = 'admin' | 'user';

export interface AdminData {
  companyName: string;
  jobRole: string;
  businessType: string;
  employeeCount?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // mock for now
  name: string;
  role: UserRole;
  orgId?: string;         // present for admins and members of an org
  adminData?: AdminData;  // present only for admin users
  createdAt: number;
}
