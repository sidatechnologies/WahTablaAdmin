'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LoginCredentials, SignupCredentials } from '@/types/auth';
import { loginAction, signupAction } from '@/lib/actions/auth';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAction,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin data
        queryClient.invalidateQueries({ queryKey: ['auth', 'admin'] });
        router.push('/dashboard');
      }
    },
  });
}

export function useSignup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signupAction,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin data
        queryClient.invalidateQueries({ queryKey: ['auth', 'admin'] });
        router.push('/dashboard');
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}