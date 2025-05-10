import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test wedding event
  const weddingEvent = await prisma.weddingEvent.create({
    data: {
      name: 'Test Wedding',
      slug: 'test-wedding',
      hashedPassword: await hash('event2025', 12),
    },
  });

  // Create test guest
  await prisma.guest.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      hashedPassword: await hash('test', 12),
      weddingEventId: weddingEvent.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });