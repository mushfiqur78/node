import { format } from 'date-fns';

/**
 * Format date
 */
export const formatDate = (date: string | Date, fmt = 'dd MMM yyyy') =>
  format(new Date(date), fmt);

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd MMM yyyy, HH:mm');

/**
 * Format currency in BDT (Bangladeshi Taka)
 */
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', { 
    style: 'currency', 
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Format number with commas
 */
export const formatNumber = (num: number) =>
  new Intl.NumberFormat('bn-BD').format(num);

/**
 * Build query string from params object
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return qs.toString();
};

/**
 * Get error message from axios error
 */
export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};
