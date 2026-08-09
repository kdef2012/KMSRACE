const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Reading exported CSV...');
  let csvData = fs.readFileSync('students_exported.csv', 'utf8');
  
  if (csvData.charCodeAt(0) === 0xFEFF) {
    csvData = csvData.slice(1);
  }

  // Parse CSV (skip header)
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Found ${records.length} students. Process starting...`);

  // Map to hold unique teachers: { "Teacher Name": { roomNumber, gradeLevel } }
  const teachersMap = {};

  // Clean and prepare students
  const students = [];

  for (const record of records) {
    const fullName = record['Student Name'];
    const roomNumber = record['Room #'];
    const gradeLevel = parseInt(record['Grade Level'], 10);
    const teacherName = record['Primary Teacher'];

    if (!fullName) continue;

    // Split name (assuming "Last, First" format based on sample data)
    let firstName = '';
    let lastName = '';
    if (fullName.includes(',')) {
      const parts = fullName.split(',');
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    } else {
      const parts = fullName.split(' ');
      firstName = parts[0].trim();
      lastName = parts.slice(1).join(' ').trim();
    }

    students.push({
      firstName,
      lastName,
      gradeLevel
    });

    if (teacherName && !teachersMap[teacherName]) {
      teachersMap[teacherName] = {
        roomNumber,
        gradeLevel
      };
    }
  }

  // Clear existing data (optional, but good for a clean slate, except for Admin)
  await prisma.roster.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany({
    where: { role: { not: 'ADMIN' } }
  });

  console.log('Database cleared of mock data.');

  // Create Teachers
  console.log('Creating Teachers...');
  let teacherCount = 0;
  for (const [name, info] of Object.entries(teachersMap)) {
    // Generate PIN from room (e.g. C108 -> extract numbers, or just pad it)
    // Since rooms are like C108, let's just strip non-digits to make a numeric PIN, then pad to 4.
    const digits = info.roomNumber.replace(/\D/g, '');
    let pin = digits.padStart(4, '0');
    if (pin === '0000') pin = '1234'; // Fallback if no digits

    await prisma.user.create({
      data: {
        name: name,
        role: 'CORE_TEACHER',
        roomNumber: info.roomNumber,
        pin: pin,
        gradeLevel: info.gradeLevel
      }
    });
    teacherCount++;
  }
  console.log(`Created ${teacherCount} Core Teachers.`);

  // Create Students
  console.log('Creating Students...');
  await prisma.student.createMany({
    data: students
  });
  console.log(`Created ${students.length} Students.`);

  console.log('Import completely successful!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
