import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch site statistics
 */

export interface SiteStats {
  totalProperties: number;
  verifiedProperties: number;
  activeUsers: number;
  propertiesByPurpose: {
    [key: string]: number;
  };
}

export interface TrustIndicator {
  id: number;
  icon: string;
  text: string;
  color: string;
  active: boolean;
}

export interface LiveIndicator {
  id: number;
  text: string;
  color: string;
  active: boolean;
}

export interface SiteStatsResponse {
  stats: SiteStats;
  trustIndicators: TrustIndicator[];
  liveIndicators: LiveIndicator[];
}

export const useSiteStats = () => {
  return useQuery({
    queryKey: ['siteStats'],
    queryFn: async () => {
      const { data } = await api.get('/stats/site');
      return data.data as SiteStatsResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};
