import type { User } from '../entities/User';

export interface AuthRepository {
  signUp(user: Omit<User, 'id'|'createdAt'|'passwordHash'> & { password: string }): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
  updateUser(user: User): Promise<User>;
}
