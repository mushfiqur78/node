import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch locations from API
 */
export interface Location {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  isActive: boolean;
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await api.get('/config/public/locations');
      return data.data.items as Location[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - locations rarely change
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
};
