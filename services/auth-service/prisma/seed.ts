import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma';
import { SEED, SEED_PASSWORD } from '@tzw/seed-data/src/ids';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const users = [
  {
    id: SEED.users.admin,
    firstName: 'Admin',
    lastName: 'TZW',
    email: 'admin@tzw.com',
    role: 'ADMIN' as const,
  },
  {
    id: SEED.users.inspector,
    firstName: 'Patrick',
    lastName: 'Inspector',
    email: 'inspector@tzw.com',
    role: 'INSPECTOR' as const,
  },
  {
    id: SEED.users.user,
    firstName: 'Test',
    lastName: 'User',
    email: 'user@tzw.com',
    role: 'USER' as const,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, passwordHash },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        passwordHash,
      },
    });
  }

  console.log('Auth users seeded (password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
