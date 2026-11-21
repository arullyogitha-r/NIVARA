/**
 * Frontend Configuration for NIVARA.
 * Loads backend API URL from environment variables or falls back to localhost:5000.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
