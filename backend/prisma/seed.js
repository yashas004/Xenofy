const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo account...');

  // First, clean up any existing demo account
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@xenofy.com' },
      include: { tenant: true }
    });

    if (existingUser) {
      console.log('Removing existing demo account...');
      await prisma.user.delete({
        where: { email: 'demo@xenofy.com' }
      });
      if (existingUser.tenant) {
        await prisma.tenant.delete({
          where: { id: existingUser.tenant.id }
        });
      }
    }
  } catch (error) {
    console.log('No existing demo account found, proceeding...');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('demo123', 10);

  console.log('Creating demo account...');

  // Create demo tenant and user
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: 'Xenofy Demo Store',
        domain: 'xenofy-store-1.myshopify.com',
        apiKey: 'shpat_example_demo_key_format_not_real_api_1234567890abcdefghijklmnopqrstuvwx' // Demo API key (safe format)
      }
    });

    const user = await tx.user.create({
      data: {
        email: 'demo@xenofy.com',
        password: hashedPassword,
        tenantId: tenant.id
      }
    });

    return { tenant, user };
  });

  console.log('Demo account created successfully!');
  console.log('Email: demo@xenofy.com');
  console.log('Password: demo123');
  console.log('Company: Xenofy Demo Store');
  console.log('Domain: xenofy-store-1.myshopify.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
