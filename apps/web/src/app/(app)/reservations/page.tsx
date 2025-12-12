'use client';

import Link from 'next/link';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Can } from '@/components/auth/can';
import { ReservationStatusBadge, type ReservationStatus } from '@/components/reservations/reservation-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { apiReservations, apiUpdateReservation } from '@/lib/api/endpoints';
import { formatDate } from '@/lib/format';

const statuses: Array<ReservationStatus | 'ALL'> = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

type ReservationsList = Awaited<ReturnType<typeof apiReservations>>;

export default function ReservationsPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('ALL');

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reservations', { search, status }],
    queryFn: () => apiReservations({ search: search || undefined, status: status === 'ALL' ? undefined : status }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ReservationStatus }) =>
      apiUpdateReservation(id, { status: nextStatus }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['reservations'] });
      const queryKey = ['reservations', { search, status }] as const;
      const previous = queryClient.getQueryData<ReservationsList>(queryKey);
      queryClient.setQueryData<ReservationsList>(queryKey, (old) =>
        (old ?? []).map((r) => (r.id === vars.id ? { ...r, status: vars.nextStatus } : r)),
      );
      return { previous, queryKey };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(ctx.queryKey, ctx.previous);
      }
      toast.error(err instanceof Error ? err.message : 'Update failed');
    },
    onSuccess: () => {
      toast.success('Updated');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium">Search</label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Guest, confirmation code…" />
        </div>
        <div className="w-56">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" onClick={() => query.refetch()}>
          Refresh
        </Button>
      </div>

      {query.isLoading ? (
        <div className="text-sm text-slate-600">Loading…</div>
      ) : query.isError ? (
        <div className="text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <Table>
            <THead>
              <TR>
                <TH>Confirmation</TH>
                <TH>Guest</TH>
                <TH>Room</TH>
                <TH>Dates</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {query.data.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="text-sm text-slate-600">
                    No reservations
                  </TD>
                </TR>
              ) : (
                query.data.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-medium">{r.confirmationCode}</TD>
                    <TD>
                      {r.guest.firstName} {r.guest.lastName}
                    </TD>
                    <TD>{r.room?.number ?? '—'}</TD>
                    <TD>
                      {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
                    </TD>
                    <TD>
                      <ReservationStatusBadge status={r.status} />
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/reservations/${r.id}`}>View</Link>
                        </Button>
                        <Can permission="EDIT_RESERVATIONS">
                          <Select
                            className="h-8 w-40"
                            value={r.status}
                            onChange={(e) => updateMutation.mutate({ id: r.id, nextStatus: e.target.value as ReservationStatus })}
                          >
                            {statuses
                              .filter((s): s is ReservationStatus => s !== 'ALL')
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </Select>
                        </Can>
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
