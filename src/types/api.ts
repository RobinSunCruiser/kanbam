/**
 * API response types
 * Generic response wrapper for all API endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
