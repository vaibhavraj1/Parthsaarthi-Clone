import { MongoClient, Db, Collection } from 'mongodb';

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
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
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
    return found ? { ...found } : null;
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
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return true;
        }
      }
      return false;
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
    const existing = await db.collection('releases').findOne({});
    if (!existing) {
      const now = new Date();
      const releaseAt = new Date(now.getTime() + 3 * 60 * 1000).toISOString();
      const releaseId = 'demo_consulting_01';

      await db.collection('releases').insertOne({
        _id: releaseId,
        mentorId: 'mentor_rahul',
        mentorName: 'Rahul Sharma',
        title: 'Consulting Case Preparation',
        description:
          'Practice case interviews, discuss problem-solving approaches, and receive feedback for upcoming management consulting SIP selections (McKinsey, BCG, Bain).',
        category: 'Management Consulting',
        releaseAt: releaseAt,
        status: 'scheduled',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      await db.collection('slots').insertMany([
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
      ]);
      console.log('Auto-seeded default Consulting Case Preparation demo release.');
    }
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
      console.warn('MongoDB connection failed, falling back to memory store:', err);
    }
  }

  const memDb = new InMemoryDb();
  await ensureSeed(memDb);
  return { db: memDb as any, isAtlasOrLocal: false };
}
