export interface User {
  id: string;
  email: string;
  username?: string;
  image_url?: string;
  is_active: boolean;
  provider: 'manual' | 'google';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user_id?: string;
  token?: string;
}

export interface CheckEmailResponse {
  provider: string | null;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  token_type: TokenType;
}

export interface VerifyOtpResponse {
  message: string;
  user_id?: string;
}

export const TokenType = {
  AUTH: "auth",
  FORGOT_PASSWORD: "forgot_password",
} as const;

export type TokenType = typeof TokenType[keyof typeof TokenType];