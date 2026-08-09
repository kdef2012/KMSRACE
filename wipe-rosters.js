const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.roster.deleteMany()
  .then(() => console.log('Wiped all rosters'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
