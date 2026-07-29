import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get backend base URL (without /api/v1)
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?.replace('/api/v1', '')
  ?.replace('/api', '') || 'http://localhost:5001';

/**
 * Convert relative URL to full URL
 * Returns placeholder image if URL is empty or invalid
 */
export const toFullUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=No+Image';
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};
