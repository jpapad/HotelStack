'use client';

import type { ReactNode } from 'react';

import { hasPermission, type Permission } from '@/lib/auth/permissions';
import { useAuth } from '@/lib/auth/auth-context';

export function Can({ permission, children, fallback }: { permission: Permission; children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return fallback ?? null;
  }

  return children;
}
