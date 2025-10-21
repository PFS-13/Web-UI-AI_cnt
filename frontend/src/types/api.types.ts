export interface ApiResponse<T = unknown> {
  data?: T;
  message: string;
  success: boolean;
  error?: string;
}

export class ApiError extends Error {
  public status: number;
  public details?: unknown;
  
  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}
