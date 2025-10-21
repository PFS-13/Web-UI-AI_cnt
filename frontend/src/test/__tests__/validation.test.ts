import {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  validateUsername,
  validateMessageContent,
  validateFile,
  isValidUrl,
  validateInput
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('sanitizeInput', () => {
    it('should sanitize HTML content', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F';
      const result = sanitizeInput(input);
      expect(result).toBe('HelloWorld');
    });

    it('should normalize whitespace', () => {
      const input = 'Hello    World\n\n\n';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require minimum length', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const result = validateUsername('validuser123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject usernames with invalid characters', () => {
      const result = validateUsername('user@name');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, hyphens, and underscores');
    });

    it('should enforce length limits', () => {
      const shortResult = validateUsername('ab');
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.errors).toContain('Username must be at least 3 characters long');

      const longResult = validateUsername('a'.repeat(21));
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors).toContain('Username must be less than 20 characters');
    });
  });

  describe('validateMessageContent', () => {
    it('should validate normal messages', () => {
      const result = validateMessageContent('Hello world!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty messages', () => {
      const result = validateMessageContent('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message cannot be empty');
    });

    it('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(4001);
      const result = validateMessageContent(longMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message must be less than 4000 characters');
    });

    it('should reject messages with harmful content', () => {
      const harmfulMessage = '<script>alert("xss")</script>';
      const result = validateMessageContent(harmfulMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message contains potentially harmful content');
    });
  });

  describe('validateFile', () => {
    it('should validate correct files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject files that are too large', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should reject unsupported file types', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type not allowed for security reasons');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('just-text')).toBe(false);
      expect(isValidUrl('://example.com')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });
  });

  describe('validateInput', () => {
    it('should validate input with custom rules', () => {
      const result = validateInput('test@example.com', {
        required: true,
        minLength: 5,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate with custom validator', () => {
      const result = validateInput('test', {
        custom: (value) => value.length > 5 ? 'Too long' : null
      });
      
      expect(result.isValid).toBe(true);
    });

    it('should fail validation with custom validator', () => {
      const result = validateInput('test', {
        custom: (value) => value.length < 5 ? 'Too short' : null
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too short');
    });
  });
});
