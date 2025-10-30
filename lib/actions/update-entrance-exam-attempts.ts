'use server';
import { validateAuth } from '@/lib/auth';
import { UpdateExamAttemptRequest, UpdateExamAttemptData } from '@/types/exam-attempts';

interface UpdateExamAttemptApiResponse {
  success: boolean;
  message: string;
  data: UpdateExamAttemptData;
  details?: []
}

// Server action response type
interface UpdateExamAttemptResult {
  success: boolean;
  data?: UpdateExamAttemptData;
  error?: string;
}

export async function updateEntranceExamAttempt(
  request: UpdateExamAttemptRequest
): Promise<UpdateExamAttemptResult> {
  try {
    // Validate authentication
    const authResult = await validateAuth();

    if (!authResult) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user has admin role to update exam attempts
    if (authResult.admin.role !== 'admin') {
      return {
        success: false,
        error: 'Insufficient permissions. Admin role required.'
      };
    }

    // Validate request data
    if (!request.attemptId || typeof request.attemptId !== 'number') {
      return {
        success: false,
        error: 'Valid attempt ID is required'
      };
    }

    if (typeof request.passed !== 'boolean') {
      return {
        success: false,
        error: 'Passed status must be a boolean value'
      };
    }

    // if (!request.feedback || typeof request.feedback !== 'string') {
    //   return {
    //     success: false,
    //     error: 'Feedback is required and must be a string'
    //   };
    // }

    // if (typeof request.marks !== 'number' || request.marks < 0) {
    //   return {
    //     success: false,
    //     error: 'Marks must be a non-negative number'
    //   };
    // }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/entrance-exam-attempts`;

    // Make API call to backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authResult.tokens.adminAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attemptId: request.attemptId,
        passed: request.passed,
        feedback: request.feedback,
        marks: request.marks
      })
    });

    const apiResponse: UpdateExamAttemptApiResponse = await response.json();

    if (!response.ok) {
      // Handle different error status codes
      switch (response.status) {
        case 400:
          return {
            success: false,
            error: 'Invalid request data. Please check all fields.'
          };
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
            error: 'Exam attempt not found.'
          };
        case 409:
          return {
            success: false,
            error: 'Exam attempt has already been graded.'
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



    // Validate API response structure
    if (!apiResponse.success || !apiResponse.data) {
      return {
        success: false,
        error: apiResponse.message || 'Invalid response from server'
      };
    }

    return {
      success: true,
      data: apiResponse.data
    };

  } catch (error) {
    console.error('Error updating exam attempt:', error);

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while updating the exam attempt.'
    };
  }
}