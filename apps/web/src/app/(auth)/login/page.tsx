'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiLogin } from '@/lib/api/endpoints';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'manager@test.com',
      password: 'manager123',
    },
  });

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: () => {
      toast.success('Signed in');
      window.location.href = next;
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Use a seeded account (manager/reception/housekeeping) to continue.</p>
      </div>

      <form
        className="space-y-3"
        onSubmit={form.handleSubmit((values) => {
          loginMutation.mutate(values);
        })}
      >
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input autoComplete="email" placeholder="you@example.com" {...form.register('email')} />
          {form.formState.errors.email ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <Input type="password" autoComplete="current-password" {...form.register('password')} />
          {form.formState.errors.password ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        <div className="font-medium text-slate-900">Seeded logins</div>
        <div className="mt-1 space-y-1">
          <div>Reception: reception@test.com / reception123</div>
          <div>Manager: manager@test.com / manager123</div>
          <div>Housekeeping: housekeeping@test.com / housekeeping123</div>
        </div>
      </div>
    </div>
  );
}
