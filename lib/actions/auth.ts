// lib/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  ApiResponse 
} from '@/types/auth';
import { RequestInit } from 'next/dist/server/web/spec-extension/request';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // console.log('started - fetch call')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    // console.log('end fetch call --->')

    console.log(options)
    
    const data = await response.json();

    console.log("after data jdon ->", data.message, response.status)

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

export async function loginAction(credentials: LoginCredentials): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await apiCall<AuthResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Login failed'
      };
    }

    // Set auth cookies
    await setAuthCookies(response.data.data.tokens);

    return { success: true };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function signupAction(credentials: SignupCredentials): Promise<{
  success: boolean;
  error?: string;
}> {
  try {

    console.log('started the api call --->')
    const response = await apiCall<AuthResponse>('/admin/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log("end of api call --->")
    console.log(response.success, response.data?.data)

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Signup failed'
      };
    }
    // Set auth cookies
    await setAuthCookies(response.data.data.tokens);

    return { success: true };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect('/login');
}

export async function clearAuthAction(): Promise<void> {
  await clearAuthCookies();
}

export async function redirectToDashboard(): Promise<void> {
  redirect('/dashboard');
}