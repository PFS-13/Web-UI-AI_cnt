import type { 
  RegisterCredentials, 
  AuthResponse, 
  CheckEmailResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse, 
  TokenType
} from '../../types/auth.types';
import type { User } from '../../types/auth.types';
const API_BASE_URL = import.meta.env.VITE_API_URL;

class AuthAPI {
  private isRefreshing = false;
  private refreshPromise: Promise<Response> | null = null;

  // Hanya halaman ini yang redirect ke login bila refresh gagal
  private protectedPaths = [
    '/chat',
    '/c/',
    '/conversations',
    '/file-upload',
  ];

  private isProtectedPath(path: string): boolean {
    return this.protectedPaths.some(p => path.startsWith(p));
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    let response = await fetch(url, config);

    if (response.status === 401) {
      // Jika refresh sedang berlangsung, tunggu dulu
      if (this.isRefreshing && this.refreshPromise) {
        await this.refreshPromise;
        response = await fetch(url, config);
      } else {
        this.isRefreshing = true;
        this.refreshPromise = fetch(`${API_BASE_URL}/auth/v1/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        const refreshResponse = await this.refreshPromise;
        this.isRefreshing = false;
        this.refreshPromise = null;

        const currentPath = window.location.pathname;
        const isProtected = this.isProtectedPath(currentPath);

        if (refreshResponse.ok) {
          // refresh token sukses → ulang request
          response = await fetch(url, config);
        } else {
          // refresh gagal → hanya untuk halaman protected
          if (isProtected) {
            console.warn('[Auth] Refresh token expired, redirecting to login...');
            window.location.replace('/login');
          } else {
            // Non-protected route, jangan spam error
            console.info('[Auth] Unauthorized (unprotected path), ignoring 401.');
          }
          throw new Error('Refresh token expired');
        }
      }
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const currentPath = window.location.pathname;
      // Hanya log error kalau sedang di halaman protected
      if (this.isProtectedPath(currentPath)) {
        console.error(`[Auth] Request failed: ${response.status} ${response.statusText}`, data);
      }
      throw data;
    }

    return data;
  }

  async getMe(): Promise<User> {
    return this.request('/auth/v1/me', { method: 'GET' });
  }
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    return this.request<CheckEmailResponse>(`/auth/v1/check-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/v1/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async changeUsername(username: string, user_id: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(`/auth/v1/users/${user_id}/change-username`, {
      method: 'PATCH',
      body: JSON.stringify({ username }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/v1/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<AuthResponse>('/auth/v1/logout', {
      method: 'POST',
    });
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/v1/verify-otp', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async resendEmail(email : string, token_type: TokenType): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/v1/resend-email', {
      method: 'POST',
      body: JSON.stringify({email, token_type}),
    });
  }

  async changePassword(user_id: string, new_password: string): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>(`/auth/v1/users/${user_id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify({new_password}),
    });
  }

  async getGoogleAuthUrl(email?: string): Promise<string> {
    const baseUrl = `${API_BASE_URL}/auth/google`;
    return email ? `${baseUrl}?email=${encodeURIComponent(email)}` : baseUrl;
  }
}

export const authAPI = new AuthAPI();
