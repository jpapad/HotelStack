'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { User } from './types';
import { apiAuthMe, apiLogout } from '@/lib/api/endpoints';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: apiAuthMe,
    retry: false,
  });

  const user = meQuery.data ?? null;

  const refresh = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const logout = React.useCallback(async () => {
    await apiLogout();
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    await queryClient.clear();
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    isLoading: meQuery.isLoading,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
