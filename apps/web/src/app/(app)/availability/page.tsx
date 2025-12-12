'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/api/client';
import { availabilitySchema, roomListSchema } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

function dayKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function AvailabilityPage() {
  const from = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const to = React.useMemo(() => addDays(from, 13), [from]);

  const days = React.useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(from, i)), [from]);

  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiRequest('/rooms', { schema: roomListSchema }),
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability', dayKey(from), dayKey(to)],
    queryFn: () =>
      apiRequest(`/availability?from=${from.toISOString()}&to=${to.toISOString()}`, {
        schema: availabilitySchema,
      }),
  });

  if (roomsQuery.isLoading || availabilityQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (roomsQuery.isError) return <div className="text-sm text-red-700">{roomsQuery.error.message}</div>;
  if (availabilityQuery.isError) return <div className="text-sm text-red-700">{availabilityQuery.error.message}</div>;

  const reservations = availabilityQuery.data.reservations;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Availability</h1>
          <p className="text-sm text-slate-600">Next 14 days (simple timeline)</p>
        </div>
        <Badge>
          {dayKey(from)} → {dayKey(to)}
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[180px_repeat(14,1fr)] border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
            <div className="p-2">Room</div>
            {days.map((d) => (
              <div key={dayKey(d)} className="p-2 text-center">
                {format(d, 'MMM d')}
              </div>
            ))}
          </div>

          {roomsQuery.data.map((room) => {
            const roomRes = reservations.filter((r) => r.roomId === room.id);
            return (
              <div key={room.id} className="grid grid-cols-[180px_repeat(14,1fr)] border-b border-slate-100">
                <div className="p-2 text-sm">
                  <div className="font-medium">{room.number}</div>
                  <div className="text-xs text-slate-600">{room.roomType.name}</div>
                </div>

                {days.map((d) => {
                  const dStart = new Date(d);
                  dStart.setHours(0, 0, 0, 0);
                  const dEnd = new Date(d);
                  dEnd.setHours(23, 59, 59, 999);

                  const occ = roomRes.find((r) => new Date(r.checkInDate) < dEnd && new Date(r.checkOutDate) > dStart);

                  return (
                    <div
                      key={dayKey(d)}
                      className={cn('border-l border-slate-100 p-2 text-center text-xs', occ && 'bg-blue-50')}
                      title={occ ? `${occ.guestName} (${occ.status})` : ''}
                    >
                      {occ ? '•' : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-600">
        Tip: Hover a booked cell to see guest name. For a production Gantt view, replace this with a dedicated timeline
        component.
      </div>
    </div>
  );
}
