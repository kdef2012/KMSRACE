import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { role, gradeLevel, roomNumber, name } = await request.json();

    const data = {};
    if (role !== undefined) data.role = role;
    if (gradeLevel !== undefined) data.gradeLevel = gradeLevel;
    if (name !== undefined) data.name = name;
    if (roomNumber !== undefined) {
      data.roomNumber = roomNumber;
      data.pin = roomNumber.replace(/\D/g, '').padStart(4, '0') || '1234';
    }

    const updatedTeacher = await prisma.user.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // First, delete related records if necessary, depending on schema constraints.
    // Prisma might handle cascades, but it's safer to ensure rosters are deleted.
    await prisma.roster.deleteMany({
      where: { teacherId: id }
    });
    
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
