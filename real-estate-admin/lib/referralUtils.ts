import { format } from 'date-fns';

export const formatDate = (date: string | Date, fmt = 'dd MMM yyyy') =>
  format(new Date(date), fmt);

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd MMM yyyy, HH:mm');

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const buildQueryString = (params: Record<string, unknown>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return qs.toString();
};

export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};
