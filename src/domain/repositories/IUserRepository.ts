import type { User } from '../entities/User';

export interface UserRepository {
  create(user: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
}
