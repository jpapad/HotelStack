import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateChargeDto, 
  CreatePaymentDto, 
  ChargeResponseDto, 
  PaymentResponseDto 
} from './dto/charge-payment.dto';

@Injectable()
export class ChargesPaymentsService {
  constructor(private prisma: PrismaService) {}

  // Charges
  async createCharge(createChargeDto: CreateChargeDto): Promise<ChargeResponseDto> {
    const { reservationId } = createChargeDto;

    // Verify reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const charge = await this.prisma.charge.create({
      data: createChargeDto,
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
          },
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        chargeType: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
      },
    });

    return charge;
  }

  async getReservationCharges(reservationId: string): Promise<ChargeResponseDto[]> {
    const charges = await this.prisma.charge.findMany({
      where: { reservationId },
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
          },
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        chargeType: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return charges;
  }

  async getReservationTotalCharges(reservationId: string): Promise<number> {
    const result = await this.prisma.charge.aggregate({
      where: { reservationId },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  // Payments
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const { reservationId, guestId } = createPaymentDto;

    // Verify reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verify guest exists
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    const payment = await this.prisma.payment.create({
      data: createPaymentDto,
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionId: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        guest: true,
      },
    });

    return payment;
  }

  async getReservationPayments(reservationId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: { reservationId },
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionId: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        guest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  async getReservationTotalPayments(reservationId: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { 
        reservationId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getReservationBalance(reservationId: string): Promise<{
    totalCharges: number;
    totalPayments: number;
    balance: number;
  }> {
    const [totalCharges, totalPayments] = await Promise.all([
      this.getReservationTotalCharges(reservationId),
      this.getReservationTotalPayments(reservationId),
    ]);

    return {
      totalCharges,
      totalPayments,
      balance: totalCharges - totalPayments,
    };
  }

  async getAllCharges(page: number = 1, limit: number = 10, propertyId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [charges, total] = await Promise.all([
      this.prisma.charge.findMany({
        where,
        include: {
          reservation: {
            select: {
              id: true,
              confirmationCode: true,
            },
          },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          chargeType: true,
          notes: true,
          propertyId: true,
          reservationId: true,
          createdAt: true,
          updatedAt: true,
          reservation: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.charge.count({ where }),
    ]);

    return {
      data: charges,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllPayments(page: number = 1, limit: number = 10, propertyId?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          reservation: {
            select: {
              id: true,
              confirmationCode: true,
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          transactionId: true,
          notes: true,
          propertyId: true,
          reservationId: true,
          guestId: true,
          createdAt: true,
          updatedAt: true,
          reservation: true,
          guest: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}