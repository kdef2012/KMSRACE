const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importTeachers() {
  const data = JSON.parse(fs.readFileSync('teachers_backup.json', 'utf8'));
  for (const user of data) {
    try {
      await prisma.user.create({
        data: {
          name: user.name,
          pin: user.pin,
          role: user.role,
          roomNumber: user.roomNumber,
          gradeLevel: user.gradeLevel,
        }
      });
      console.log('Imported: ' + user.name);
    } catch (e) {
      console.error('Failed to import ' + user.name + ' - ' + e.message);
    }
  }
  console.log('Done importing.');
}

importTeachers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
