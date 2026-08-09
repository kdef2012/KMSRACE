import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { firstName, lastName, gradeLevel } = await request.json();

    if (!firstName || !lastName || !gradeLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        gradeLevel: parseInt(gradeLevel, 10)
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
