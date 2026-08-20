import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const nelsons = await prisma.user.findMany({
      where: { name: { contains: 'Nelson', mode: 'insensitive' } },
      include: {
        rosters: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, nelsons });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
