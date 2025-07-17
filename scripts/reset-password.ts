import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const resetPassword = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.log('Resetting admin password...');

  try {
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, 'admin'))
      .execute();

    console.log('Admin password has been reset to: admin123');
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

resetPassword().catch((err) => {
  console.error('Password reset failed:', err);
  process.exit(1);
});
