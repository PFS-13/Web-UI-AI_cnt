import { validateEmail, validatePassword, validateUsername } from './helpers';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  if (!validateEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (!password.trim()) {
    return { isValid: false, message: 'Password is required' };
  }

  return { isValid: true };
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  if (!validateEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (!password.trim()) {
    return { isValid: false, message: 'Password is required' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  if (!confirmPassword.trim()) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

export const validateConversationTitle = (title: string): ValidationResult => {
  if (!title.trim()) {
    return { isValid: false, message: 'Conversation title is required' };
  }

  if (title.trim().length < 3) {
    return { isValid: false, message: 'Title must be at least 3 characters long' };
  }

  if (title.trim().length > 100) {
    return { isValid: false, message: 'Title must be no more than 100 characters long' };
  }

  return { isValid: true };
};

export const validateMessage = (content: string): ValidationResult => {
  if (!content.trim()) {
    return { isValid: false, message: 'Message cannot be empty' };
  }

  if (content.trim().length > 4000) {
    return { isValid: false, message: 'Message is too long (max 4000 characters)' };
  }

  return { isValid: true };
};
