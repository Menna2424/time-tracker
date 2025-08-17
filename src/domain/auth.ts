// Domain layer for authentication
// Contains core business models, interfaces, and use cases

import type { UserRole } from './entities/User';
import type { User } from './entities/User';

export type { UserRole };
export type { User };

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AdminSignUpData {
  companyName: string;
  jobRole: string;
  businessType: string;
  employeeCount?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  adminData?: AdminSignUpData; // Only required when role is 'admin'
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  tokens: AuthToken;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
}

export interface EmailVerificationData {
  token: string;
}

// Repository interfaces
export interface IAuthRepository {
  signUp(data: SignUpData): Promise<AuthResponse>;
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;
  signOut(): Promise<void>;
  refreshToken(): Promise<AuthToken>;
  resetPassword(data: PasswordResetData): Promise<void>;
  confirmPasswordReset(data: PasswordResetConfirmData): Promise<void>;
  verifyEmail(data: EmailVerificationData): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface ITokenStorage {
  saveTokens(tokens: AuthToken): void;
  getTokens(): AuthToken | null;
  clearTokens(): void;
  isTokenValid(): boolean;
}

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  generateTokens(user: User): Promise<AuthToken>;
  validateToken(token: string): Promise<boolean>;
}

// Use case interfaces
export interface IAuthUseCases {
  signUp(data: SignUpData): Promise<AuthResponse>;
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;
  signOut(): Promise<void>;
  refreshAuth(): Promise<User | null>;
  resetPassword(data: PasswordResetData): Promise<void>;
  confirmPasswordReset(data: PasswordResetConfirmData): Promise<void>;
  verifyEmail(data: EmailVerificationData): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
  clearError(): void;
}

// Validation schemas
export interface ValidationRules {
  email: {
    required: string;
    format: string;
  };
  password: {
    required: string;
    minLength: string;
    complexity: string;
  };
  fullName: {
    required: string;
    minLength: string;
  };
}

export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  email: {
    required: 'Email is required',
    format: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    complexity: 'Password must contain uppercase, lowercase, number, and special character',
  },
  fullName: {
    required: 'Full name is required',
    minLength: 'Full name must be at least 2 characters',
  },
};

// Error types
export const AuthErrorType = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];

export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
} 