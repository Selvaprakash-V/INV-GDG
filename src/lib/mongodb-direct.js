import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suriyaprakashrm25:innovaid@cluster1.4etn2z5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

// Global variable to store the connection
let connection = null;

export async function connectToDatabase() {
  if (connection) {
    console.log('Using existing MongoDB connection');
    return connection;
  }

  try {
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Alternative: Connect to a local MongoDB instance
export async function connectToLocalDatabase() {
  try {
    console.log('Attempting to connect to local MongoDB...');
    const localUri = 'mongodb://localhost:27017/innovaid';
    connection = await mongoose.connect(localUri, options);
    console.log('Connected to local MongoDB successfully');
    return connection;
  } catch (error) {
    console.error('Local MongoDB connection error:', error);
    throw error;
  }
}
