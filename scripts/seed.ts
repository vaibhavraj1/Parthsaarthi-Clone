/**
 * Database Seed Script for Parthsaarthi Scheduled Slot Release MVP.
 * Can be run via: npm run seed
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parthsaarthi';

async function main() {
  console.log('Connecting to database...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db: any = client.db();
    console.log('Connected successfully to MongoDB.');

    // 1. Create indexes
    await db.collection('bookings').createIndex({ slotId: 1 }, { unique: true });
    await db.collection('releases').createIndex({ releaseAt: 1 });
    await db.collection('slots').createIndex({ releaseId: 1 });
    console.log('Unique indexes verified on bookings.slotId.');

    // 2. Clear old demo data
    await db.collection('releases').deleteMany({
      _id: { $in: ['demo_consulting_01', 'demo_finance_01'] },
    });
    await db.collection('slots').deleteMany({
      releaseId: { $in: ['demo_consulting_01', 'demo_finance_01'] },
    });
    await db.collection('bookings').deleteMany({});
    await db.collection('users').deleteMany({});

    // 3. Seed users
    const now = new Date();
    await db.collection('users').insertMany([
      {
        _id: 'mentor_rahul',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@iiml.ac.in',
        role: 'mentor',
        createdAt: now.toISOString(),
      },
      {
        _id: 'student_vaibhav',
        name: 'Vaibhav Raj Sahni',
        email: 'vaibhav.sahni@iiml.ac.in',
        role: 'student',
        createdAt: now.toISOString(),
      },
    ]);
    console.log('Seeded users (Mentor Rahul Sharma, Student Vaibhav Raj Sahni).');

    // 4. Seed Consulting Case Preparation (Release scheduled 3 minutes in future)
    const releaseId = 'demo_consulting_01';
    const releaseAt = new Date(now.getTime() + 3 * 60 * 1000).toISOString();

    await db.collection('releases').insertOne({
      _id: releaseId,
      mentorId: 'mentor_rahul',
      mentorName: 'Rahul Sharma',
      title: 'Consulting Case Preparation',
      description:
        'Practice case interviews, discuss problem-solving approaches, and receive feedback for upcoming management consulting SIP shortlists (McKinsey, BCG, Bain).',
      category: 'Management Consulting',
      releaseAt: releaseAt,
      status: 'scheduled',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    const slots = [
      {
        _id: 'slot_case_01',
        releaseId,
        startTime: '03:00 PM',
        endTime: '03:30 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Profitability framework & live case',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_02',
        releaseId,
        startTime: '03:30 PM',
        endTime: '04:00 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Market entry case & guesstimates',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_03',
        releaseId,
        startTime: '04:00 PM',
        endTime: '04:30 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'M&A and value chain analysis',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_04',
        releaseId,
        startTime: '04:30 PM',
        endTime: '05:00 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Unconventional problem-solving & HR questions',
        isBooked: false,
        createdAt: now.toISOString(),
      },
    ];

    await db.collection('slots').insertMany(slots);
    console.log(`Seeded session 'Consulting Case Preparation' with 4 slots scheduled for ${releaseAt}.`);

    console.log('Seeding completed successfully!');
  } catch (err: any) {
    console.warn('Seeding note: (In-memory fallback will automatically provide seed if MongoDB is offline):', err.message);
  } finally {
    await client.close();
  }
}

main();
