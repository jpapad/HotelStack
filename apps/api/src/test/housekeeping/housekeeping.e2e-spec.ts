import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { HousekeepingTaskStatus } from '../../housekeeping/dto/housekeeping.dto';
import * as bcrypt from 'bcrypt';

describe('Housekeeping Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let authToken: string;
  let propertyId: string;
  let userId: string;
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

    // Create housekeeping user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'housekeeping@example.com',
        password: hashedPassword,
        name: 'Test Housekeeper',
        role: 'HOUSEKEEPING',
      },
    });
    userId = user.id;

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
        status: 'CLEANING',
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
        email: 'housekeeping@example.com',
        password: 'password123',
      });

    return loginResponse.body.access_token;
  }

  describe('POST /housekeeping', () => {
    it('should create a new housekeeping task', async () => {
      const taskDto = {
        title: 'Clean Room 101',
        notes: 'Standard cleaning after checkout',
        propertyId,
        roomId,
      };

      const response = await request(app.getHttpServer())
        .post('/housekeeping')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Clean Room 101');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.roomId).toBe(roomId);
    });

    it('should fail to create task with invalid room ID', async () => {
      const taskDto = {
        title: 'Clean Non-existent Room',
        notes: 'Should fail',
        propertyId,
        roomId: 'non-existent-room-id',
      };

      await request(app.getHttpServer())
        .post('/housekeeping')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskDto)
        .expect(404);
    });
  });

  describe('GET /housekeeping', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a housekeeping task for testing
      const task = await prisma.housekeepingTask.create({
        data: {
          title: 'Test Cleaning Task',
          status: 'PENDING',
          propertyId,
          roomId,
        },
      });
      taskId = task.id;
    });

    it('should get all housekeeping tasks with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/housekeeping')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/housekeeping?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned tasks should be PENDING
      response.body.data.forEach((task: any) => {
        expect(task.status).toBe('PENDING');
      });
    });

    it('should filter tasks by room', async () => {
      const response = await request(app.getHttpServer())
        .get(`/housekeeping?roomId=${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned tasks should be for the specified room
      response.body.data.forEach((task: any) => {
        expect(task.roomId).toBe(roomId);
      });
    });
  });

  describe('PATCH /housekeeping/:id/status', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a housekeeping task for testing
      const task = await prisma.housekeepingTask.create({
        data: {
          title: 'Test Status Update Task',
          status: 'PENDING',
          propertyId,
          roomId,
        },
      });
      taskId = task.id;
    });

    it('should update task status from PENDING to IN_PROGRESS', async () => {
      const statusDto = {
        status: HousekeepingTaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch(`/housekeeping/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusDto)
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('should update task status from IN_PROGRESS to COMPLETED', async () => {
      // First update to IN_PROGRESS
      await request(app.getHttpServer())
        .patch(`/housekeeping/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: HousekeepingTaskStatus.IN_PROGRESS })
        .expect(200);

      // Then update to COMPLETED
      const response = await request(app.getHttpServer())
        .patch(`/housekeeping/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: HousekeepingTaskStatus.COMPLETED })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
    });

    it('should fail to update completed task back to PENDING', async () => {
      // First complete the task
      await request(app.getHttpServer())
        .patch(`/housekeeping/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: HousekeepingTaskStatus.COMPLETED })
        .expect(200);

      // Try to change completed task back to PENDING
      await request(app.getHttpServer())
        .patch(`/housekeeping/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: HousekeepingTaskStatus.PENDING })
        .expect(409);
    });

    it('should fail to update non-existent task', async () => {
      await request(app.getHttpServer())
        .patch('/housekeeping/non-existent-id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: HousekeepingTaskStatus.IN_PROGRESS })
        .expect(404);
    });
  });

  describe('GET /housekeeping/room/:roomId', () => {
    it('should get all tasks for a specific room', async () => {
      // Create multiple tasks for the same room
      await prisma.housekeepingTask.create({
        data: {
          title: 'Task 1',
          status: 'PENDING',
          propertyId,
          roomId,
        },
      });

      await prisma.housekeepingTask.create({
        data: {
          title: 'Task 2',
          status: 'IN_PROGRESS',
          propertyId,
          roomId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/housekeeping/room/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // All tasks should be for the specified room
      response.body.forEach((task: any) => {
        expect(task.roomId).toBe(roomId);
      });
    });

    it('should return empty array for room with no tasks', async () => {
      // Create a new room with no tasks
      const newRoom = await prisma.room.create({
        data: {
          number: '102',
          floor: 1,
          status: 'AVAILABLE',
          propertyId,
          roomTypeId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/housekeeping/room/${newRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});