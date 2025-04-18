// lib/databse/mongoose.ts
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Missing MONGODB_URL in environment variables.");
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// @ts-ignore
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  // @ts-ignore
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "yoshi",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};