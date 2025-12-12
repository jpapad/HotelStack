import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

const colors: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
  CHECKED_IN: 'bg-green-50 text-green-800 border-green-200',
  CHECKED_OUT: 'bg-slate-50 text-slate-700 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-800 border-red-200',
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge className={cn(colors[status])}>{status.replace('_', ' ')}</Badge>;
}
