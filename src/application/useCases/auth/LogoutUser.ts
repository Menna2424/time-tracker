import type { AuthRepository } from '../../../domain/repositories/IAuthRepository';

export class LogoutUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return await this.authRepository.signOut();
  }
}
