'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { apiOccupancyReport } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth/auth-context';
import { hasPermission } from '@/lib/auth/permissions';

export default function OccupancyReportPage() {
  const [days, setDays] = React.useState(30);
  const { user } = useAuth();
  const canView = hasPermission(user, 'VIEW_REPORTS');

  const query = useQuery({
    queryKey: ['reports', 'occupancy', days],
    queryFn: () => apiOccupancyReport(days),
    enabled: canView,
  });

  if (!canView) {
    return <div className="text-sm text-slate-600">You do not have access to reports.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
            <h1 className="text-lg font-semibold">Occupancy report</h1>
            <p className="text-sm text-slate-600">Trends based on reservations overlapping each day.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32">
              <Select value={String(days)} onChange={(e) => setDays(Number(e.target.value))}>
                <option value="7">Last 7d</option>
                <option value="30">Last 30d</option>
                <option value="90">Last 90d</option>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await fetch(`/api/proxy/reports/occupancy/export?days=${days}`, { credentials: 'include' });
                if (!res.ok) {
                  toast.error('Export failed');
                  return;
                }
                const text = await res.text();
                const blob = new Blob([text], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `occupancy-${days}d.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {query.isLoading ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : query.isError ? (
          <div className="text-sm text-red-700">{query.error.message}</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Occupancy %</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={query.data.points} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.max(0, Math.floor(query.data.points.length / 8) - 1)} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancyPct" stroke="#0f172a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
