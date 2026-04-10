import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertUser(email: string, password: string, role: Role) {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const passwordHash = hashSync(password, rounds);
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { password: passwordHash, role, isActive: true },
    create: { email: normalizedEmail, password: passwordHash, role, isActive: true },
  });
}

async function main() {
  await upsertUser('admin@service.com', 'Admin123!', 'ADMIN');
  await upsertUser('frontline@service.com', 'Frontline123!', 'FRONTLINE');
  await upsertUser('manager@service.com', 'Manager123!', 'MANAGER');
  await upsertUser('mechanic@service.com', 'Mechanic123!', 'MEKANIK');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
