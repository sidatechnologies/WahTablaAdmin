// hooks/useExamAttempts.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchEntranceExamAttempts } from '@/lib/actions/entrance-exam-attempts';
import { EntranceExamAttempt, ExamAttemptsPagination } from '@/types/exam-attempts';

interface UseExamAttemptsOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface ExamAttemptsQueryResult {
  data: EntranceExamAttempt[];
  pagination: ExamAttemptsPagination;
}

export function useEntranceExamAttempts(options: UseExamAttemptsOptions = {}) {
  const { page = 1, limit = 1000, enabled = true } = options;

  return useQuery<ExamAttemptsQueryResult, Error>({
    queryKey: ['exam-attempts', { page, limit }],
    queryFn: async () => {
      const result = await fetchEntranceExamAttempts(page, limit);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch exam attempts');
      }
      return {
        data: result.data || [],
        pagination: result.pagination || { page, limit, total: 0, totalPages: 1 },
      };
    },
    enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Additional hook for manual refetch with loading state
export function useEntranceExamAttemptsRefresh() {
  const { refetch, isRefetching } = useEntranceExamAttempts();

  const refreshExamAttempts = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh exam attempts:', error);
      throw error;
    }
  };

  return {
    refreshExamAttempts,
    isRefreshing: isRefetching,
  };
}

// Hook for client-side pagination (20 per page for frontend display)
export function useExamAttemptsPagination(examAttempts: EntranceExamAttempt[] = []) {
  const ITEMS_PER_PAGE = 20;

  const getPaginatedData = (currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      data: examAttempts.slice(startIndex, endIndex),
      pagination: {
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        totalItems: examAttempts.length,
        totalPages: Math.ceil(examAttempts.length / ITEMS_PER_PAGE),
        hasNextPage: endIndex < examAttempts.length,
        hasPreviousPage: currentPage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, examAttempts.length),
      }
    };
  };

  return { getPaginatedData, ITEMS_PER_PAGE };
}