import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suriyaprakashrm25:innovaid@cluster1.4etn2z5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log('Attempting to connect to MongoDB...');

  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
          cached.conn = null;
          cached.promise = null;
        });
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    console.log('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Reset the connection cache to allow retry on next request
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
