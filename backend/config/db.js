const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in backend/.env');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `MongoDB Connected Successfully: ${conn.connection.host}`
    );

    return conn;

  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;