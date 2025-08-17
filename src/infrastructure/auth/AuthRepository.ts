import type { 
  SignUpData, 
  AuthCredentials, 
  AuthResponse, 
  PasswordResetData, 
  PasswordResetConfirmData,
  EmailVerificationData,
  AuthToken,
  AuthError
} from '../../domain/auth';
import type { UserRole, AdminData } from '../../domain/entities/User';
import type { User } from '../../domain/entities/User';
import { AuthErrorType } from '../../domain/auth';

// Legacy User interface for backward compatibility
interface LegacyUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  createdAt: number;
  updatedAt: Date;
  emailVerified?: boolean;
  hourlyRate?: number;
  adminData?: AdminData; // Add admin data support
}

// Legacy Auth Repository interface
interface LegacyAuthRepository {
  signUp(data: SignUpData): Promise<AuthResponse>;
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;
  signOut(): Promise<void>;
  refreshToken(): Promise<AuthToken>;
  resetPassword(data: PasswordResetData): Promise<void>;
  confirmPasswordReset(data: PasswordResetConfirmData): Promise<void>;
  verifyEmail(data: EmailVerificationData): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

// Mock API service for demonstration
// In a real application, this would connect to your backend
class AuthApiService {
  // private baseUrl = '/api/auth'; // Unused in mock implementation
  private users: Map<string, { user: LegacyUser; password: string }> = new Map();

  constructor() {
    // Add a regular user for testing
    const regularUser: LegacyUser = {
      id: 'user-1',
      email: 'user@company.com',
      fullName: 'Regular User',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-01-02').getTime(),
      updatedAt: new Date(),
      emailVerified: true,
      hourlyRate: 25,
    };

    this.users.set('user@company.com', { 
      user: regularUser, 
      password: 'user123' 
    });

    // Add an admin user for testing
    const adminUser: LegacyUser = {
      id: 'admin-1',
      email: 'admin@company.com',
      fullName: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date(),
      emailVerified: true,
      hourlyRate: 50,
      adminData: {
        companyName: 'Test Company',
        jobRole: 'Project Manager',
        businessType: 'technology',
        employeeCount: '11-50',
      },
    };

    this.users.set('admin@company.com', { 
      user: adminUser, 
      password: 'admin123' 
    });
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    if (this.users.has(data.email)) {
      throw this.createError(AuthErrorType.EMAIL_ALREADY_EXISTS, 'Email already exists');
    }

    // Create user with specified role
    const user: LegacyUser = {
      id: this.generateId(),
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: new Date(),
      emailVerified: false,
      hourlyRate: data.role === 'admin' ? 50 : 25, // Default hourly rate based on role
    };

    // Add admin data if role is admin
    if (data.role === 'admin' && data.adminData) {
      user.adminData = data.adminData;
    }

    // Store user (in real app, this would be in database)
    this.users.set(data.email, { user, password: data.password });

    // Generate tokens
    const tokens: AuthToken = {
      accessToken: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return { user: legacyUserToUser(user), tokens };
  }

  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userData = this.users.get(credentials.email);
    if (!userData || userData.password !== credentials.password) {
      throw this.createError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Generate tokens
    const tokens: AuthToken = {
      accessToken: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return { user: legacyUserToUser(userData.user), tokens };
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would validate the token and return user data
    // For demo purposes, return null (user needs to sign in)
    return null;
  }

  async refreshToken(): Promise<AuthToken> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      accessToken: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async resetPassword(data: PasswordResetData): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!this.users.has(data.email)) {
      throw this.createError(AuthErrorType.INVALID_CREDENTIALS, 'Email not found');
    }

    // In a real app, this would send a password reset email
    console.log(`Password reset email sent to ${data.email}`);
  }

  async confirmPasswordReset(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would validate the token and update the password
    console.log('Password reset confirmed');
  }

  async verifyEmail(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would validate the token and mark email as verified
    console.log('Email verified');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2, 20);
  }

  private createError(type: AuthErrorType, message: string): AuthError {
    return { type, message };
  }
}

// Helper function to convert LegacyUser to new User format
function legacyUserToUser(legacyUser: LegacyUser): User {
  return {
    id: legacyUser.id,
    email: legacyUser.email,
    passwordHash: '', // Not available in legacy format
    name: legacyUser.fullName,
    role: legacyUser.role,
    adminData: legacyUser.adminData, // Include admin data
    createdAt: legacyUser.createdAt,
  };
}

export class AuthRepository implements LegacyAuthRepository {
  private apiService = new AuthApiService();
  private readonly STORAGE_KEY = 'auth.currentUser';

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      return await this.apiService.signUp(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiService.signIn(credentials);
      // Store user in localStorage for persistence
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response.user));
      } catch (storageError) {
        console.error('Error storing user in localStorage:', storageError);
        // Continue even if localStorage fails
      }
      return response;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    // In a real app, this would call the backend to invalidate tokens
    console.log('User signed out');
    // Clear user from localStorage
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage during signOut:', error);
      // Continue even if localStorage fails
    }
  }

  async refreshToken(): Promise<AuthToken> {
    try {
      return await this.apiService.refreshToken();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      await this.apiService.resetPassword(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<void> {
    try {
      // In a real implementation, this would validate the token and update the password
      console.log(`Confirming password reset for token: ${data.token}`);
      await this.apiService.confirmPasswordReset();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(data: EmailVerificationData): Promise<void> {
    try {
      // In a real implementation, this would validate the token and mark email as verified
      console.log(`Verifying email with token: ${data.token}`);
      await this.apiService.verifyEmail();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get user from localStorage
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        try {
          const raw = JSON.parse(userData) as Partial<LegacyUser>;
          // Validate required fields
          if (!raw.id || !raw.email || !raw.fullName) {
            throw new Error('Invalid user data structure');
          }
          const legacyUser: LegacyUser = { 
            id: raw.id,
            email: raw.email,
            fullName: raw.fullName,
            role: this.normalizeRole(raw.role),
            status: raw.status || 'active',
            createdAt: raw.createdAt ? raw.createdAt : Date.now(),
            updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
            emailVerified: raw.emailVerified ?? false,
            hourlyRate: raw.hourlyRate ?? 25,
            adminData: raw.adminData // Include admin data from localStorage
          };
          const user = legacyUserToUser(legacyUser);
          return user;
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem(this.STORAGE_KEY);
          return null;
        }
      }
      
      // Fallback to API service (which returns null for demo)
      return await this.apiService.getCurrentUser();
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  private normalizeRole(value: unknown): UserRole {
    if (value === 'admin' || value === 'ADMIN') {
      return 'admin';
    }
    return 'user';
  }

  private handleError(error: unknown): AuthError {
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      return error as AuthError;
    }
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
    };
  }
} 