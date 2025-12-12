import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const res = await fetch(`${getApiUrl()}/auth/me`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const json = (await res.json()) as unknown;
  return NextResponse.json(json);
}
