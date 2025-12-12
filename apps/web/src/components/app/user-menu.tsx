'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

export function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm">
          {user ? user.name : 'Account'}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="min-w-[220px] rounded-md border border-slate-200 bg-white p-1 shadow"
        >
          <div className="px-2 py-2 text-xs text-slate-600">
            <div className="font-medium text-slate-900">{user?.email}</div>
            <div>{user?.role}</div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item asChild>
            <Link className="block cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-slate-50" href="/dashboard">
              Dashboard
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer rounded px-2 py-1.5 text-sm text-red-700 hover:bg-red-50"
            onSelect={async (e) => {
              e.preventDefault();
              await logout();
              window.location.href = '/login';
            }}
          >
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
