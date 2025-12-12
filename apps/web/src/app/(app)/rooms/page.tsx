'use client';

import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/api/client';
import { roomListSchema } from '@/lib/api/schemas';

export default function RoomsPage() {
  const query = useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiRequest('/rooms', { schema: roomListSchema }),
  });

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (query.isError) return <div className="text-sm text-red-700">{query.error.message}</div>;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {query.data.map((room) => (
        <Card key={room.id}>
          <CardHeader>
            <CardTitle>
              Room {room.number} <span className="text-slate-500">(Floor {room.floor})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-slate-700">{room.roomType.name}</div>
            <div className="flex flex-wrap gap-2">
              <Badge>{room.status}</Badge>
              <Badge className="bg-slate-50">Cap {room.roomType.capacity}</Badge>
            </div>
            <div className="text-sm text-slate-600">{room.roomType.amenities}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
