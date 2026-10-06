import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server Running', year: 2026 });
});

// Database + Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed:', error.message);
    process.exit(1);
  }
};

startServer();