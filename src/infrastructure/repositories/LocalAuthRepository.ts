import type { AuthRepository } from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/entities/User';

export class LocalAuthRepository implements AuthRepository {
  private readonly USERS_KEY = 'tt.users';
  private readonly CURRENT_USER_KEY = 'tt.auth.currentUserId';

  constructor() {
    this.initializeDemoUsers();
  }

  private initializeDemoUsers(): void {
    const users = this.getUsers();
    
    // Only add demo users if no users exist
    if (users.length === 0) {
      const demoUsers: User[] = [
        {
          id: 'admin-demo',
          email: 'admin@demo.com',
          name: 'Admin User',
          role: 'admin',
          orgId: 'demo-org',
          passwordHash: btoa('admin123'), // demo123
          createdAt: Date.now(),
        },
        {
          id: 'user-demo',
          email: 'user@demo.com',
          name: 'Regular User',
          role: 'user',
          passwordHash: btoa('user123'), // user123
          createdAt: Date.now(),
        }
      ];
      
      this.saveUsers(demoUsers);
      console.log('Demo users created: admin@demo.com (admin123), user@demo.com (user123)');
    }
  }

  async signUp(user: Omit<User, 'id'|'createdAt'|'passwordHash'> & { password: string }): Promise<User> {
    // Create user with generated ID and hashed password
    const newUser: User = {
      id: crypto.randomUUID(),
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      passwordHash: btoa(user.password), // mock hash for dev only
      createdAt: Date.now(),
    };

    // Get existing users
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === user.email)) {
      throw new Error('Email already exists');
    }

    // Add new user
    users.push(newUser);
    this.saveUsers(users);

    // Set as current user for immediate login
    localStorage.setItem(this.CURRENT_USER_KEY, newUser.id);

    return newUser;
  }

  // Add method to update user - needed for admin org linking
  async updateUser(updatedUser: User): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update the user
    users[userIndex] = updatedUser;
    this.saveUsers(users);

    // If this is the current user, update their session
    const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
    if (currentUserId === updatedUser.id) {
      // Session remains valid, user data is updated
    }

    return updatedUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.passwordHash !== btoa(password)) {
      throw new Error('Invalid email or password');
    }

    // Set as current user
    localStorage.setItem(this.CURRENT_USER_KEY, user.id);

    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  async currentUser(): Promise<User | null> {
    const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!currentUserId) {
      return null;
    }

    const users = this.getUsers();
    return users.find(u => u.id === currentUserId) || null;
  }

  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }
}
