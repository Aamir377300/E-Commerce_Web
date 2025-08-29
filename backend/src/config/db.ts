import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MongoDB URI not set in environment variables');
  process.exit(1);
}

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoUri!); // <-- Add ! to assert non-null after check
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

export default connectToMongoDB;
