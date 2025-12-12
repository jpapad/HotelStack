import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };

  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as unknown;

  const getMessage = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null;
    if (!('message' in value)) return null;
    const msg = (value as { message?: unknown }).message;
    return typeof msg === 'string' ? msg : null;
  };

  if (!res.ok) {
    return new NextResponse(getMessage(json) ?? 'Login failed', { status: res.status });
  }

  if (!json || typeof json !== 'object') {
    return new NextResponse('Invalid login response from API', { status: 502 });
  }

  const token = (json as { accessToken?: unknown }).accessToken;
  if (typeof token !== 'string' || token.length === 0) {
    return new NextResponse('Missing token from API', { status: 502 });
  }

  const cookieStore = cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ user: (json as { user?: unknown }).user });
}
