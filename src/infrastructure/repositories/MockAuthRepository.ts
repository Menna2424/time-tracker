import type { AuthRepository } from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/entities/User';


export class MockAuthRepository implements AuthRepository {
  private readonly STORAGE_KEY = 'auth.currentUser';

  async signUp(user: Omit<User, 'id'|'createdAt'|'passwordHash'> & { password: string }): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: user.email,
      passwordHash: user.password, // Mock hash
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      createdAt: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));
    
    return newUser;
  }

  async signIn(email: string, _password: string): Promise<User> { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, treat specific emails as admins
    const isAdmin = email === 'admin@company.com' || email === 'admin';
    
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      passwordHash: '', // Mock
      name: email.split('@')[0], // Use email prefix as name
      role: isAdmin ? 'admin' : 'user',
      createdAt: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    
    return user;
  }

  async signOut(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove from localStorage
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async updateUser(updatedUser: User): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Store updated user in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  async currentUser(): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const userData = localStorage.getItem(this.STORAGE_KEY);
    if (!userData) {
      return null;
    }

    try {
      const user = JSON.parse(userData) as User;
      return user;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
