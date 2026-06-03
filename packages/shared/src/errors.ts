import type { ApiError } from './types';

export function createError(statusCode: number, message: string, error = 'Error'): ApiError {
  return { error, message, statusCode };
}
