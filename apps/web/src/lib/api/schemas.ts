import { z } from 'zod';

import { isoDateString } from './client';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['RECEPTION', 'MANAGER', 'HOUSEKEEPING']),
});

export const dashboardSchema = z.object({
  stats: z.object({
    roomsTotal: z.number(),
    roomsOccupied: z.number(),
    inHouse: z.number(),
    arrivalsToday: z.number(),
    departuresToday: z.number(),
  }),
  arrivals: z.array(
    z.object({
      id: z.string(),
      confirmationCode: z.string(),
      status: z.string(),
      checkInDate: isoDateString,
      checkOutDate: isoDateString,
      guestName: z.string(),
      roomNumber: z.string().nullable(),
    }),
  ),
  departures: z.array(
    z.object({
      id: z.string(),
      confirmationCode: z.string(),
      status: z.string(),
      checkInDate: isoDateString,
      checkOutDate: isoDateString,
      guestName: z.string(),
      roomNumber: z.string().nullable(),
    }),
  ),
});

export const reservationStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']);

export const reservationSchema = z.object({
  id: z.string(),
  status: reservationStatusSchema,
  source: z.string(),
  checkInDate: isoDateString,
  checkOutDate: isoDateString,
  numberOfGuests: z.number(),
  numberOfRooms: z.number(),
  totalPrice: z.string(),
  paidAmount: z.string(),
  specialRequests: z.string().nullable().optional(),
  confirmationCode: z.string(),
  guest: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  room: z
    .object({
      id: z.string(),
      number: z.string(),
    })
    .nullable()
    .optional(),
});

export const reservationListSchema = z.array(reservationSchema);

export const reservationDetailSchema = z.object({
  reservation: reservationSchema.extend({
    guest: z.any(),
    stays: z.array(
      z.object({
        id: z.string(),
        checkInDate: isoDateString,
        checkOutDate: isoDateString.nullable(),
        numberOfNights: z.number(),
        occupants: z.number(),
      }),
    ),
    charges: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        amount: z.string(),
        chargeType: z.string(),
        createdAt: isoDateString,
      }),
    ),
    payments: z.array(
      z.object({
        id: z.string(),
        amount: z.string(),
        method: z.string(),
        status: z.string(),
        createdAt: isoDateString,
      }),
    ),
  }),
  activity: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      details: z.string().nullable(),
      createdAt: isoDateString,
    }),
  ),
});

export const roomSchema = z.object({
  id: z.string(),
  number: z.string(),
  floor: z.number(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING']),
  notes: z.string().nullable().optional(),
  roomType: z.object({
    id: z.string(),
    name: z.string(),
    capacity: z.number(),
    amenities: z.string(),
  }),
});

export const roomListSchema = z.array(roomSchema);

export const availabilitySchema = z.object({
  from: isoDateString,
  to: isoDateString,
  reservations: z.array(
    z.object({
      id: z.string(),
      roomId: z.string().nullable(),
      roomNumber: z.string().nullable(),
      checkInDate: isoDateString,
      checkOutDate: isoDateString,
      status: z.string(),
      guestName: z.string(),
    }),
  ),
});

export const housekeepingTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().nullable().optional(),
  room: z.object({
    id: z.string(),
    number: z.string(),
  }),
});

export const housekeepingTaskListSchema = z.array(housekeepingTaskSchema);

export const stayDetailSchema = z.object({
  stay: z.object({
    id: z.string(),
    checkInDate: isoDateString,
    checkOutDate: isoDateString.nullable(),
    numberOfNights: z.number(),
    occupants: z.number(),
    guest: z.object({ firstName: z.string(), lastName: z.string() }),
    room: z.object({ number: z.string(), roomType: z.object({ name: z.string() }) }),
    reservation: z.object({ id: z.string(), confirmationCode: z.string(), status: z.string() }),
  }),
  charges: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      amount: z.string(),
      chargeType: z.string(),
      createdAt: isoDateString,
    }),
  ),
  payments: z.array(
    z.object({
      id: z.string(),
      amount: z.string(),
      method: z.string(),
      status: z.string(),
      createdAt: isoDateString,
    }),
  ),
});

export const occupancyReportSchema = z.object({
  roomsTotal: z.number(),
  points: z.array(
    z.object({
      date: z.string(),
      occupiedRooms: z.number(),
      roomsTotal: z.number(),
      occupancyPct: z.number(),
    }),
  ),
});
