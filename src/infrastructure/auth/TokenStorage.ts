import Cookies from 'js-cookie';
import type { AuthToken, ITokenStorage } from '../../domain/auth';

export class TokenStorage implements ITokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  saveTokens(tokens: AuthToken): void {
    // Store tokens in HttpOnly cookies for security
    Cookies.set(this.ACCESS_TOKEN_KEY, tokens.accessToken, {
      expires: 1, // 1 day
      secure: true,
      sameSite: 'strict',
    });

    if (tokens.refreshToken) {
      Cookies.set(this.REFRESH_TOKEN_KEY, tokens.refreshToken, {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict',
      });
    }

    // Store expiry time
    Cookies.set(this.TOKEN_EXPIRY_KEY, tokens.expiresAt.toISOString(), {
      expires: 1,
      secure: true,
      sameSite: 'strict',
    });
  }

  getTokens(): AuthToken | null {
    const accessToken = Cookies.get(this.ACCESS_TOKEN_KEY);
    const refreshToken = Cookies.get(this.REFRESH_TOKEN_KEY);
    const expiryString = Cookies.get(this.TOKEN_EXPIRY_KEY);

    if (!accessToken || !expiryString) {
      return null;
    }

    const expiresAt = new Date(expiryString);
    
    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  clearTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
    Cookies.remove(this.TOKEN_EXPIRY_KEY);
  }

  isTokenValid(): boolean {
    const tokens = this.getTokens();
    if (!tokens) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return tokens.expiresAt.getTime() > now.getTime() + bufferTime;
  }

  // Helper method to get just the access token
  getAccessToken(): string | null {
    return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
  }

  // Helper method to get just the refresh token
  getRefreshToken(): string | null {
    return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }
} 