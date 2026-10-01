import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

/**
 * Shape of the cached connection object stored on the global scope.
 * - `conn` holds the active Mongoose instance once connected.
 * - `promise` holds the in-flight connection promise so concurrent
 *   callers await the same connection instead of opening new ones.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the Node.js global type so TypeScript knows about our cache.
 * Using the global object is necessary because Next.js hot-reloads
 * modules in development, which would otherwise create a new
 * connection on every reload and exhaust the database's connection pool.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Reuse the existing cache if present, otherwise initialize it once.
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

/**
 * Connects to MongoDB and returns the Mongoose instance.
 * Safe to call from any server-side code (route handlers, server
 * actions, etc.) — repeated calls return the cached connection.
 */
async function connectToDatabase(): Promise<Mongoose> {
  // Return the already-established connection immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // Start a new connection only if one isn't already in progress.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      // Disable command buffering so queries fail fast when disconnected
      // instead of silently queuing until a timeout.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise so the next call can retry a fresh connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
