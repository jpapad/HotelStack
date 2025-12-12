import { z } from 'zod';

import { apiJson, apiRequest } from './client';
import {
  availabilitySchema,
  dashboardSchema,
  housekeepingTaskListSchema,
  occupancyReportSchema,
  reservationDetailSchema,
  reservationListSchema,
  roomListSchema,
  stayDetailSchema,
  userSchema,
} from './schemas';
import type { User } from '@/lib/auth/types';

export async function apiAuthMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as unknown;
  return userSchema.parse(body);
}

export async function apiLogin(body: { email: string; password: string }): Promise<{ user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Login failed (${res.status})`);
  }

  const json = (await res.json()) as unknown;
  const parsed = z.object({ user: userSchema }).parse(json);
  return { user: parsed.user };
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export const apiDashboard = () => apiRequest('/dashboard', { schema: dashboardSchema });

export const apiReservations = (params: { search?: string; status?: string }) => {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest(`/reservations${suffix}`, { schema: reservationListSchema });
};

export const apiReservationDetail = (id: string) => apiRequest(`/reservations/${id}`, { schema: reservationDetailSchema });

export const apiUpdateReservation = (id: string, body: unknown) =>
  apiJson<unknown>(`/reservations/${id}`, body, { method: 'PATCH' });

export const apiStayDetail = (id: string) => apiRequest(`/stays/${id}`, { schema: stayDetailSchema });

export const apiStayCheckout = (id: string) => apiJson(`/stays/${id}/check-out`, {}, { method: 'POST' });

export const apiAddCharge = (stayId: string, body: unknown) =>
  apiJson<unknown>(`/stays/${stayId}/charges`, body, { method: 'POST' });

export const apiAddPayment = (stayId: string, body: unknown) =>
  apiJson<unknown>(`/stays/${stayId}/payments`, body, { method: 'POST' });

export const apiRooms = () => apiRequest('/rooms', { schema: roomListSchema });

export const apiAvailability = (params: { from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest(`/availability${suffix}`, { schema: availabilitySchema });
};

export const apiHousekeepingTasks = () => apiRequest('/housekeeping/tasks', { schema: housekeepingTaskListSchema });

export const apiUpdateHousekeepingTask = (taskId: string, body: unknown) =>
  apiJson<unknown>(`/housekeeping/tasks/${taskId}`, body, { method: 'PATCH' });

export const apiOccupancyReport = (days = 30) => apiRequest(`/reports/occupancy?days=${days}`, { schema: occupancyReportSchema });
