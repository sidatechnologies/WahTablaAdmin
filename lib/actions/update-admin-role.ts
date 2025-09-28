// lib/actions/updateAdminRole.ts
'use server';

import { validateAuth } from '@/lib/auth';
import { Admin } from '@/types/auth';

interface UpdateAdminRoleApiResponse {
  statusCode: number;
  data: {
    admin: Admin;
  };
  message: string;
  success: boolean;
}

interface UpdateAdminRoleResult {
  success: boolean;
  data?: Admin;
  error?: string;
}

export async function updateAdminRole(adminId: number, role: 'user' | 'admin' | 'moderator' | 'superadmin'): Promise<UpdateAdminRoleResult> {
  try {
    const authResult = await validateAuth();

    if (!authResult) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    if (authResult.admin.role !== 'admin') {
      return {
        success: false,
        error: 'Insufficient permissions. Admin role required.'
      };
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/role`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authResult.tokens.adminAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminId, role })
    });

    if (!response.ok) {
      switch (response.status) {
        case 400:
          return { success: false, error: 'Invalid role or adminId.' };
        case 401:
          return { success: false, error: 'Authentication failed.' };
        case 403:
          return { success: false, error: 'Unauthorized access.' };
        case 404:
          return { success: false, error: 'Admin not found.' };
        default:
          return { success: false, error: `Error: ${response.status}` };
      }
    }

    const apiResponse: UpdateAdminRoleApiResponse = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      return {
        success: false,
        error: apiResponse.message || 'Invalid response from server'
      };
    }

    return {
      success: true,
      data: apiResponse.data.admin
    };
  } catch (error) {
    console.error('Error updating admin role:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating admin role.'
    };
  }
}
