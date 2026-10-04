/**
 * Database Seed Script for Parthsaarthi Scheduled Slot Release.
 * Seeds two users: mentor Gayathri Arvind and student PGP42.
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
    await db.collection('bookings').createIndex({ slotId: 1 });
    await db.collection('releases').createIndex({ releaseAt: 1 });
    await db.collection('slots').createIndex({ releaseId: 1 });

    // 2. Clear old demo data
    await db.collection('releases').deleteMany({});
    await db.collection('slots').deleteMany({});
    await db.collection('bookings').deleteMany({});
    await db.collection('users').deleteMany({});

    // 3. Seed the mentor and student profiles
    const now = new Date().toISOString();
    await db.collection('users').insertMany([
      {
        _id: 'mentor_pgp41',
        name: 'Gayathri Arvind',
        email: 'pgp41@iiml.ac.in',
        role: 'mentor',
        createdAt: now,
      },
      {
        _id: 'student_pgp42',
        name: 'PGP42',
        email: 'pgp42@iiml.ac.in',
        role: 'student',
        createdAt: now,
      },
    ]);
    console.log('Successfully seeded users: Gayathri Arvind & Student PGP42 with clean slate for releases.');
  } catch (err: any) {
    console.warn('Seeding note:', err.message);
  } finally {
    await client.close();
  }
}

main();
