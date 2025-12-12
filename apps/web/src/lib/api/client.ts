import { z, type ZodType } from 'zod';

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as unknown;
  }
  return await res.text();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { schema?: ZodType<T> } = {},
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const message = typeof body === 'string' ? body : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  if (init.schema) {
    return init.schema.parse(body);
  }

  return body as T;
}

export async function apiJson<T>(
  path: string,
  body: unknown,
  init: Omit<RequestInit, 'body' | 'method'> & { method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; schema?: ZodType<T> } = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: init.method ?? 'POST',
    body: JSON.stringify(body),
    schema: init.schema,
  });
}

export const isoDateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid ISO date' });
