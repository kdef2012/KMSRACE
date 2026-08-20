import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const nelson = await prisma.user.findFirst({
      where: { name: { contains: 'Nelson', mode: 'insensitive' } }
    });

    if (!nelson) return NextResponse.json({ success: false, error: 'Nelson not found' });

    const mappings = {
      'Period 81': 'Period 1',
      'Period 82': 'Period 2',
      'Period 83': 'Period 3'
    };

    let fixed = 0;

    for (const [oldName, newName] of Object.entries(mappings)) {
      const oldRoster = await prisma.roster.findFirst({
        where: { name: oldName, teacherId: nelson.id },
        include: { students: true }
      });
      
      if (oldRoster) {
        let newRoster = await prisma.roster.findFirst({
          where: { name: newName, teacherId: nelson.id }
        });

        if (!newRoster) {
          // Just rename it
          await prisma.roster.update({
            where: { id: oldRoster.id },
            data: { name: newName }
          });
          fixed += oldRoster.students.length;
        } else {
          // Connect students to new, disconnect from old
          for (const s of oldRoster.students) {
            await prisma.roster.update({
              where: { id: newRoster.id },
              data: {
                students: {
                  connect: { id: s.id }
                }
              }
            });
            fixed++;
          }
          await prisma.roster.delete({ where: { id: oldRoster.id } });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Successfully moved " + fixed + " students into Period 1, 2, and 3!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


