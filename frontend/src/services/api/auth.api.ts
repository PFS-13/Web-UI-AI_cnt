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

    const response = await fetch(url, config);

    // handle 204 (No Content)
    if (response.status === 204) return null as any;

    const text = await response.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      // balikin error dalam bentuk json
      throw data;
    }

    return data as T;
  }


  async getMe(): Promise<User> {
    return this.request('/auth/v1/me', { method: 'GET' });
  }

  async checkEmail(email: string): Promise<CheckEmailResponse> {
    return this.request<CheckEmailResponse>(`/auth/v1/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/v1/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

  async getGoogleAuthUrl(email?: string): Promise<String> {
    const baseUrl = `${API_BASE_URL}/auth/google`;
    return email ? `${baseUrl}?email=${encodeURIComponent(email)}` : baseUrl;
  }
}

export const authAPI = new AuthAPI();
