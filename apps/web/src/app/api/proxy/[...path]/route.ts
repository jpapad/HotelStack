import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

async function handler(req: Request, ctx: { params: { path: string[] } }) {
  const { path } = ctx.params;
  const url = new URL(req.url);
  const apiUrl = new URL(`${getApiUrl()}/${path.join('/')}`);
  apiUrl.search = url.search;

  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('cookie');
  headers.delete('content-length');

  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  const res = await fetch(apiUrl, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
  });

  const resHeaders = new Headers(res.headers);
  resHeaders.delete('set-cookie');

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: resHeaders,
  });
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return handler(req, ctx);
}
export async function POST(req: Request, ctx: { params: { path: string[] } }) {
  return handler(req, ctx);
}
export async function PATCH(req: Request, ctx: { params: { path: string[] } }) {
  return handler(req, ctx);
}
export async function PUT(req: Request, ctx: { params: { path: string[] } }) {
  return handler(req, ctx);
}
export async function DELETE(req: Request, ctx: { params: { path: string[] } }) {
  return handler(req, ctx);
}
