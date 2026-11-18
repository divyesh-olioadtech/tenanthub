import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 1. Super Admin: no tenant (tenantId = null). findFirst because a unique
  //    index on (tenantId, email) does not treat NULL tenantIds as equal.
  const saEmail = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin@tenanthub.com';
  const saPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const existing = await prisma.user.findFirst({ where: { email: saEmail, tenantId: null } });
  if (!existing) {
    await prisma.user.create({
      data: { email: saEmail, passwordHash: await argon2.hash(saPassword), role: Role.SUPER_ADMIN },
    });
  }

  // 2. Two tenants, each with an admin, a normal user and one project.
  const password = await argon2.hash('Password123!');
  for (const t of [
    { name: 'Acme Inc', slug: 'acme' },
    { name: 'Globex Corp', slug: 'globex' },
  ]) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
    for (const u of [
      { email: `admin@${t.slug}.com`, role: Role.TENANT_ADMIN },
      { email: `user@${t.slug}.com`, role: Role.TENANT_USER },
    ]) {
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
        update: {},
        create: { ...u, passwordHash: password, tenantId: tenant.id },
      });
    }
    const hasProject = await prisma.project.findFirst({ where: { tenantId: tenant.id } });
    if (!hasProject) {
      await prisma.project.create({
        data: { name: `${t.name} First Project`, description: 'Seeded project', tenantId: tenant.id },
      });
    }
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
