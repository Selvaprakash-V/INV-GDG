import mongoose from 'mongoose';
import { getEnv } from '../config/env';
import { DB } from '../config/constants';
import { logger } from '../core/logger';

// Single connection module (Singleton). Replaces the three competing
// connection helpers and their hardcoded-credential fallbacks.

const globalCache = globalThis.__trackitMongo ?? (globalThis.__trackitMongo = { conn: null, promise: null });

export async function connectDb() {
  if (globalCache.conn && mongoose.connection.readyState === 1) return globalCache.conn;

  if (!globalCache.promise) {
    const env = getEnv();
    mongoose.set('strictQuery', true);
    mongoose.set('autoIndex', env.MONGODB_AUTO_INDEX);
    globalCache.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
        serverSelectionTimeoutMS: DB.SERVER_SELECTION_TIMEOUT_MS,
        socketTimeoutMS: DB.SOCKET_TIMEOUT_MS,
        retryWrites: true,
        // Default for ordinary reads; read-heavy repositories opt into
        // MONGODB_READ_PREFERENCE (replicas) explicitly.
        readPreference: 'primary',
      })
      .then((m) => {
        logger.info('mongodb connected', { host: m.connection.host });
        m.connection.on('disconnected', () => logger.warn('mongodb disconnected'));
        m.connection.on('error', (err) => logger.error('mongodb error', { err }));
        return m;
      })
      .catch((err) => {
        globalCache.promise = null;
        throw err;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

/** Read preference for analytics/listing queries (read-replica offloading). */
export function analyticsReadPreference() {
  return getEnv().MONGODB_READ_PREFERENCE;
}

export async function pingDb() {
  await connectDb();
  await mongoose.connection.db.admin().command({ ping: 1 });
  return true;
}

/** Test hook. */
export async function disconnectDb() {
  await mongoose.disconnect();
  globalCache.conn = null;
  globalCache.promise = null;
}
