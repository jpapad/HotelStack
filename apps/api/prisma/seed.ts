import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.housekeepingTask.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.property.deleteMany();

  // Create test users
  const receptionPassword = await bcrypt.hash('reception123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const housekeepingPassword = await bcrypt.hash('housekeeping123', 10);

  const receptionUser = await prisma.user.create({
    data: {
      email: 'reception@test.com',
      password: receptionPassword,
      name: 'Reception Staff',
      role: 'RECEPTION',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@test.com',
      password: managerPassword,
      name: 'Hotel Manager',
      role: 'MANAGER',
    },
  });

  const housekeepingUser = await prisma.user.create({
    data: {
      email: 'housekeeping@test.com',
      password: housekeepingPassword,
      name: 'Housekeeping Staff',
      role: 'HOUSEKEEPING',
    },
  });

  console.log('✅ Created test users');

  // Create a property
  const property = await prisma.property.create({
    data: {
      name: 'Grand Hotel',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
    },
  });

  console.log('✅ Created property');

  // Create room types
  const standardRoomType = await prisma.roomType.create({
    data: {
      name: 'Standard Room',
      capacity: 2,
      amenities: 'WiFi, TV, Air Conditioning',
      propertyId: property.id,
    },
  });

  const deluxeRoomType = await prisma.roomType.create({
    data: {
      name: 'Deluxe Room',
      capacity: 3,
      amenities: 'WiFi, TV, Air Conditioning, Balcony, Mini Bar',
      propertyId: property.id,
    },
  });

  const suiteRoomType = await prisma.roomType.create({
    data: {
      name: 'Suite',
      capacity: 4,
      amenities: 'WiFi, TV, Air Conditioning, Balcony, Mini Bar, Jacuzzi',
      propertyId: property.id,
    },
  });

  console.log('✅ Created room types');

  // Create rooms
  const rooms: any[] = [];
  for (let i = 101; i <= 110; i++) {
    const roomType = i % 3 === 0 ? suiteRoomType : i % 2 === 0 ? deluxeRoomType : standardRoomType;
    const room = await prisma.room.create({
      data: {
        number: `${i}`,
        floor: Math.floor(i / 100),
        status: 'AVAILABLE',
        propertyId: property.id,
        roomTypeId: roomType.id,
      },
    });
    rooms.push(room);
  }

  console.log('✅ Created 10 rooms');

  // Create guests
  const guests: any[] = [];
  const guestData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-0001' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '555-0002' },
    { firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', phone: '555-0003' },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.w@example.com', phone: '555-0004' },
    { firstName: 'Robert', lastName: 'Brown', email: 'robert.b@example.com', phone: '555-0005' },
  ];

  for (const data of guestData) {
    const guest = await prisma.guest.create({
      data: {
        ...data,
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        propertyId: property.id,
      },
    });
    guests.push(guest);
  }

  console.log('✅ Created 5 test guests');

  // Create reservations and stays
  const now = new Date();
  const reservations: any[] = [];

  // Reservation 1: Currently checked in (CHECKED_IN status)
  const checkInDate1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const checkOutDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  const res1 = await prisma.reservation.create({
    data: {
      status: 'CHECKED_IN',
      source: 'DIRECT',
      checkInDate: checkInDate1,
      checkOutDate: checkOutDate1,
      numberOfGuests: 2,
      numberOfRooms: 1,
      totalPrice: '250.00',
      paidAmount: '250.00',
      confirmationCode: 'CONF001',
      propertyId: property.id,
      guestId: guests[0].id,
      roomId: rooms[0].id,
    },
  });
  reservations.push(res1);

  // Create stay for reservation 1
  await prisma.stay.create({
    data: {
      checkInDate: checkInDate1,
      checkOutDate: null,
      numberOfNights: 5,
      occupants: 2,
      propertyId: property.id,
      reservationId: res1.id,
      roomId: rooms[0].id,
      guestId: guests[0].id,
    },
  });

  // Reservation 2: Confirmed (future)
  const checkInDate2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
  const checkOutDate2 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
  const res2 = await prisma.reservation.create({
    data: {
      status: 'CONFIRMED',
      source: 'BOOKING_COM',
      checkInDate: checkInDate2,
      checkOutDate: checkOutDate2,
      numberOfGuests: 3,
      numberOfRooms: 1,
      totalPrice: '450.00',
      paidAmount: '225.00',
      confirmationCode: 'CONF002',
      propertyId: property.id,
      guestId: guests[1].id,
      roomId: rooms[1].id,
    },
  });
  reservations.push(res2);

  // Reservation 3: Checked out (past)
  const checkInDate3 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  const checkOutDate3 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const res3 = await prisma.reservation.create({
    data: {
      status: 'CHECKED_OUT',
      source: 'AIRBNB',
      checkInDate: checkInDate3,
      checkOutDate: checkOutDate3,
      numberOfGuests: 1,
      numberOfRooms: 1,
      totalPrice: '200.00',
      paidAmount: '200.00',
      confirmationCode: 'CONF003',
      propertyId: property.id,
      guestId: guests[2].id,
      roomId: rooms[2].id,
    },
  });
  reservations.push(res3);

  // Create stay for reservation 3
  await prisma.stay.create({
    data: {
      checkInDate: checkInDate3,
      checkOutDate: checkOutDate3,
      numberOfNights: 5,
      occupants: 1,
      propertyId: property.id,
      reservationId: res3.id,
      roomId: rooms[2].id,
      guestId: guests[2].id,
    },
  });

  // Reservation 4: Pending
  const checkInDate4 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
  const checkOutDate4 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const res4 = await prisma.reservation.create({
    data: {
      status: 'PENDING',
      source: 'EXPEDIA',
      checkInDate: checkInDate4,
      checkOutDate: checkOutDate4,
      numberOfGuests: 4,
      numberOfRooms: 2,
      totalPrice: '600.00',
      paidAmount: '0.00',
      confirmationCode: 'CONF004',
      propertyId: property.id,
      guestId: guests[3].id,
      roomId: rooms[3].id,
    },
  });
  reservations.push(res4);

  // Reservation 5: Cancelled
  const checkInDate5 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOutDate5 = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
  const res5 = await prisma.reservation.create({
    data: {
      status: 'CANCELLED',
      source: 'OTA',
      checkInDate: checkInDate5,
      checkOutDate: checkOutDate5,
      numberOfGuests: 2,
      numberOfRooms: 1,
      totalPrice: '300.00',
      paidAmount: '0.00',
      confirmationCode: 'CONF005',
      propertyId: property.id,
      guestId: guests[4].id,
    },
  });
  reservations.push(res5);

  console.log('✅ Created 5 reservations with various statuses');

  // Create charges
  await prisma.charge.create({
    data: {
      description: 'Room Charge',
      amount: '200.00',
      chargeType: 'room',
      propertyId: property.id,
      reservationId: res1.id,
    },
  });

  await prisma.charge.create({
    data: {
      description: 'Mini Bar',
      amount: '50.00',
      chargeType: 'service',
      propertyId: property.id,
      reservationId: res1.id,
    },
  });

  console.log('✅ Created charges');

  // Create payments
  await prisma.payment.create({
    data: {
      amount: '250.00',
      method: 'credit_card',
      status: 'COMPLETED',
      transactionId: 'TXN001',
      propertyId: property.id,
      reservationId: res1.id,
      guestId: guests[0].id,
    },
  });

  await prisma.payment.create({
    data: {
      amount: '225.00',
      method: 'bank_transfer',
      status: 'COMPLETED',
      transactionId: 'TXN002',
      propertyId: property.id,
      reservationId: res2.id,
      guestId: guests[1].id,
    },
  });

  await prisma.payment.create({
    data: {
      amount: '100.00',
      method: 'credit_card',
      status: 'PENDING',
      propertyId: property.id,
      reservationId: res2.id,
      guestId: guests[1].id,
    },
  });

  console.log('✅ Created payments');

  // Create housekeeping tasks
  await prisma.housekeepingTask.create({
    data: {
      title: 'Clean Room 101',
      status: 'COMPLETED',
      propertyId: property.id,
      roomId: rooms[0].id,
    },
  });

  await prisma.housekeepingTask.create({
    data: {
      title: 'Prepare Room 102',
      status: 'IN_PROGRESS',
      propertyId: property.id,
      roomId: rooms[1].id,
    },
  });

  await prisma.housekeepingTask.create({
    data: {
      title: 'Inspect Room 103',
      status: 'PENDING',
      propertyId: property.id,
      roomId: rooms[2].id,
    },
  });

  await prisma.housekeepingTask.create({
    data: {
      title: 'Deep clean Room 104',
      status: 'PENDING',
      notes: 'Carpet cleaning required',
      propertyId: property.id,
      roomId: rooms[3].id,
    },
  });

  console.log('✅ Created housekeeping tasks');

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      action: 'RESERVATION_CREATED',
      details: 'New reservation created by reception',
      entityId: res1.id,
      entityType: 'Reservation',
      propertyId: property.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'CHECK_IN',
      details: 'Guest checked in',
      entityId: res1.id,
      entityType: 'Reservation',
      propertyId: property.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'PAYMENT_RECEIVED',
      details: 'Payment received from guest',
      entityType: 'Payment',
      propertyId: property.id,
    },
  });

  console.log('✅ Created activity logs');

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Users:');
  console.log(`  Reception: ${receptionUser.email} / reception123`);
  console.log(`  Manager: ${managerUser.email} / manager123`);
  console.log(`  Housekeeping: ${housekeepingUser.email} / housekeeping123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
