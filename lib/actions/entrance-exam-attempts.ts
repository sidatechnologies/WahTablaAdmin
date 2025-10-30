'use server';
import { validateAuth } from '@/lib/auth';
import { EntranceExamAttempt, ExamAttemptsPagination } from '@/types/exam-attempts';

interface FetchEntranceExamAttemptsApiResponse {
  success: boolean;
  data: EntranceExamAttempt[];
  pagination: ExamAttemptsPagination;
  message: string;
}

// Server action response type
interface FetchEntranceExamAttemptsResult {
  success: boolean;
  data?: EntranceExamAttempt[];
  pagination?: ExamAttemptsPagination;
  error?: string;
}

export async function fetchEntranceExamAttempts(
  page: number = 1,
  limit: number = 10
): Promise<FetchEntranceExamAttemptsResult> {
  try {
    // Validate authentication
    const authResult = await validateAuth();
   
    if (!authResult) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user has admin role to fetch exam attempts
    if (authResult.admin.role !== 'admin') {
      return {
        success: false,
        error: 'Insufficient permissions. Admin role required.'
      };
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/entrance-exam-attempts?page=${page}&limit=${limit}`;

    // Make API call to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.tokens.adminAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log({response})

    if (!response.ok) {
      // Handle different error status codes
      switch (response.status) {
        case 401:
          return {
            success: false,
            error: 'Authentication failed. Please log in again.'
          };
        case 403:
          return {
            success: false,
            error: 'Access denied. Insufficient permissions.'
          };
        case 404:
          return {
            success: false,
            error: 'Exam attempts endpoint not found.'
          };
        case 500:
          return {
            success: false,
            error: 'Server error. Please try again later.'
          };
        default:
          return {
            success: false,
            error: `Request failed with status ${response.status}`
          };
      }
    }

    const apiResponse: FetchEntranceExamAttemptsApiResponse = await response.json();

    // Validate API response structure
    if (!apiResponse.success || !apiResponse.data) {
      return {
        success: false,
        error: apiResponse.message || 'Invalid response from server'
      };
    }

    return {
      success: true,
      data: apiResponse.data,
      pagination: apiResponse.pagination
    };

  } catch (error) {
    console.error('Error fetching exam attempts:', error);
   
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while fetching exam attempts.'
    };
  }
}