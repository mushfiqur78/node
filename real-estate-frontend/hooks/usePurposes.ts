import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch purposes (buy/rent/sell) from API
 */
export interface Purpose {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export const usePurposes = () => {
  return useQuery({
    queryKey: ['purposes'],
    queryFn: async () => {
      const { data } = await api.get('/config/public/purposes');
      return data.data.items as Purpose[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - purposes rarely change
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
};
