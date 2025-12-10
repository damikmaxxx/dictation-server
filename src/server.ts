import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './db';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error('❌ Server error:', e);
    process.exit(1);
  }
}

start();