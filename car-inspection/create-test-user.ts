// create-test-user.ts
import { connectToDB } from './src/lib/db';
import { User } from './src/models/User';
import bcrypt from 'bcrypt';

async function createTestUser() {
  await connectToDB();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = new User({
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  await user.save();
  console.log('✅ Test admin user created!');
  process.exit();
}

createTestUser().catch(console.error);
