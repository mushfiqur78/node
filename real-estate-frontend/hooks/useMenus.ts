import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  url?: string;
  target: '_self' | '_blank';
  parentId: string | null;
  order: number;
  icon?: string;
  isActive: boolean;
  children: MenuItem[];
}

export interface MenusResponse {
  menus: MenuItem[];
}

export const useMenus = () => {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const { data } = await api.get('/menus');
      return data.data as MenusResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
};
