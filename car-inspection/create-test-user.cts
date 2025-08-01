// create-test-user.cts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectToDB } from './src/lib/db';
import { User } from './src/models/User';

async function createTestUser() {
  await connectToDB();

  const existing = await User.findOne({ email: 'admin@example.com' });
  if (existing) {
    console.log('✅ Test user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await User.create({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Test admin user created successfully!');
  process.exit(0);
}

createTestUser().catch((err) => {
  console.error('❌ Error creating test user:', err);
  process.exit(1);
});
