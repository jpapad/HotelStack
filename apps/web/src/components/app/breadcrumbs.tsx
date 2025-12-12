'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

function titleCase(input: string) {
  return input
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-sm text-slate-600', className)}>
      <Link href="/dashboard" className="hover:text-slate-900">
        Home
      </Link>
      {parts.map((part, idx) => {
        const href = '/' + parts.slice(0, idx + 1).join('/');
        const isLast = idx === parts.length - 1;
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-slate-400">/</span>
            {isLast ? (
              <span className="text-slate-900">{titleCase(part)}</span>
            ) : (
              <Link href={href} className="hover:text-slate-900">
                {titleCase(part)}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
