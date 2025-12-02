import { MongoClient, Db, ObjectId } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaveamark';

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDB(): Promise<Db> {
  if (!db) {
    return connectDB();
  }
  return db;
}

export { ObjectId };
