import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch homepage banners/sliders
 */

export interface BannerImage {
  url: string;
  alt?: string;
  title?: string;
}

export interface Banner {
  _id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  titleFontSize?: string;
  overlayOpacity?: number;
  image: BannerImage;
  buttonText?: string;
  buttonUrl?: string;
  buttonTarget?: '_self' | '_blank';
  type: 'banner' | 'slider';
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  banners: Banner[];
  mode: 'banner' | 'slider';
}

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data } = await api.get('/banners');
      return data.data as BannersResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - banners don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};
