import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Missing teacherId' }, { status: 400 });
    }

    const rosters = await prisma.roster.findMany({
      where: { teacherId },
      include: {
        students: {
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }
      }
    });
    
    return NextResponse.json(rosters);
  } catch (error) {
    console.error('Error fetching rosters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { teacherId, name, type, studentIds } = await request.json();

    if (!teacherId || !name || !type || !studentIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First, check if roster exists
    const existingRoster = await prisma.roster.findFirst({
      where: { teacherId, name, type }
    });

    let roster;
    if (existingRoster) {
      // Update existing roster's students
      roster = await prisma.roster.update({
        where: { id: existingRoster.id },
        data: {
          students: {
            set: studentIds.map(id => ({ id }))
          }
        },
        include: { students: true }
      });
    } else {
      // Create new roster
      roster = await prisma.roster.create({
        data: {
          teacherId,
          name,
          type,
          students: {
            connect: studentIds.map(id => ({ id }))
          }
        },
        include: { students: true }
      });
    }

    return NextResponse.json(roster);
  } catch (error) {
    console.error('Error saving roster:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
