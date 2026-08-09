import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    await prisma.dailyLog.deleteMany({});
    return NextResponse.json({ success: true, message: 'All race data has been wiped.' });
  } catch (error) {
    console.error('Error wiping logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
