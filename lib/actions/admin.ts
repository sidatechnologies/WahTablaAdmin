// lib/actions/admin.ts
'use server';

import { validateAuth } from '@/lib/auth';
import { Admin } from '@/types/auth';

interface FetchAdminsApiResponse {
  statusCode: number;
  data: {
    admins: Admin[];
  };
  message: string;
  success: boolean;
}

// Server action response type
interface FetchAdminsResult {
  success: boolean;
  data?: Admin[];
  error?: string;
}

export async function fetchAllAdmins(): Promise<FetchAdminsResult> {
  try {
    // Validate authentication
    const authResult = await validateAuth();
    
    if (!authResult) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user has admin role to fetch other admins
    if (authResult.admin.role !== 'admin') {
      return {
        success: false,
        error: 'Insufficient permissions. Admin role required.'
      };
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;

    // Make API call to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.tokens.adminAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

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
            error: 'Admin endpoint not found.'
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

    const apiResponse: FetchAdminsApiResponse = await response.json();

    // Validate API response structure
    if (!apiResponse.success || !apiResponse.data) {
      return {
        success: false,
        error: apiResponse.message || 'Invalid response from server'
      };
    }

    return {
      success: true,
      data: apiResponse.data.admins
    };

  } catch (error) {
    console.error('Error fetching admins:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while fetching admins.'
    };
  }
}

// Convenience function to fetch only active admins
// export async function fetchActiveAdmins(): Promise<FetchAdminsResult> {
//   const result = await fetchAllAdmins();
  
//   if (!result.success || !result.data) {
//     return result;
//   }
  
//   return {
//     success: true,
//     data: result.data.filter(admin => admin.isActive)
//   };
// }

// Function to fetch admins by role
export async function fetchAdminsByRole(role: 'user' | 'admin'): Promise<FetchAdminsResult> {
  const result = await fetchAllAdmins();
  
  if (!result.success || !result.data) {
    return result;
  }
  
  return {
    success: true,
    data: result.data.filter(admin => admin.role === role)
  };
}