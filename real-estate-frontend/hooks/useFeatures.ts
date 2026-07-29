import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Feature { _id: string; name: string; icon?: string; category?: string; }

const fetchConfig = (resource: string) => async () => {
  const { data } = await api.get(`/config/public/${resource}`);
  return data.data.items as Feature[];
};

export const useFeatures   = () => useQuery({ queryKey: ['features'],   queryFn: fetchConfig('features'),   staleTime: 10 * 60 * 1000 });
export const useLabels     = () => useQuery({ queryKey: ['labels'],     queryFn: fetchConfig('statuses'),   staleTime: 10 * 60 * 1000 });
