import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ApiError } from '../types/api.types';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const { addToast } = useToast();

  const handleError = useCallback((
    error: unknown,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    let errorMessage = fallbackMessage;
    let errorType: 'error' | 'warning' = 'error';

    // Extract error message based on error type
    if (error instanceof ApiError) {
      errorMessage = error.message;
      errorType = error.status >= 500 ? 'error' : 'warning';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    // Log error for debugging
    if (logError) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, {
        error,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    // Show toast notification
    if (showToast) {
      addToast(errorMessage, errorType);
    }

    return errorMessage;
  }, [addToast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options?: ErrorHandlerOptions
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context, options);
      return null;
    }
  }, [handleError]);

  const handleApiError = useCallback((
    error: unknown,
    context?: string,
    options?: ErrorHandlerOptions
  ) => {
    let errorMessage = 'API request failed';

    if (error instanceof ApiError) {
      errorMessage = error.message;
      
      // Handle specific HTTP status codes
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'A conflict occurred. Please try again.';
          break;
        case 422:
          errorMessage = 'Validation failed. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
    }

    return handleError(error, context, {
      ...options,
      fallbackMessage: errorMessage
    });
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    handleApiError
  };
};
