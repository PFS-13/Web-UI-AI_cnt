import type { ApiResponse, ApiError } from '../../types';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  CheckEmailResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse 
} from '../../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthAPI {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async checkEmail(email: string): Promise<CheckEmailResponse> {
    return this.request<CheckEmailResponse>('/auth/v1/check-email', {
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

  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/v1/verify-otp', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async getGoogleAuthUrl(email?: string): string {
    const baseUrl = `${API_BASE_URL}/auth/google`;
    return email ? `${baseUrl}?email=${encodeURIComponent(email)}` : baseUrl;
  }
}

export const authAPI = new AuthAPI();
