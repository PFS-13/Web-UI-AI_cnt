import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and normalize
  const cleaned = input
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  // Use DOMPurify for XSS protection
  return DOMPurify.sanitize(cleaned, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be less than 20 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Message content validation
export const validateMessageContent = (content: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Message cannot be empty');
  }
  
  if (content.length > 4000) {
    errors.push('Message must be less than 4000 characters');
  }
  
  // Check for potentially harmful patterns
  const harmfulPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(content)) {
      errors.push('Message contains potentially harmful content');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File validation
export const validateFile = (file: File): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // File size validation (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // File type validation
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Allowed types: images, PDF, Word documents, text files');
  }
  
  // File name validation
  if (file.name.length > 255) {
    errors.push('File name must be less than 255 characters');
  }
  
  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push('File type not allowed for security reasons');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Generic input validation
export const validateInput = (input: string, rules: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (rules.required && (!input || input.trim().length === 0)) {
    errors.push('This field is required');
  }
  
  if (input && rules.minLength && input.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }
  
  if (input && rules.maxLength && input.length > rules.maxLength) {
    errors.push(`Must be less than ${rules.maxLength} characters long`);
  }
  
  if (input && rules.pattern && !rules.pattern.test(input)) {
    errors.push('Invalid format');
  }
  
  if (input && rules.custom) {
    const customError = rules.custom(input);
    if (customError) {
      errors.push(customError);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
