'use client';

import type { ReactNode } from 'react';

import { SidebarNav } from './sidebar-nav';
import { Breadcrumbs } from './breadcrumbs';
import { UserMenu } from './user-menu';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 text-sm font-semibold">Acme PMS</div>
          <SidebarNav />
        </aside>

        <div className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Breadcrumbs />
            <UserMenu />
          </header>

          <main className="rounded-lg border border-slate-200 bg-white p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
