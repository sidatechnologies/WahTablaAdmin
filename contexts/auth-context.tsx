// contexts/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Admin, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Client-side API call to get current admin
async function getCurrentAdmin(): Promise<Admin | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error('Failed to fetch admin');
    }

    const data = await response.json();
    return data.admin;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const {
    data: admin,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'admin'],
    queryFn: getCurrentAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      queryClient.clear();
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    admin: admin || null,
    isLoading,
    isAuthenticated: !!admin,
    logout,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}