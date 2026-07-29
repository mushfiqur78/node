import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch properties from API
 */

export interface PropertyImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface PropertyData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  pricing: {
    totalPrice?: number;
    rentPerMonth?: number;
    pricePerSqft?: number;
  };
  areaSize: number;
  bedrooms?: number;
  bathrooms?: number;
  featuredImage: PropertyImage;
  gallery?: PropertyImage[];
  type: {
    _id: string;
    name: string;
    slug: string;
  };
  location: {
    _id: string;
    name: string;
    slug: string;
    city?: string;
  };
  purpose: {
    _id: string;
    name: string;
    slug: string;
  };
  label?: {
    _id: string;
    name: string;
    color: string;
  };
  status: string;
  verified?: boolean;
  featured?: boolean;
  viewCount?: number;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesResponse {
  properties: PropertyData[];
  total: number;
  page: number;
  pages: number;
}

export interface UsePropertiesParams {
  purpose?: string;
  type?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useProperties = (
  params: UsePropertiesParams = {},
  options?: Omit<UseQueryOptions<PropertiesResponse>, 'queryKey' | 'queryFn'>
) => {
  const queryParams = new URLSearchParams();
  
  if (params.purpose) queryParams.set('purpose', params.purpose);
  if (params.type) queryParams.set('type', params.type);
  if (params.location) queryParams.set('location', params.location);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

  return useQuery({
    queryKey: ['properties', params],
    queryFn: async () => {
      const { data } = await api.get(`/properties?${queryParams.toString()}`);
      return data.data as PropertiesResponse;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};
