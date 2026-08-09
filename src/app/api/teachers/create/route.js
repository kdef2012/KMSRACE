import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, role, pin, roomNumber, gradeLevel } = await request.json();

    if (!name || !role || !pin || !roomNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const teacher = await prisma.user.create({
      data: {
        name,
        role,
        pin,
        roomNumber,
        gradeLevel: gradeLevel ? parseInt(gradeLevel, 10) : null
      }
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
