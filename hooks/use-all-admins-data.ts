import { useQuery } from '@tanstack/react-query';
import { fetchAllAdmins } from '@/lib/actions/admin';

export function useFetchAllAdmins() {
  return useQuery({
    queryKey: ['fetch-all-admins'],
    queryFn: fetchAllAdmins,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    select: (result) => result.data || [],
    enabled: true,
  });
}