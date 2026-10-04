import { MongoClient } from 'mongodb';

/**
 * MongoDB client singleton for Next.js App Router.
 * Supports MongoDB Atlas, local MongoDB, or resilient local store.
 */

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _inMemoryDb: Record<string, any[]> | undefined;
}

// Fallback in-memory store if MongoDB is not reachable or MONGODB_URI is not provided
class InMemoryCollection {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    if (!global._inMemoryDb) {
      global._inMemoryDb = {};
    }
    if (!global._inMemoryDb[collectionName]) {
      global._inMemoryDb[collectionName] = [];
    }
  }

  private get items(): any[] {
    return global._inMemoryDb![this.collectionName];
  }

  async find(query: any = {}) {
    let result = this.items.filter((item) => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined) {
          // If query[key] is an object with $in
          if (typeof query[key] === 'object' && query[key] !== null && Array.isArray(query[key].$in)) {
            if (!query[key].$in.includes(item[key])) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });

    return {
      sort: (sortObj: any) => {
        const sortKey = Object.keys(sortObj)[0];
        const dir = sortObj[sortKey];
        result.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return dir === 1 ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return dir === 1 ? 1 : -1;
          return 0;
        });
        return {
          toArray: async () => [...result],
        };
      },
      toArray: async () => [...result],
    };
  }

  async findOne(query: any = {}) {
    const found = this.items.find((item) => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async insertOne(doc: any) {
    const item = {
      ...doc,
      _id: doc._id || Math.random().toString(36).substring(2, 9),
    };
    this.items.push(item);
    return { acknowledged: true, insertedId: item._id };
  }

  async insertMany(docs: any[]) {
    const insertedIds: Record<number, string> = {};
    docs.forEach((doc, idx) => {
      const item = {
        ...doc,
        _id: doc._id || Math.random().toString(36).substring(2, 9),
      };
      this.items.push(item);
      insertedIds[idx] = item._id;
    });
    return { acknowledged: true, insertedIds };
  }

  async updateOne(filter: any, update: any) {
    const idx = this.items.findIndex((item) => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    if (update.$set) {
      this.items[idx] = { ...this.items[idx], ...update.$set };
    }
    if (update.$push) {
      for (const pushKey of Object.keys(update.$push)) {
        if (!Array.isArray(this.items[idx][pushKey])) {
          this.items[idx][pushKey] = [];
        }
        this.items[idx][pushKey].push(update.$push[pushKey]);
      }
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter: any) {
    const idx = this.items.findIndex((item) => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (idx === -1) return { deletedCount: 0 };
    this.items.splice(idx, 1);
    return { deletedCount: 1 };
  }

  async deleteMany(filter: any = {}) {
    if (Object.keys(filter).length === 0) {
      const count = this.items.length;
      this.items.length = 0;
      return { deletedCount: count };
    }
    const initialLen = this.items.length;
    global._inMemoryDb![this.collectionName] = this.items.filter((item) => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined) {
          if (typeof filter[key] === 'object' && filter[key] !== null && Array.isArray(filter[key].$in)) {
            if (filter[key].$in.includes(item[key])) return false;
          } else if (item[key] === filter[key]) {
            return false;
          }
        }
      }
      return true;
    });
    return { deletedCount: initialLen - this.items.length };
  }

  async countDocuments(query: any = {}) {
    const cursor = await this.find(query);
    const arr = await cursor.toArray();
    return arr.length;
  }

  async createIndex() {
    return 'index_created';
  }
}

class InMemoryDb {
  collection(name: string) {
    return new InMemoryCollection(name);
  }
}

let _isSeeded = false;

async function ensureSeed(db: any) {
  if (_isSeeded) return;
  try {
    // Purge any legacy hardcoded demo releases/slots/bookings if present
    await db.collection('releases').deleteMany({
      _id: { $in: ['demo_consulting_01', 'demo_finance_01'] },
    });
    await db.collection('slots').deleteMany({
      releaseId: { $in: ['demo_consulting_01', 'demo_finance_01'] },
    });

    // Ensure the two authorized personas exist.
    const existingMentor = await db.collection('users').findOne({ _id: 'mentor_pgp41' });
    const existingStudent = await db.collection('users').findOne({ _id: 'student_pgp42' });

    const now = new Date().toISOString();
    if (!existingMentor) {
      await db.collection('users').insertOne({
        _id: 'mentor_pgp41',
        name: 'Gayathri Arvind',
        email: 'pgp41@iiml.ac.in',
        role: 'mentor',
        createdAt: now,
      });
    } else {
      await db.collection('users').updateOne(
        { _id: 'mentor_pgp41' },
        { $set: { name: 'Gayathri Arvind' } }
      );
    }

    const releasesWithOldMentorName = await db.collection('releases')
      .find({ mentorName: { $in: ['Rahul Sharma', 'PGP41'] } });
    for (const release of await releasesWithOldMentorName.toArray()) {
      await db.collection('releases').updateOne(
        { _id: release._id },
        { $set: { mentorName: 'Gayathri Arvind' } }
      );
    }
    const bookingsWithOldMentorName = await db.collection('bookings')
      .find({ mentorName: { $in: ['Rahul Sharma', 'PGP41'] } });
    for (const booking of await bookingsWithOldMentorName.toArray()) {
      await db.collection('bookings').updateOne(
        { _id: booking._id },
        { $set: { mentorName: 'Gayathri Arvind' } }
      );
    }

    if (!existingStudent) {
      await db.collection('users').insertOne({
        _id: 'student_pgp42',
        name: 'PGP42',
        email: 'pgp42@iiml.ac.in',
        role: 'student',
        createdAt: now,
      });
    }

    // Clean up any legacy old user records
    await db.collection('users').deleteMany({
      _id: { $in: ['mentor_rahul', 'student_vaibhav'] },
    });

    _isSeeded = true;
  } catch (err) {
    console.warn('Auto-seed check failed:', err);
  }
}

export async function getDatabase(): Promise<{
  db: any;
  isAtlasOrLocal: boolean;
}> {
  if (uri) {
    try {
      if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
          client = new MongoClient(uri, {
            ...options,
            serverSelectionTimeoutMS: 2000,
          });
          global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
      } else {
        client = new MongoClient(uri, {
          ...options,
          serverSelectionTimeoutMS: 2000,
        });
        clientPromise = client.connect();
      }
      const connectedClient = await clientPromise;
      const db = connectedClient.db();
      await ensureSeed(db);
      return { db, isAtlasOrLocal: true };
    } catch (err) {
      // MongoDB connection failed, fall back to in-memory store
    }
  }

  const memDb = new InMemoryDb();
  await ensureSeed(memDb);
  return { db: memDb as any, isAtlasOrLocal: false };
}
