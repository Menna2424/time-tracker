import type { UserRepository } from '../../domain/repositories/IUserRepository';
import type { User } from '../../domain/entities/User';

export class LocalUserRepository implements UserRepository {
  private readonly USERS_KEY = 'tt.users';

  async create(user: User): Promise<void> {
    const users = this.getUsers();
    
    // Remove existing user with same ID if any
    const filteredUsers = users.filter(u => u.id !== user.id);
    
    // Add the new/updated user
    filteredUsers.push(user);
    
    this.saveUsers(filteredUsers);
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async getById(id: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
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
