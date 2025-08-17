import type { AuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

export class GetCurrentUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<User | null> {
    return await this.authRepository.currentUser();
  }
}
