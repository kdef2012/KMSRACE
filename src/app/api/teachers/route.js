import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: {
          in: ['CORE_TEACHER', 'ENCORE_TEACHER', 'EC_TEACHER', 'ADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        gradeLevel: true,
        roomNumber: true,
        pin: true
      },
      orderBy: {
        name: 'asc',
      }
    });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
