import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { pin: '0213' },
      select: { name: true, role: true, roomNumber: true }
    });
    
    if (user) {
      return NextResponse.json({ success: true, message: `Yes, ${user.name} (${user.role}, Room ${user.roomNumber}) has the PIN 0213.` });
    } else {
      return NextResponse.json({ success: true, message: 'No one has the PIN 0213.' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
