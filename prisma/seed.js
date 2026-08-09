const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Setup Admin
  await prisma.user.create({
    data: {
      name: 'KMS Admin',
      role: 'ADMIN',
      pin: '2627',
      roomNumber: 'Office'
    }
  });

  // Setup Mock Teachers
  const coreTeacher = await prisma.user.create({
    data: {
      name: 'Mrs. Core',
      role: 'CORE_TEACHER',
      pin: '1111',
      roomNumber: '101'
    }
  });

  const encoreTeacher = await prisma.user.create({
    data: {
      name: 'Mr. Encore',
      role: 'ENCORE_TEACHER',
      pin: '2222',
      roomNumber: 'Gym'
    }
  });

  // Setup Mock Students
  for (let grade of [6, 7, 8]) {
    for (let i = 1; i <= 20; i++) {
      await prisma.student.create({
        data: {
          firstName: `Student${i}`,
          lastName: `Grade${grade}`,
          gradeLevel: grade
        }
      });
    }
  }

  // Setup initial settings
  await prisma.settings.create({
    data: {
      goalType: 'POINTS',
      goalValue: '100'
    }
  });

  console.log('Seeding complete! (Admin PIN: 2627, Core: 1111, Encore: 2222)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
