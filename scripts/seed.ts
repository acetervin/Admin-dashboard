import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { users, events } from '../shared/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const seedDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.log('Seeding database...');

  // Create default admin user
  const adminPassword = 'admin123'; // You should change this in production
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).execute();
    
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'admin'
      });
      console.log('Created default admin user');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample events
    const sampleEvents = [
      {
        name: 'Family Counseling Workshop',
        description: 'A workshop focused on strengthening family bonds and improving communication.',
        date: new Date('2025-08-15T09:00:00Z'),
        endTime: new Date('2025-08-15T16:00:00Z'),
        location: 'Community Center, Nairobi',
        maxParticipants: 50,
        registrationFee: '1000.00',
        isActive: true,
        imageUrl: 'https://example.com/workshop.jpg'
      },
      {
        name: 'Youth Empowerment Summit',
        description: 'Empowering young people with skills and knowledge for a better future.',
        date: new Date('2025-09-01T10:00:00Z'),
        endTime: new Date('2025-09-01T18:00:00Z'),
        location: 'Youth Center, Mombasa',
        maxParticipants: 100,
        registrationFee: '500.00',
        isActive: true,
        imageUrl: 'https://example.com/summit.jpg'
      },
      {
        name: 'Community Support Group',
        description: 'Monthly meeting for community members to share experiences and support each other.',
        date: new Date('2025-07-30T14:00:00Z'),
        endTime: new Date('2025-07-30T16:00:00Z'),
        location: 'Family Support Center, Kisumu',
        maxParticipants: 30,
        registrationFee: '0.00',
        isActive: true,
        imageUrl: 'https://example.com/support.jpg'
      }
    ];

    for (const event of sampleEvents) {
      const existingEvent = await db
        .select()
        .from(events)
        .where(eq(events.name, event.name))
        .execute();

      if (existingEvent.length === 0) {
        await db.insert(events).values(event);
        console.log(`Created sample event: ${event.name}`);
      } else {
        console.log(`Event "${event.name}" already exists`);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
