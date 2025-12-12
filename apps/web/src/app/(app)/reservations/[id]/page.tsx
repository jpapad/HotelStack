'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Can } from '@/components/auth/can';
import { ReservationStatusBadge, type ReservationStatus } from '@/components/reservations/reservation-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { apiReservationDetail, apiUpdateReservation } from '@/lib/api/endpoints';
import { formatDate, formatDateTime } from '@/lib/format';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']),
  specialRequests: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const statuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => apiReservationDetail(id),
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'PENDING',
      specialRequests: '',
    },
  });

  React.useEffect(() => {
    if (!query.data) return;
    form.reset({
      status: query.data.reservation.status,
      specialRequests: query.data.reservation.specialRequests ?? '',
    });
  }, [form, query.data]);

  const updateMutation = useMutation({
    mutationFn: (values: Values) => apiUpdateReservation(id, values),
    onSuccess: async () => {
      toast.success('Reservation updated');
      await queryClient.invalidateQueries({ queryKey: ['reservation', id] });
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  if (query.isLoading) return <div className="text-sm text-slate-600">Loading…</div>;
  if (query.isError) return <div className="text-sm text-red-700">{query.error.message}</div>;

  const { reservation, activity } = query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Reservation {reservation.confirmationCode}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span>
              {reservation.guest.firstName} {reservation.guest.lastName}
            </span>
            <span className="text-slate-400">•</span>
            <span>
              {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
            </span>
          </div>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-600">Room</div>
                <div className="font-medium text-slate-900">{reservation.room?.number ?? 'Unassigned'}</div>
              </div>
              <div>
                <div className="text-slate-600">Source</div>
                <div className="font-medium text-slate-900">{reservation.source}</div>
              </div>
              <div>
                <div className="text-slate-600">Total</div>
                <div className="font-medium text-slate-900">${reservation.totalPrice}</div>
              </div>
              <div>
                <div className="text-slate-600">Paid</div>
                <div className="font-medium text-slate-900">${reservation.paidAmount}</div>
              </div>
            </div>

            <Can permission="EDIT_RESERVATIONS" fallback={<div className="text-sm text-slate-600">You cannot edit this reservation.</div>}>
              <form
                className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3"
                onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select {...form.register('status')}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Special requests</label>
                    <Input {...form.register('specialRequests')} placeholder="Optional" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </form>
            </Can>

            <div>
              <div className="text-sm font-medium">Stays</div>
              {reservation.stays.length === 0 ? (
                <div className="text-sm text-slate-600">No stays yet</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {reservation.stays.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded border border-slate-200 bg-white p-3">
                      <div className="text-sm">
                        <div className="font-medium">Stay {s.id.slice(0, 8)}</div>
                        <div className="text-slate-600">Checked in: {formatDateTime(s.checkInDate)}</div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/stays/${s.id}`}>Open</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {activity.length === 0 ? (
                  <TR>
                    <TD className="text-sm text-slate-600" colSpan={2}>
                      No activity
                    </TD>
                  </TR>
                ) : (
                  activity.map((a) => (
                    <TR key={a.id}>
                      <TD>{formatDateTime(a.createdAt)}</TD>
                      <TD>
                        <div className="font-medium">{a.action}</div>
                        {a.details ? <div className="text-sm text-slate-600">{a.details}</div> : null}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
