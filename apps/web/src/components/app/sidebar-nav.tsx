'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/auth/permissions';
import { useAuth } from '@/lib/auth/auth-context';

type NavItem = {
  href: string;
  label: string;
  permission?: Parameters<typeof hasPermission>[1];
};

const items: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', permission: 'VIEW_DASHBOARD' },
  { href: '/reservations', label: 'Reservations', permission: 'VIEW_RESERVATIONS' },
  { href: '/rooms', label: 'Rooms', permission: 'VIEW_ROOMS' },
  { href: '/availability', label: 'Availability', permission: 'VIEW_AVAILABILITY' },
  { href: '/housekeeping', label: 'Housekeeping', permission: 'VIEW_HOUSEKEEPING' },
  { href: '/reports/occupancy', label: 'Occupancy Report', permission: 'VIEW_REPORTS' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="space-y-1">
      {items
        .filter((i) => (i.permission ? hasPermission(user, i.permission) : true))
        .map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100',
                active && 'bg-slate-100 text-slate-900',
              )}
            >
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
