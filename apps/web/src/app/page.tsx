'use client';

import { useQuery } from '@tanstack/react-query';

type HelloResponse = {
  message: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchHello(): Promise<HelloResponse> {
  const res = await fetch(`${apiBaseUrl}/`);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  return (await res.json()) as HelloResponse;
}

export default function HomePage() {
  const query = useQuery<HelloResponse, Error>({
    queryKey: ['hello'],
    queryFn: fetchHello,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Web placeholder</h1>

      <div className="rounded border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-600">API response</p>

        {query.isLoading ? (
          <p className="mt-2 text-sm">Loading…</p>
        ) : query.isError ? (
          <p className="mt-2 text-sm text-red-700">{query.error.message}</p>
        ) : (
          <pre className="mt-2 overflow-x-auto text-sm">
            {JSON.stringify(query.data, null, 2)}
          </pre>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Edit <code className="rounded bg-slate-100 px-1 py-0.5">apps/web/src/app/page.tsx</code>{' '}
        to get started.
      </p>
    </div>
  );
}
