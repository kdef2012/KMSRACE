import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { teacherName, role, roomNumber, rosters } = await request.json();

    let teacher = await prisma.user.findFirst({
      where: { name: { contains: teacherName, mode: 'insensitive' } }
    });

    if (!teacher) {
      teacher = await prisma.user.create({
        data: {
          name: teacherName,
          role: role || 'ENCORE_TEACHER',
          roomNumber: roomNumber || 'TBD',
          gradeLevel: 6
        }
      });
    }

    let totalCreated = 0;

    for (const [periodName, students] of Object.entries(rosters)) {
      let roster = await prisma.roster.findFirst({
        where: {
          name: periodName,
          teacherId: teacher.id
        }
      });

      if (!roster) {
        roster = await prisma.roster.create({
          data: {
            name: periodName,
            type: role === 'CORE_TEACHER' ? 'CORE' : 'ENCORE',
            teacherId: teacher.id
          }
        });
      }

      for (const s of students) {
        const existing = await prisma.student.findFirst({
          where: {
            firstName: s.firstName,
            lastName: s.lastName,
            rosters: { some: { id: roster.id } }
          }
        });

        if (!existing) {
          // If the student doesn't exist at all in the DB, create them. Otherwise just connect.
          const globalStudent = await prisma.student.findFirst({
            where: { firstName: s.firstName, lastName: s.lastName }
          });

          if (globalStudent) {
            await prisma.student.update({
              where: { id: globalStudent.id },
              data: { rosters: { connect: { id: roster.id } } }
            });
          } else {
            await prisma.student.create({
              data: {
                firstName: s.firstName,
                lastName: s.lastName,
                gradeLevel: s.gradeLevel,
                rosters: { connect: { id: roster.id } }
              }
            });
          }
          totalCreated++;
        }
      }
    }

    return NextResponse.json({ success: true, message: "Processed " + totalCreated + " new student-roster connections for " + teacherName + "!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

