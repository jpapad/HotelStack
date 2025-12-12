import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Reservations Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let authToken: string;
  let propertyId: string;
  let userId: string;
  let guestId: string;
  let roomTypeId: string;
  let roomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestData();
    authToken = await getAuthToken();
  });

  afterAll(async () => {
    await app.close();
  });

  async function setupTestData() {
    // Clean up any existing test data
    await prisma.activityLog.deleteMany();
    await prisma.housekeepingTask.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.charge.deleteMany();
    await prisma.stay.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.roomType.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.user.deleteMany();
    await prisma.property.deleteMany();

    // Create property
    const property = await prisma.property.create({
      data: {
        name: 'Test Hotel',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA',
      },
    });
    propertyId = property.id;

    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'reception@example.com',
        password: hashedPassword,
        name: 'Test Receptionist',
        role: 'RECEPTION',
      },
    });
    userId = user.id;

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        propertyId,
      },
    });
    guestId = guest.id;

    // Create room type
    const roomType = await prisma.roomType.create({
      data: {
        name: 'Standard Room',
        capacity: 2,
        amenities: 'WiFi, TV, Air Conditioning',
        propertyId,
      },
    });
    roomTypeId = roomType.id;

    // Create room
    const room = await prisma.room.create({
      data: {
        number: '101',
        floor: 1,
        status: 'AVAILABLE',
        propertyId,
        roomTypeId,
      },
    });
    roomId = room.id;
  }

  async function getAuthToken(): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'reception@example.com',
        password: 'password123',
      });

    return loginResponse.body.access_token;
  }

  describe('POST /reservations', () => {
    it('should create a new reservation', async () => {
      const reservationDto = {
        status: 'CONFIRMED',
        source: 'DIRECT',
        checkInDate: '2024-02-01T14:00:00Z',
        checkOutDate: '2024-02-03T11:00:00Z',
        numberOfGuests: 2,
        numberOfRooms: 1,
        totalPrice: 299.99,
        paidAmount: 0,
        specialRequests: 'Late check-in requested',
        propertyId,
        guestId,
        roomId,
      };

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('CONFIRMED');
      expect(response.body.confirmationCode).toMatch(/^RES-/);
      expect(response.body.guestId).toBe(guestId);
      expect(response.body.roomId).toBe(roomId);
    });

    it('should fail to create reservation with invalid data', async () => {
      const invalidReservationDto = {
        checkInDate: '2024-02-01T14:00:00Z',
        checkOutDate: '2024-02-03T11:00:00Z',
        numberOfGuests: 0, // Invalid: must be >= 1
        numberOfRooms: 1,
        totalPrice: 299.99,
        paidAmount: 0,
        propertyId,
        guestId,
      };

      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReservationDto)
        .expect(400);
    });
  });

  describe('GET /reservations', () => {
    it('should get all reservations with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter reservations by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations?status=CONFIRMED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /reservations/:id/check-in', () => {
    let reservationId: string;

    beforeEach(async () => {
      // Create a confirmed reservation for testing
      const reservation = await prisma.reservation.create({
        data: {
          status: 'CONFIRMED',
          source: 'DIRECT',
          checkInDate: '2024-02-01T14:00:00Z',
          checkOutDate: '2024-02-03T11:00:00Z',
          numberOfGuests: 2,
          numberOfRooms: 1,
          totalPrice: 299.99,
          paidAmount: 0,
          propertyId,
          guestId,
          roomId,
        },
      });
      reservationId = reservation.id;
    });

    it('should successfully check in a confirmed reservation', async () => {
      const checkInDto = {
        notes: 'Guest checked in successfully',
      };

      const response = await request(app.getHttpServer())
        .post(`/reservations/${reservationId}/check-in`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(checkInDto)
        .expect(201);

      expect(response.body.status).toBe('CHECKED_IN');
    });

    it('should fail to check in a reservation that is not confirmed', async () => {
      // Create a pending reservation
      const pendingReservation = await prisma.reservation.create({
        data: {
          status: 'PENDING',
          source: 'DIRECT',
          checkInDate: '2024-02-01T14:00:00Z',
          checkOutDate: '2024-02-03T11:00:00Z',
          numberOfGuests: 2,
          numberOfRooms: 1,
          totalPrice: 299.99,
          paidAmount: 0,
          propertyId,
          guestId,
          roomId,
        },
      });

      await request(app.getHttpServer())
        .post(`/reservations/${pendingReservation.id}/check-in`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Test' })
        .expect(400);
    });
  });

  describe('POST /reservations/:id/check-out', () => {
    let reservationId: string;

    beforeEach(async () => {
      // Create a checked-in reservation for testing
      const reservation = await prisma.reservation.create({
        data: {
          status: 'CHECKED_IN',
          source: 'DIRECT',
          checkInDate: '2024-02-01T14:00:00Z',
          checkOutDate: '2024-02-03T11:00:00Z',
          numberOfGuests: 2,
          numberOfRooms: 1,
          totalPrice: 299.99,
          paidAmount: 0,
          propertyId,
          guestId,
          roomId,
        },
      });
      reservationId = reservation.id;
    });

    it('should successfully check out a checked-in reservation', async () => {
      const checkOutDto = {
        notes: 'Guest checked out successfully',
      };

      const response = await request(app.getHttpServer())
        .post(`/reservations/${reservationId}/check-out`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(checkOutDto)
        .expect(201);

      expect(response.body.status).toBe('CHECKED_OUT');
    });

    it('should fail to check out a reservation that is not checked in', async () => {
      // Create a confirmed reservation
      const confirmedReservation = await prisma.reservation.create({
        data: {
          status: 'CONFIRMED',
          source: 'DIRECT',
          checkInDate: '2024-02-01T14:00:00Z',
          checkOutDate: '2024-02-03T11:00:00Z',
          numberOfGuests: 2,
          numberOfRooms: 1,
          totalPrice: 299.99,
          paidAmount: 0,
          propertyId,
          guestId,
          roomId,
        },
      });

      await request(app.getHttpServer())
        .post(`/reservations/${confirmedReservation.id}/check-out`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Test' })
        .expect(400);
    });
  });
});