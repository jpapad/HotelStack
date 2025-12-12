import { format } from 'date-fns';

export function formatDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return format(d, 'yyyy-MM-dd');
}

export function formatDateTime(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return format(d, 'yyyy-MM-dd HH:mm');
}
