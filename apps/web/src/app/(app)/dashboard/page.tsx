'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { apiDashboard } from '@/lib/api/endpoints';
import { formatDate } from '@/lib/format';

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiDashboard,
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (query.isError) {
    return <div className="text-sm text-red-700">{query.error.message}</div>;
  }

  const { stats, arrivals, departures } = query.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Rooms occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.roomsOccupied}</div>
            <div className="text-sm text-slate-600">of {stats.roomsTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In-house</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.inHouse}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Arrivals today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.arrivalsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Departures today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.departuresToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link className="block text-sm text-slate-700 underline" href="/reservations">
              Reservations
            </Link>
            <Link className="block text-sm text-slate-700 underline" href="/rooms">
              Rooms
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Guest</TH>
                  <TH>Room</TH>
                  <TH>Dates</TH>
                </TR>
              </THead>
              <TBody>
                {arrivals.length === 0 ? (
                  <TR>
                    <TD className="text-sm text-slate-600" colSpan={3}>
                      No arrivals today
                    </TD>
                  </TR>
                ) : (
                  arrivals.map((r) => (
                    <TR key={r.id}>
                      <TD>
                        <Link className="text-slate-900 underline" href={`/reservations/${r.id}`}>
                          {r.guestName}
                        </Link>
                      </TD>
                      <TD>{r.roomNumber ?? '—'}</TD>
                      <TD>
                        {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Guest</TH>
                  <TH>Room</TH>
                  <TH>Dates</TH>
                </TR>
              </THead>
              <TBody>
                {departures.length === 0 ? (
                  <TR>
                    <TD className="text-sm text-slate-600" colSpan={3}>
                      No departures today
                    </TD>
                  </TR>
                ) : (
                  departures.map((r) => (
                    <TR key={r.id}>
                      <TD>
                        <Link className="text-slate-900 underline" href={`/reservations/${r.id}`}>
                          {r.guestName}
                        </Link>
                      </TD>
                      <TD>{r.roomNumber ?? '—'}</TD>
                      <TD>
                        {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
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
