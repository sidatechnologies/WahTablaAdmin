// types/auth.ts
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  // Add other user properties as needed
}

export interface AuthTokens {
  adminAccessToken: string;
  adminRefreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  data: {
    admin: Admin;
    tokens: AuthTokens;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthState {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}