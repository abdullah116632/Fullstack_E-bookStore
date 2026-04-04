import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // For MongoDB Atlas, disable SSL certificate verification for development
    if (process.env.MONGODB_URI.includes('mongodb+srv://')) {
      mongooseOptions.tls = true;
      mongooseOptions.tlsInsecure = true; // Allow self-signed certificates (dev only)
      mongooseOptions.retryWrites = true;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error(`  Hint: Check if your MongoDB Atlas IP whitelist includes your current IP`);
    console.error(`  Or use local MongoDB: MONGODB_URI=mongodb://localhost:27017/ebook-marketplace`);
    process.exit(1);
  }
};

export default connectDB;
