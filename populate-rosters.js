const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let data = fs.readFileSync('students_exported.csv', 'utf8');
  if (data.charCodeAt(0) === 0xFEFF) data = data.slice(1);
  const records = parse(data, { columns: true, skip_empty_lines: true });

  const map = {};
  for (const r of records) {
    const teacherName = r['Primary Teacher'];
    if (!teacherName) continue;
    if (!map[teacherName]) map[teacherName] = { room: r['Room #'], grades: {}, students: [] };
    const grade = parseInt(r['Grade Level'], 10);
    map[teacherName].grades[grade] = (map[teacherName].grades[grade] || 0) + 1;
    
    let firstName = '';
    let lastName = '';
    const fullName = r['Student Name'];
    if (fullName.includes(',')) {
      const parts = fullName.split(',');
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    } else {
      const parts = fullName.split(' ');
      firstName = parts[0].trim();
      lastName = parts.slice(1).join(' ').trim();
    }
    map[teacherName].students.push({ firstName, lastName, gradeLevel: grade });
  }

  // First, fetch all students and teachers from DB to get their IDs
  const dbStudents = await prisma.student.findMany();
  const dbTeachers = await prisma.user.findMany();

  for (const [name, info] of Object.entries(map)) {
    // Determine the majority grade
    let bestGrade = 6;
    let maxCount = 0;
    for (const [g, count] of Object.entries(info.grades)) {
      if (count > maxCount) {
        maxCount = count;
        bestGrade = parseInt(g, 10);
      }
    }

    const teacher = dbTeachers.find(t => t.name === name);
    if (!teacher) continue;

    // Update the teacher's gradeLevel to the true majority grade
    await prisma.user.update({
      where: { id: teacher.id },
      data: { gradeLevel: bestGrade }
    });
    console.log(`Updated ${name} to Grade ${bestGrade}`);

    if (teacher.role === 'CORE_TEACHER') {
      // Find the DB IDs for the students assigned to this teacher
      const studentIds = [];
      for (const s of info.students) {
        const dbS = dbStudents.find(x => x.firstName === s.firstName && x.lastName === s.lastName && x.gradeLevel === s.gradeLevel);
        if (dbS) studentIds.push({ id: dbS.id });
      }

      if (studentIds.length > 0) {
        // Create or update Period 1 roster
        const existing = await prisma.roster.findFirst({
          where: { teacherId: teacher.id, name: 'Period 1' }
        });

        if (existing) {
          await prisma.roster.update({
            where: { id: existing.id },
            data: { students: { set: studentIds } }
          });
        } else {
          await prisma.roster.create({
            data: {
              name: 'Period 1',
              type: 'CORE',
              teacherId: teacher.id,
              students: { connect: studentIds }
            }
          });
        }
        console.log(`Populated Period 1 for ${name} with ${studentIds.length} students.`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
