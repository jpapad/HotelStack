'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Can } from '@/components/auth/can';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { apiHousekeepingTasks, apiUpdateHousekeepingTask } from '@/lib/api/endpoints';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
const statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

type TaskList = Awaited<ReturnType<typeof apiHousekeepingTasks>>;

export default function HousekeepingPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['housekeeping', 'tasks'],
    queryFn: apiHousekeepingTasks,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => apiUpdateHousekeepingTask(id, { status }),
    onMutate: async ({ id, status }) => {
      const queryKey = ['housekeeping', 'tasks'] as const;
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<TaskList>(queryKey);
      queryClient.setQueryData<TaskList>(queryKey, (old) => (old ?? []).map((t) => (t.id === id ? { ...t, status } : t)));
      return { prev, queryKey };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.queryKey, ctx.prev);
      toast.error(err instanceof Error ? err.message : 'Update failed');
    },
    onSuccess: () => toast.success('Updated'),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['housekeeping', 'tasks'] });
    },
  });

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.isError) return <div className="text-sm text-red-700">{query.error.message}</div>;

  const grouped = statuses.map((status) => ({
    status,
    tasks: query.data.filter((t) => t.status === status),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Housekeeping</h1>
        <p className="text-sm text-slate-600">Grouped list with quick status updates.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {grouped.map((g) => (
          <Card key={g.status}>
            <CardHeader>
              <CardTitle>
                {g.status} <span className="text-slate-500">({g.tasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {g.tasks.length === 0 ? (
                <div className="text-sm text-slate-600">No tasks</div>
              ) : (
                g.tasks.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-slate-600">
                        Room {t.room.number}
                        {t.notes ? <span className="text-slate-400"> • {t.notes}</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{t.status}</Badge>
                      <Can permission="UPDATE_HOUSEKEEPING">
                        <Select
                          className="h-8 w-40"
                          value={t.status}
                          onChange={(e) => updateMutation.mutate({ id: t.id, status: e.target.value as TaskStatus })}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </Can>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
