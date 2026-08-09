import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { role, pin } = await request.json();

    if (!role || !pin) {
      return NextResponse.json({ error: 'Missing role or pin' }, { status: 400 });
    }

    const teacher = await prisma.user.findFirst({
      where: { role, pin }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Incorrect Role or PIN' }, { status: 401 });
    }

    // Success - in a real app, set an HTTP-only cookie here.
    return NextResponse.json({
      id: teacher.id,
      name: teacher.name,
      role: teacher.role,
      roomNumber: teacher.roomNumber,
      gradeLevel: teacher.gradeLevel
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
