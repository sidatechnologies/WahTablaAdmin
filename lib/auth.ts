// lib/auth.ts
import { cookies } from 'next/headers';
import { AuthTokens, Admin, ApiResponse } from '@/types/auth';
import { RequestInit } from 'next/dist/server/web/spec-extension/request';
import jwt from 'jsonwebtoken'



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AdminWithoutPassword {
  adminId: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JWTPayload {
  admin: AdminWithoutPassword;
  iat: number;
  exp: number;
  // Add other fields that are in your JWT
}



export class AuthError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Cookie helpers
export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.adminAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.adminRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAuthTokens(): Promise<AuthTokens | null> {
  const cookieStore = await cookies();
  const adminAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const adminRefreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!adminAccessToken || !adminRefreshToken) {
    return null;
  }

  return { adminAccessToken, adminRefreshToken };
}

// API helpers
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log("api error", data)
    if (!response.ok) {
      throw new AuthError(data.message || 'Request failed', response.status);
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Network error occurred');
  }
}

// Auth API functions
export async function adminRefreshTokens(adminRefreshToken: string): Promise<AuthTokens> {
  const response = await apiCall<AuthTokens>('/admin/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ adminRefreshToken }),
  });

  if (!response.data) {
    throw new AuthError('Failed to refresh tokens');
  }

  return response.data;
}

export async function getCurrentAdmin(adminAccessToken: string): Promise<Admin> {
  const response = await apiCall<Admin>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminAccessToken}`,
    },
  });

  if (!response.data) {
    throw new AuthError('Failed to get admin info');
  }

  return response.data;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}


// Validate and decode JWT token locally
export function validateJWT(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    
    if (typeof decoded === 'object' && decoded !== null && 'admin' in decoded) {
      const payload = decoded as JWTPayload;
      
      // Check if token is expired (jwt.verify should handle this, but double-check)
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new AuthError('Token expired', 401);
      }
      
      // Validate that admin object exists and has required properties
      if (!payload.admin || typeof payload.admin !== 'object') {
        throw new AuthError('Invalid token structure - missing admin', 401);
      }
      
      return payload;
    } else {
      throw new AuthError('Invalid token structure', 401);
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 401);
    }
    throw new AuthError('Token validation failed', 401);
  }
}


// Convert JWT payload to Admin object
function jwtPayloadToAdmin(payload: JWTPayload): Admin {
  return {
    id: payload.admin.adminId as unknown as string,
    email: payload.admin.email,
    role: payload.admin.role,
    name: payload.admin.name,
    // Map other fields as needed
  };
}

// Server-side auth validation
export async function validateAuth(): Promise<{ admin: Admin; tokens: AuthTokens } | null> {
  try {
    const tokens = await getAuthTokens();
    if (!tokens) return null;

    try {
      // Validate access token locally
      const payload = validateJWT(tokens.adminAccessToken);
      const admin = jwtPayloadToAdmin(payload);
      
      return { admin, tokens };
    } catch (error) {
      // If access token is expired, try to refresh
      if (error instanceof AuthError && error.statusCode === 401) {
        try {
          const newTokens = await adminRefreshTokens(tokens.adminRefreshToken);
          await setAuthCookies(newTokens);

          const admin = await getCurrentAdmin(newTokens.adminAccessToken);
          return { admin, tokens: newTokens };
        } catch (refreshError) {
          console.log(refreshError)
          // Refresh failed, clear cookies
          await clearAuthCookies();
          return null;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth validation error:', error);
    // await clearAuthCookies();
    return null;
  }
}

// Safe version for use in layouts and pages
export async function validateAuthSafe(): Promise<{ admin: Admin; tokens: AuthTokens } | null> {
  try {
    const tokens = await getAuthTokens();
    if (!tokens) return null;

    // Only try with current access token, don't attempt refresh in layout
    const admin = await getCurrentAdmin(tokens.adminAccessToken);
    return { admin, tokens };
  } catch (error) {
    console.log(error)
    // Return null if validation fails, let client-side handle refresh
    return null;
  }
}


// Optional: Validate specific roles/permissions
export async function validateAdminAuth(requiredRole?: string): Promise<{ admin: Admin; tokens: AuthTokens } | null> {
  const authResult = await validateAuth();
  
  if (!authResult) return null;
  
  // Check if user has required role
  if (requiredRole && authResult.admin.role !== requiredRole) {
    return null;
  }
  
  return authResult;
}