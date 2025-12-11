import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Web',
  description: 'Next.js app scaffold'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900">
        <Providers>
          <main className="mx-auto w-full max-w-2xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
