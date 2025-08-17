import type { AuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

export class LoginUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return await this.authRepository.signIn(email, password);
  }
}
