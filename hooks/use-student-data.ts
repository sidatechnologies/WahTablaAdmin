import { useQuery } from '@tanstack/react-query';
import { fetchAllStudents } from '@/lib/actions/student';
import { FetchStudentsResult } from '@/types/student';

export function useStudents() {
  return useQuery<FetchStudentsResult>({
    queryKey: ['students'],
    queryFn: fetchAllStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Optional: Hook with additional utilities
export function useStudentsWithUtils() {
  const query = useQuery<FetchStudentsResult>({
    queryKey: ['students'],
    queryFn: fetchAllStudents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    students: query.data?.success ? query.data.data?.users : [],
    totalUsers: query.data?.success ? query.data.data?.totalUsers : 0,
    usersWithCompleteProfiles: query.data?.success ? query.data.data?.usersWithCompleteProfiles : 0,
    pagination: query.data?.success ? query.data.data?.pagination : null,
    error: query.data?.success === false ? query.data.error : query.error,
  };
}