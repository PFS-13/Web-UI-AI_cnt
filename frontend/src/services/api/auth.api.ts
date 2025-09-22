import type { 
  RegisterCredentials, 
  AuthResponse, 
  CheckEmailResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse 
} from '../../types/auth.types';

// class ApiError extends Error {
//   status: number;
//   details?: any;

//   constructor(message: string, status: number, details?: any) {
//     super(message);
//     this.name = 'ApiError';
//     this.status = status;
//     this.details = details;
//   }
// }

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthAPI {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          // Clear invalid session data
          throw new Error('Authentication failed. Please login again.');
        }
        
        // Handle server errors
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Handle client errors
        if (response.status >= 400) {
          throw new Error(`Request failed: ${response.status}`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }



  async checkEmail(email: string): Promise<CheckEmailResponse> {
    return this.request<CheckEmailResponse>('/auth/v1/check-email', {
      method: 'POST',
      body: JSON.stringify({email}),
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

  async resendEmail(email : string): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/v1/resend-email', {
      method: 'POST',
      body: JSON.stringify({email}),
    });
  }

  async getGoogleAuthUrl(email?: string): Promise<String> {
    const baseUrl = `${API_BASE_URL}/auth/google`;
    return email ? `${baseUrl}?email=${encodeURIComponent(email)}` : baseUrl;
  }
}

export const authAPI = new AuthAPI();
