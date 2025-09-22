export const API_ENDPOINTS = {
  AUTH: {
    CHECK_EMAIL: '/auth/v1/check-email',
    REGISTER: '/auth/v1/register',
    VERIFY_OTP: '/auth/v1/verify-otp',
    GOOGLE_AUTH: '/auth/google',
  },
  CONVERSATION: {
    GET_BY_USER: '/conversation/v1/conversations/user',
    CREATE: '/conversation/v1/create',
    EDIT: '/conversation/v1/conversations/edit',
    SHARE: '/conversation/v1/conversations',
    DELETE: '/conversation/v1/conversations',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth-callback',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  PROFILE: '/profile',
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  PAGINATION_LIMIT: 20,
} as const;
