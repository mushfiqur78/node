import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch property types from API
 */
export interface PropertyType {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
}

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['propertyTypes'],
    queryFn: async () => {
      const { data } = await api.get('/config/public/property-types');
      return data.data.items as PropertyType[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
