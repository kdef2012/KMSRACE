const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportTeachers() {
  const users = await prisma.user.findMany();
  fs.writeFileSync('teachers_backup.json', JSON.stringify(users, null, 2));
  console.log('Exported ' + users.length + ' users.');
}

exportTeachers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
