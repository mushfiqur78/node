/**
 * Shared utilities
 */

// Get backend base URL (without /api/v1)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?.replace('/api/v1', '')
  ?.replace('/api', '') || 'http://localhost:5001';

// Convert relative URL to full URL
export const toFullUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};
