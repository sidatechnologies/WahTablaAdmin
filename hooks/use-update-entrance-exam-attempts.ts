// hooks/useUpdateExamAttempt.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateExamAttemptRequest, UpdateExamAttemptData } from '@/types/exam-attempts';
import { updateEntranceExamAttempt } from '@/lib/actions/update-entrance-exam-attempts';
import { toast } from 'sonner';


interface UpdateExamAttemptResult {
  success: boolean;
  data?: UpdateExamAttemptData;
  error?: string;
}

interface UseUpdateExamAttemptOptions {
  onSuccess?: (data: UpdateExamAttemptData) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  invalidateQueries?: string[];
}

export const useUpdateEntranceExamAttempt = (options?: UseUpdateExamAttemptOptions) => {
  const queryClient = useQueryClient();

  const {
    onSuccess,
    onError,
    showToast = true,
    invalidateQueries = ['exam-attempts']
  } = options || {};

  return useMutation<UpdateExamAttemptResult, Error, UpdateExamAttemptRequest>({
    mutationFn: async (request: UpdateExamAttemptRequest) => {
      return await updateEntranceExamAttempt(request);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Show success toast
        if (showToast) {
          toast.success('Exam attempt updated successfully!');
        }

        // Invalidate and refetch related queries
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });

        // Call custom onSuccess callback
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        // Handle server action error
        const errorMessage = result.error || 'Failed to update exam attempt';
        
        if (showToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(errorMessage);
        }
      }
    },
    onError: (error) => {
      // Handle mutation error (network, etc.)
      const errorMessage = error.message || 'An unexpected error occurred';
      
      if (showToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(errorMessage);
      }
    },
  });
};