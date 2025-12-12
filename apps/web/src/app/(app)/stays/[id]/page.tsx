'use client';

import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Can } from '@/components/auth/can';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { apiAddCharge, apiAddPayment, apiStayCheckout, apiStayDetail } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/format';

const chargeSchema = z.object({
  description: z.string().min(1),
  amount: z.string().min(1),
  chargeType: z.string().min(1),
});

type ChargeValues = z.infer<typeof chargeSchema>;

const paymentSchema = z.object({
  amount: z.string().min(1),
  method: z.string().min(1),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).default('COMPLETED'),
});

type PaymentValues = z.infer<typeof paymentSchema>;

export default function StayDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['stay', id],
    queryFn: () => apiStayDetail(id),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => apiStayCheckout(id),
    onSuccess: async () => {
      toast.success('Checked out');
      await queryClient.invalidateQueries({ queryKey: ['stay', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Checkout failed'),
  });

  const chargeForm = useForm<ChargeValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { description: 'Room service', amount: '25.00', chargeType: 'service' },
  });

  const addChargeMutation = useMutation({
    mutationFn: (values: ChargeValues) => apiAddCharge(id, values),
    onSuccess: async () => {
      toast.success('Charge added');
      chargeForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['stay', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Add charge failed'),
  });

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: '50.00', method: 'credit_card', status: 'COMPLETED' },
  });

  const addPaymentMutation = useMutation({
    mutationFn: (values: PaymentValues) => apiAddPayment(id, values),
    onSuccess: async () => {
      toast.success('Payment added');
      paymentForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['stay', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Add payment failed'),
  });

  if (query.isLoading) return <div className="text-sm text-slate-600">Loading…</div>;
  if (query.isError) return <div className="text-sm text-red-700">{query.error.message}</div>;

  const { stay, charges, payments } = query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Stay</h1>
          <div className="mt-1 text-sm text-slate-600">
            {stay.guest.firstName} {stay.guest.lastName} • Room {stay.room.number} ({stay.room.roomType.name})
          </div>
          <div className="mt-1 text-sm text-slate-600">Reservation: {stay.reservation.confirmationCode}</div>
        </div>

        <Can permission="EDIT_FOLIO">
          <Button
            variant="destructive"
            size="sm"
            disabled={checkoutMutation.isPending || Boolean(stay.checkOutDate)}
            onClick={() => checkoutMutation.mutate()}
          >
            {stay.checkOutDate ? 'Checked out' : checkoutMutation.isPending ? 'Checking out…' : 'Check out'}
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Folio • Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Description</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <TBody>
                {charges.length === 0 ? (
                  <TR>
                    <TD colSpan={3} className="text-sm text-slate-600">
                      No charges
                    </TD>
                  </TR>
                ) : (
                  charges.map((c) => (
                    <TR key={c.id}>
                      <TD>{formatDateTime(c.createdAt)}</TD>
                      <TD>
                        <div className="font-medium">{c.description}</div>
                        <div className="text-sm text-slate-600">{c.chargeType}</div>
                      </TD>
                      <TD className="text-right">${c.amount}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>

            <Can permission="EDIT_FOLIO">
              <form
                className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                onSubmit={chargeForm.handleSubmit((values) => addChargeMutation.mutate(values))}
              >
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Input placeholder="Description" {...chargeForm.register('description')} />
                  <Input placeholder="Amount" {...chargeForm.register('amount')} />
                  <Input placeholder="Type" {...chargeForm.register('chargeType')} />
                </div>
                <div className="flex justify-end">
                  <Button size="sm" type="submit" disabled={addChargeMutation.isPending}>
                    Add charge
                  </Button>
                </div>
              </form>
            </Can>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Folio • Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Method</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <TBody>
                {payments.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="text-sm text-slate-600">
                      No payments
                    </TD>
                  </TR>
                ) : (
                  payments.map((p) => (
                    <TR key={p.id}>
                      <TD>{formatDateTime(p.createdAt)}</TD>
                      <TD>{p.method}</TD>
                      <TD>{p.status}</TD>
                      <TD className="text-right">${p.amount}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>

            <Can permission="EDIT_FOLIO">
              <form
                className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                onSubmit={paymentForm.handleSubmit((values) => addPaymentMutation.mutate(values))}
              >
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Input placeholder="Amount" {...paymentForm.register('amount')} />
                  <Input placeholder="Method" {...paymentForm.register('method')} />
                  <Select {...paymentForm.register('status')}>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" type="submit" disabled={addPaymentMutation.isPending}>
                    Add payment
                  </Button>
                </div>
              </form>
            </Can>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
